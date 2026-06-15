import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import type { CreateRestaurantDto } from './dto/create-restaurant.dto';
import type { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tenantContext: TenantContextService,
  ) {}

  findAll() {
    const { accountId } = this.tenantContext.get();
    return this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      SELECT id, name, slug, phone, status, created_at
      FROM restaurants
      WHERE account_id = ${accountId}
        AND status = 'active'
      ORDER BY name
    `,
    );
  }

  async findOne(id: string) {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      SELECT id, name, slug, phone, status, created_at, updated_at
      FROM restaurants
      WHERE id = ${id}
        AND account_id = ${accountId}
    `,
    );
    if (!rows.length) throw new NotFoundException('Restaurante não encontrado');
    return rows[0];
  }

  async create(dto: CreateRestaurantDto) {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      INSERT INTO restaurants (account_id, name, slug, phone)
      VALUES (${accountId}, ${dto.name}, ${dto.slug}, ${dto.phone ?? null})
      RETURNING id, name, slug, phone, status, created_at
    `,
    );
    return rows[0];
  }

  async update(id: string, dto: UpdateRestaurantDto) {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      UPDATE restaurants
      SET
        name       = COALESCE(${dto.name ?? null}, name),
        slug       = COALESCE(${dto.slug ?? null}, slug),
        phone      = COALESCE(${dto.phone ?? null}, phone),
        updated_at = now()
      WHERE id = ${id}
        AND account_id = ${accountId}
      RETURNING id, name, slug, phone, status, updated_at
    `,
    );
    if (!rows.length) throw new NotFoundException('Restaurante não encontrado');
    return rows[0];
  }

  async remove(id: string) {
    const { accountId } = this.tenantContext.get();
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      UPDATE restaurants SET status = 'inactive', updated_at = now()
      WHERE id = ${id}
        AND account_id = ${accountId}
      RETURNING id
    `,
    );
    if (!rows.length) throw new NotFoundException('Restaurante não encontrado');
  }
}
