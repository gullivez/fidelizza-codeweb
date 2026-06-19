import type { VariableResolverContext } from './variable-resolver.types';
import { resolveVariable } from './variable-catalog';

export type TemplateVariableMap = Record<
  string,
  { type: 'dynamic'; key: string } | { type: 'static'; value: string }
>;

export function resolveTemplateVariables(
  variables: TemplateVariableMap,
  ctx: VariableResolverContext,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [position, def] of Object.entries(variables)) {
    if (def.type === 'static') {
      resolved[position] = def.value;
    } else {
      resolved[position] = resolveVariable(def.key, ctx) ?? '';
    }
  }
  return resolved;
}

export function renderBody(
  body: string,
  resolvedValues: Record<string, string>,
): string {
  let rendered = body;
  for (const [position, value] of Object.entries(resolvedValues)) {
    rendered = rendered.replaceAll(`{{${position}}}`, value);
  }
  return rendered;
}
