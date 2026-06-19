import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { DatabaseService } from '../database/database.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { RedisService } from '../redis/redis.service';
import type { UpdateMessagingConfigDto } from './dto/update-messaging-config.dto';
import { MessagingConfigDto } from './dto/messaging-config-response.dto';
import { VARIABLE_CATALOG } from './variables/variable-catalog';
import type { VariableDefinition } from './variables/variable-resolver.types';

export interface ResolvedCredentials {
  accountSid: string;
  authToken: string;
  from: string;
}

export interface TwilioTemplate {
  contentSid: string;
  friendlyName: string;
  body: string;
  variableCount: number;
  language: string;
}

const TEMPLATES_CACHE_TTL_SECONDS = 300;

@Injectable()
export class MessagingConfigService {
  private readonly logger = new Logger(MessagingConfigService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly tenantContext: TenantContextService,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async createOrGetSubaccount(
    restaurantId: string,
  ): Promise<MessagingConfigDto> {
    const { accountId } = this.tenantContext.get();

    const existing = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT id, account_id, restaurant_id, twilio_subaccount_sid,
               twilio_whatsapp_from, status, created_at
        FROM messaging_config
        WHERE restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );
    if (existing.length) return this.mapRow(existing[0]);

    const masterSid = this.configService.get<string>(
      'whatsapp.twilio.masterAccountSid',
    );
    const masterToken = this.configService.get<string>(
      'whatsapp.twilio.masterAuthToken',
    );
    if (!masterSid || !masterToken) {
      throw new BadRequestException(
        'Credenciais master da Twilio não configuradas',
      );
    }

    const masterClient = twilio(masterSid, masterToken);
    const subaccount = await masterClient.api.accounts.create({
      friendlyName: `Fidelizza - ${restaurantId}`,
    });
    const tokenEnc = this.cryptoService.encrypt(subaccount.authToken);

    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        INSERT INTO messaging_config
          (account_id, restaurant_id, twilio_subaccount_sid, twilio_subaccount_auth_token_enc, status)
        VALUES
          (${accountId}, ${restaurantId}, ${subaccount.sid}, ${tokenEnc}, 'inactive')
        RETURNING id, account_id, restaurant_id, twilio_subaccount_sid,
                  twilio_whatsapp_from, status, created_at
      `,
    );
    return this.mapRow(rows[0]);
  }

  async getConfig(restaurantId: string): Promise<MessagingConfigDto | null> {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT id, account_id, restaurant_id, twilio_subaccount_sid,
               twilio_whatsapp_from, status, created_at
        FROM messaging_config
        WHERE restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );
    if (!rows.length) return null;
    return this.mapRow(rows[0]);
  }

  async updateConfig(
    restaurantId: string,
    dto: UpdateMessagingConfigDto,
  ): Promise<MessagingConfigDto> {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        UPDATE messaging_config
        SET
          twilio_whatsapp_from = COALESCE(${dto.twilioWhatsappFrom ?? null}, twilio_whatsapp_from),
          status                = COALESCE(${dto.status ?? null}, status)
        WHERE restaurant_id = ${restaurantId} AND account_id = ${accountId}
        RETURNING id, account_id, restaurant_id, twilio_subaccount_sid,
                  twilio_whatsapp_from, status, created_at
      `,
    );
    if (!rows.length)
      throw new NotFoundException('Configuração de mensageria não encontrada');
    return this.mapRow(rows[0]);
  }

  async resolveCredentials(
    restaurantId: string,
    accountId: string,
  ): Promise<ResolvedCredentials | null> {
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT twilio_subaccount_sid, twilio_subaccount_auth_token_enc, twilio_whatsapp_from
        FROM messaging_config
        WHERE restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );
    if (!rows.length) return null;

    const row = rows[0];
    const accountSid = row['twilio_subaccount_sid'] as string | null;
    if (!accountSid) return null;

    const authToken = this.cryptoService.decrypt(
      row['twilio_subaccount_auth_token_enc'] as string,
    );
    return {
      accountSid,
      authToken,
      from: row['twilio_whatsapp_from'] as string,
    };
  }

  async listTemplates(restaurantId: string): Promise<TwilioTemplate[]> {
    const { accountId } = this.tenantContext.get();
    const cacheKey = `twilio:templates:${restaurantId}`;
    const redis = this.redisService.getClient();

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as TwilioTemplate[];

    const subCredentials = await this.resolveCredentials(
      restaurantId,
      accountId,
    );
    const accountSid =
      subCredentials?.accountSid ??
      this.configService.get<string>('whatsapp.twilio.accountSid');
    const authToken =
      subCredentials?.authToken ??
      this.configService.get<string>('whatsapp.twilio.authToken');

    if (!accountSid || !authToken) {
      throw new ServiceUnavailableException(
        'Não foi possível buscar templates da Twilio',
      );
    }

    let templates: TwilioTemplate[];
    try {
      const client = twilio(accountSid, authToken);
      const contents = await client.content.v1.contentAndApprovals.list();
      // approval_requests.status não distingue templates utilizáveis de não-utilizáveis
      // em contas sandbox (ex: 'unsubmitted' tanto para templates já usados com sucesso
      // quanto para nunca usados) — sem filtro de aprovação, retorna tudo da conta resolvida.
      templates = contents.map((c) => {
        const body = this.extractBody(c.types);
        return {
          contentSid: c.sid,
          friendlyName: c.friendlyName,
          body,
          variableCount: this.countVariables(body),
          language: c.language,
        };
      });
    } catch (err) {
      this.logger.error(
        `Falha ao buscar templates da Twilio (restaurantId=${restaurantId}, sid=...${accountSid.slice(-4)})`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new ServiceUnavailableException(
        'Não foi possível buscar templates da Twilio',
      );
    }

    await redis.set(
      cacheKey,
      JSON.stringify(templates),
      'EX',
      TEMPLATES_CACHE_TTL_SECONDS,
    );
    return templates;
  }

  listVariables(): Array<Omit<VariableDefinition, 'resolve'>> {
    return VARIABLE_CATALOG.map(({ key, label, category }) => ({
      key,
      label,
      category,
    }));
  }

  private extractBody(types: Record<string, unknown>): string {
    for (const type of Object.values(types)) {
      const body = (type as { body?: string } | null)?.body;
      if (body) return body;
    }
    return '';
  }

  private countVariables(body: string): number {
    const matches = body.matchAll(/\{\{(\d+)\}\}/g);
    const unique = new Set([...matches].map((m) => m[1]));
    return unique.size;
  }

  private mapRow(row: Record<string, unknown>): MessagingConfigDto {
    return {
      id: row['id'] as string,
      restaurantId: row['restaurant_id'] as string,
      twilioSubaccountSid:
        (row['twilio_subaccount_sid'] as string | null) ?? null,
      twilioWhatsappFrom:
        (row['twilio_whatsapp_from'] as string | null) ?? null,
      status: row['status'] as string,
      createdAt: row['created_at'] as Date,
    };
  }
}
