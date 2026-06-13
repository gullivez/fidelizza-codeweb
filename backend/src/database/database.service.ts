import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import type { Sql } from 'postgres';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private sql!: Sql;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('database.url')!;
    this.sql = postgres(url);
  }

  async onModuleDestroy() {
    await this.sql.end();
  }

  async testConnection(): Promise<boolean> {
    const result = await this.sql`SELECT 1 AS ok`;
    return result[0].ok === 1;
  }

  /**
   * Executa fn dentro de uma transação com SET LOCAL app.account_id = accountId.
   * SET LOCAL garante que o GUC é revertido ao fim da transação — sem vazamento entre requests.
   */
  async runInTenantContext<T>(
    accountId: string,
    fn: (sql: Sql) => Promise<T>,
  ): Promise<T> {
    const result = await this.sql.begin(async (tx) => {
      await tx`SELECT set_config('app.account_id', ${accountId}, true)`;
      return fn(tx as unknown as Sql);
    });
    return result as T;
  }

  getSql(): Sql {
    return this.sql;
  }
}
