import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import type { CreateIntegrationDto } from './dto/create-integration.dto';
import type { UpdateIntegrationDto } from './dto/update-integration.dto';
import type { IntegrationResponseDto } from './dto/integration-response.dto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

@Injectable()
export class IntegrationsService {
  private readonly aesKey: Buffer;

  constructor(
    private readonly db: DatabaseService,
    private readonly tenantContext: TenantContextService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('aesSecret')!;
    this.aesKey = Buffer.from(secret.slice(0, 32).padEnd(32, '0'));
  }

  // ── AES helpers ──────────────────────────────────────────────────────────

  encrypt(text: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.aesKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, dataHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, this.aesKey, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      'utf8',
    );
  }

  decryptCredentials(credentialsEnc: string): {
    clientId: string;
    clientSecret: string;
  } {
    return JSON.parse(this.decrypt(credentialsEnc)) as {
      clientId: string;
      clientSecret: string;
    };
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async findAll(restaurantId: string): Promise<IntegrationResponseDto[]> {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      SELECT id, restaurant_id, provider, status,
             sync_time_1, sync_time_2, last_sync_at, last_error, created_at
      FROM integration
      WHERE restaurant_id = ${restaurantId}
        AND account_id    = ${accountId}
      ORDER BY created_at DESC
    `,
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findOne(
    restaurantId: string,
    id: string,
  ): Promise<IntegrationResponseDto> {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      SELECT id, restaurant_id, provider, status,
             sync_time_1, sync_time_2, last_sync_at, last_error, created_at
      FROM integration
      WHERE id            = ${id}
        AND restaurant_id = ${restaurantId}
        AND account_id    = ${accountId}
    `,
    );
    if (!rows.length) throw new NotFoundException('Integração não encontrada');
    return this.mapRow(rows[0]);
  }

  /** Used by workers — bypasses tenant context, exposes credentials_enc. */
  async findOneRaw(id: string) {
    const rows = await this.db.getSql()`
      SELECT id, account_id, restaurant_id, provider, credentials_enc,
             sync_time_1, sync_time_2, status, last_sync_at, last_error, created_at
      FROM integration
      WHERE id = ${id}
    `;
    if (!rows.length) throw new NotFoundException('Integração não encontrada');
    return rows[0];
  }

  /** Used by PollingService — bypasses tenant context, no credentials_enc exposed to API. */
  async findAllActiveRaw() {
    return this.db.getSql()`
      SELECT id, account_id, restaurant_id, provider, credentials_enc,
             sync_time_1, sync_time_2, status
      FROM integration
      WHERE status = 'active'
    `;
  }

  async create(
    restaurantId: string,
    dto: CreateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    const { accountId } = this.tenantContext.get();
    const credentialsEnc = this.encrypt(
      JSON.stringify({
        clientId: dto.clientId,
        clientSecret: dto.clientSecret,
      }),
    );

    try {
      const rows = await this.db.runInTenantContext(
        accountId,
        (sql) => sql`
        INSERT INTO integration
          (account_id, restaurant_id, provider, credentials_enc, sync_time_1, sync_time_2)
        VALUES
          (${accountId}, ${restaurantId}, ${dto.provider},
           ${credentialsEnc}, ${dto.syncTime1 ?? '03:00'}, ${dto.syncTime2 ?? null})
        RETURNING id, restaurant_id, provider, status,
                  sync_time_1, sync_time_2, last_sync_at, last_error, created_at
      `,
      );
      return this.mapRow(rows[0]);
    } catch (err: unknown) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException(
          'Já existe uma integração para este restaurante',
        );
      }
      throw err;
    }
  }

  async update(
    restaurantId: string,
    id: string,
    dto: UpdateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      UPDATE integration
      SET
        sync_time_1 = COALESCE(${dto.syncTime1 ?? null}, sync_time_1),
        sync_time_2 = CASE WHEN ${dto.syncTime2 !== undefined} THEN ${dto.syncTime2 ?? null}
                           ELSE sync_time_2
                      END,
        status      = COALESCE(${dto.status ?? null}, status)
      WHERE id            = ${id}
        AND restaurant_id = ${restaurantId}
        AND account_id    = ${accountId}
      RETURNING id, restaurant_id, provider, status,
                sync_time_1, sync_time_2, last_sync_at, last_error, created_at
    `,
    );
    if (!rows.length) throw new NotFoundException('Integração não encontrada');
    return this.mapRow(rows[0]);
  }

  async remove(restaurantId: string, id: string): Promise<void> {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      DELETE FROM integration
      WHERE id            = ${id}
        AND restaurant_id = ${restaurantId}
        AND account_id    = ${accountId}
      RETURNING id
    `,
    );
    if (!rows.length) throw new NotFoundException('Integração não encontrada');
  }

  async markSyncSuccess(id: string): Promise<void> {
    await this.db.getSql()`
      UPDATE integration SET last_sync_at = now(), last_error = null WHERE id = ${id}
    `;
  }

  async markSyncError(id: string, error: string): Promise<void> {
    await this.db.getSql()`
      UPDATE integration SET last_error = ${error}, status = 'error' WHERE id = ${id}
    `;
  }

  // ── Map ───────────────────────────────────────────────────────────────────

  private mapRow(row: Record<string, unknown>): IntegrationResponseDto {
    return {
      id: row['id'] as string,
      restaurantId: row['restaurant_id'] as string,
      provider: row['provider'] as string,
      status: row['status'] as string,
      syncTime1: row['sync_time_1'] as string,
      syncTime2: (row['sync_time_2'] as string | null) ?? null,
      lastSyncAt: (row['last_sync_at'] as Date | null) ?? null,
      lastError: (row['last_error'] as string | null) ?? null,
      createdAt: row['created_at'] as Date,
    };
  }
}
