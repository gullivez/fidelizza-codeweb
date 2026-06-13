import { envSchema } from './env.schema';

export function validateEnv(
  config: Record<string, unknown>,
) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const lines = result.error.issues.map(
      (issue) => `  ❌ ${issue.path.join('.')}: ${issue.message}`,
    );

    console.error(
      `[Env] Variáveis de ambiente inválidas:\n${lines.join('\n')}`,
    );

    throw new Error('Invalid environment variables');
  }

  return result.data;
}