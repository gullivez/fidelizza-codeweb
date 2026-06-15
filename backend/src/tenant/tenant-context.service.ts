import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import type { TenantContext } from './tenant.types';

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  run<T>(context: TenantContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  get(): TenantContext {
    const ctx = this.storage.getStore();
    if (!ctx)
      throw new Error(
        'TenantContext não disponível fora de um contexto autenticado',
      );
    return ctx;
  }

  getOrNull(): TenantContext | null {
    return this.storage.getStore() ?? null;
  }
}
