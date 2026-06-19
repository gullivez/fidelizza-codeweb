import type {
  VariableDefinition,
  VariableResolverContext,
} from './variable-resolver.types';

export const VARIABLE_CATALOG: VariableDefinition[] = [
  {
    key: 'contact.first_name',
    label: 'Primeiro nome do contato',
    category: 'contact',
    resolve: (ctx) => ctx.customer.name.trim().split(/\s+/)[0] ?? '',
  },
  {
    key: 'contact.full_name',
    label: 'Nome completo do contato',
    category: 'contact',
    resolve: (ctx) => ctx.customer.name,
  },
  {
    key: 'restaurant.name',
    label: 'Nome do restaurante',
    category: 'restaurant',
    resolve: (ctx) => ctx.restaurant.name,
  },
];

export function resolveVariable(
  key: string,
  ctx: VariableResolverContext,
): string | null {
  const def = VARIABLE_CATALOG.find((v) => v.key === key);
  return def ? def.resolve(ctx) : null;
}
