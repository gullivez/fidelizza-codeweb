import 'dotenv/config';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import postgres from 'postgres';

async function run() {
  const url = process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL;
  if (!url)
    throw new Error('DATABASE_MIGRATION_URL ou DATABASE_URL não configurado');

  const sql = postgres(url);

  try {
    // Tabela de controle — criada na primeira execução (idempotente)
    await sql`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        filename   TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    const applied = await sql<{ filename: string }[]>`
      SELECT filename FROM _schema_migrations
    `;
    const appliedSet = new Set(applied.map((r) => r.filename));

    const migrationsDir = join(process.cwd(), 'src', 'database', 'migrations');
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`⏭  ${file} (já aplicada)`);
        continue;
      }

      const content = await readFile(join(migrationsDir, file), 'utf-8');
      console.log(`⚡ Aplicando ${file}...`);

      try {
        await sql.begin(async (tx) => {
          await tx.unsafe(content);
          await tx`INSERT INTO _schema_migrations (filename) VALUES (${file})`;
        });
        console.log(`✅ ${file}`);
      } catch (err: unknown) {
        // 42P07 = tabela já existe  42701 = coluna já existe
        // Ocorre quando a migration foi aplicada fora deste runner (ex.: drizzle-kit)
        const code = (err as { code?: string }).code;
        if (code === '42P07' || code === '42701') {
          await sql`
            INSERT INTO _schema_migrations (filename) VALUES (${file})
            ON CONFLICT DO NOTHING
          `;
          console.log(
            `⚠️  ${file}: objetos já existiam — marcada como aplicada`,
          );
        } else {
          throw err;
        }
      }
    }

    console.log('\nMigrations concluídas.');
  } finally {
    await sql.end();
  }
}

run().catch((err) => {
  console.error('Erro nas migrations:', err);
  process.exit(1);
});
