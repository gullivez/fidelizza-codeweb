-- Sprint 3: tabelas de segmentação RFM.
-- segment: metadados dos 4 segmentos fixos por restaurante.
-- customer_segment: histórico SCD-lite de classificação de cada cliente.

-- ============================================================
-- TABELA: segment
-- 4 registros fixos por restaurante, seed automático no 1º recálculo.
-- ============================================================
CREATE TABLE IF NOT EXISTS segment (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  account_id     uuid        NOT NULL REFERENCES account(id),
  name           text        NOT NULL CHECK (name IN ('champions','new','at_risk','inactive')),
  label          varchar(64) NOT NULL,
  color          varchar(7)  NOT NULL,
  display_order  int         NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, name)
);

ALTER TABLE segment ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON segment
  USING (
    CASE
      WHEN current_setting('app.account_id', true) IS NULL
        OR current_setting('app.account_id', true) = ''
      THEN true
      ELSE account_id = current_setting('app.account_id', true)::uuid
    END
  )
  WITH CHECK (
    account_id = current_setting('app.account_id', true)::uuid
  );

-- ============================================================
-- TABELA: customer_segment
-- SCD-lite: is_current=true = linha ativa, valid_to=null.
-- Ao mudar de segmento: fecha linha corrente e abre nova.
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_segment (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      uuid        NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  restaurant_id    uuid        NOT NULL REFERENCES restaurants(id),
  account_id       uuid        NOT NULL REFERENCES account(id),
  segment_name     text        NOT NULL CHECK (segment_name IN ('champions','new','at_risk','inactive')),
  recency_score    float4      NOT NULL,
  frequency_score  float4      NOT NULL,
  monetary_score   float4      NOT NULL,
  is_current       boolean     NOT NULL DEFAULT true,
  valid_from       timestamptz NOT NULL DEFAULT now(),
  valid_to         timestamptz,
  evaluated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customer_segment ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON customer_segment
  USING (
    CASE
      WHEN current_setting('app.account_id', true) IS NULL
        OR current_setting('app.account_id', true) = ''
      THEN true
      ELSE account_id = current_setting('app.account_id', true)::uuid
    END
  )
  WITH CHECK (
    account_id = current_setting('app.account_id', true)::uuid
  );

CREATE INDEX ON customer_segment (restaurant_id, is_current);
CREATE INDEX ON customer_segment (customer_id, is_current);
CREATE INDEX ON customer_segment (account_id, restaurant_id, segment_name, is_current);
