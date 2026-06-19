-- Sprint 4.5 (B2): catálogo de variáveis dinâmicas — tipos e valores resolvidos.

ALTER TABLE campaign
  ADD COLUMN IF NOT EXISTS template_variables jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE campaign_target
  ADD COLUMN IF NOT EXISTS resolved_variables jsonb NOT NULL DEFAULT '{}'::jsonb;
