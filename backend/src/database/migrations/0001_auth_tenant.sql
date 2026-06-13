-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- account
CREATE TABLE account (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL CHECK (type IN ('direct', 'agency')),
  name       VARCHAR(255) NOT NULL,
  slug       CITEXT NOT NULL UNIQUE,
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- app_user
CREATE TABLE app_user (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID NOT NULL REFERENCES account(id),
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'operator')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_account ON app_user(account_id);

-- adicionar account_id e status em restaurants (tabela já existe)
ALTER TABLE restaurants ADD COLUMN account_id UUID REFERENCES account(id);
ALTER TABLE restaurants ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive'));

CREATE INDEX idx_restaurant_account ON restaurants(account_id);

-- user_restaurant_access (para role=operator)
CREATE TABLE user_restaurant_access (
  user_id       UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, restaurant_id)
);

-- RLS: SET LOCAL via app.account_id GUC
ALTER TABLE restaurants            ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_user               ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_restaurant_access ENABLE ROW LEVEL SECURITY;

-- Superuser e service_role bypassam RLS; app usa role restrita (sem BYPASSRLS)
CREATE POLICY tenant_isolation ON restaurants
  USING (account_id = current_setting('app.account_id', true)::uuid);

CREATE POLICY tenant_isolation ON app_user
  USING (account_id = current_setting('app.account_id', true)::uuid);

CREATE POLICY tenant_isolation ON user_restaurant_access
  USING (user_id IN (
    SELECT id FROM app_user
    WHERE account_id = current_setting('app.account_id', true)::uuid
  ));
