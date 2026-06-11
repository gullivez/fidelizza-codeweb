import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import postgres from 'postgres';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async testConnection() {
    const databaseUrl =
      this.configService.get<string>(
        'database.url',
      );

    const sql = postgres(databaseUrl!);

    const result = await sql`
      SELECT 1 as status
    `;

    return result;
  }
}