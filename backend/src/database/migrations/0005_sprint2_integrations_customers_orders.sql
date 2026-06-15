-- Sprint 2: tabelas de integração, clientes, pedidos e log de sync.
-- Todas as tabelas com tenant isolation via RLS (mesmo padrão do Sprint 1 — CASE para short-circuit seguro).

-- ============================================================
-- TABELA: integration
-- 1 por restaurante por enquanto. Armazena credenciais encriptadas com AES.
-- ============================================================
CREATE TABLE IF NOT EXISTS integration (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid        NOT NULL REFERENCES account(id),
  restaurant_id    uuid        NOT NULL REFERENCES restaurants(id),
  provider         TEXT        NOT NULL DEFAULT 'anota_ai',
  credentials_enc  TEXT        NOT NULL,
  sync_time_1      TEXT        NOT NULL DEFAULT '03:00',
  sync_time_2      TEXT        NULL,
  status           TEXT        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active', 'inactive', 'error')),
  last_sync_at     TIMESTAMPTZ NULL,
  last_error       TEXT        NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id)
);

ALTER TABLE integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON integration
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
-- TABELA: customer
-- Chave de unificação: UNIQUE(restaurant_id, phone) em E.164.
-- ============================================================
CREATE TABLE IF NOT EXISTS customer (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid          NOT NULL REFERENCES account(id),
  restaurant_id uuid          NOT NULL REFERENCES restaurants(id),
  phone         TEXT          NOT NULL,
  name          TEXT          NOT NULL,
  total_orders  INT           NOT NULL DEFAULT 0,
  total_spent   NUMERIC(10,2) NOT NULL DEFAULT 0,
  avg_ticket    NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_order_at TIMESTAMPTZ   NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, phone)
);

ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON customer
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

CREATE INDEX ON customer (restaurant_id, phone);

-- ============================================================
-- TABELA: restaurant_order
-- Nome evita conflito com keyword ORDER. UNIQUE(restaurant_id, external_id) para idempotência.
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_order (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid          NOT NULL REFERENCES account(id),
  restaurant_id uuid          NOT NULL REFERENCES restaurants(id),
  customer_id   uuid          NOT NULL REFERENCES customer(id),
  external_id   TEXT          NOT NULL,
  status        TEXT          NOT NULL DEFAULT 'pending',
  total_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  ordered_at    TIMESTAMPTZ   NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, external_id)
);

ALTER TABLE restaurant_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_order FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON restaurant_order
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

CREATE INDEX ON restaurant_order (restaurant_id, external_id);
CREATE INDEX ON restaurant_order (customer_id);

-- ============================================================
-- TABELA: order_item
-- Sem RLS própria — acessada apenas via JOIN com restaurant_order.
-- ============================================================
CREATE TABLE IF NOT EXISTS order_item (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid          NOT NULL REFERENCES restaurant_order(id) ON DELETE CASCADE,
  external_id TEXT          NULL,
  name        TEXT          NOT NULL,
  quantity    INT           NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- ============================================================
-- TABELA: sync_log
-- Sem RLS própria — acessada apenas via JOIN com integration.
-- ============================================================
CREATE TABLE IF NOT EXISTS sync_log (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid        NOT NULL REFERENCES integration(id),
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at    TIMESTAMPTZ NULL,
  orders_fetched INT         NOT NULL DEFAULT 0,
  orders_new     INT         NOT NULL DEFAULT 0,
  customers_new  INT         NOT NULL DEFAULT 0,
  status         TEXT        NOT NULL DEFAULT 'running'
                             CHECK (status IN ('running', 'success', 'error')),
  error          TEXT        NULL
);

CREATE INDEX ON sync_log (integration_id, started_at DESC);
