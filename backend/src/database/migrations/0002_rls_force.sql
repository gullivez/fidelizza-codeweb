-- Ativa FORCE ROW LEVEL SECURITY nas 3 tabelas de tenant.
-- Sem FORCE, o owner da tabela (superuser) bypassaria as policies mesmo com ENABLE.
-- A app conecta como fidelizza_app (sem SUPERUSER/BYPASSRLS), então as policies são aplicadas.
ALTER TABLE restaurants            FORCE ROW LEVEL SECURITY;
ALTER TABLE app_user               FORCE ROW LEVEL SECURITY;
ALTER TABLE user_restaurant_access FORCE ROW LEVEL SECURITY;

-- Recria policies adicionando WITH CHECK (impede INSERT/UPDATE gravando account_id de outra conta).
DROP POLICY IF EXISTS tenant_isolation ON restaurants;
CREATE POLICY tenant_isolation ON restaurants
  USING     (account_id = current_setting('app.account_id', true)::uuid)
  WITH CHECK (account_id = current_setting('app.account_id', true)::uuid);

-- USING permite SELECT sem contexto (login ainda não tem account_id) ou com contexto correto.
-- WITH CHECK sempre exige account_id correto — escrita nunca relaxada.
DROP POLICY IF EXISTS tenant_isolation ON app_user;
CREATE POLICY tenant_isolation ON app_user
  USING (
    current_setting('app.account_id', true) IS NULL
    OR current_setting('app.account_id', true) = ''
    OR account_id = current_setting('app.account_id', true)::uuid
  )
  WITH CHECK (
    account_id = current_setting('app.account_id', true)::uuid
  );

DROP POLICY IF EXISTS tenant_isolation ON user_restaurant_access;
CREATE POLICY tenant_isolation ON user_restaurant_access
  USING (
    user_id IN (
      SELECT id FROM app_user
      WHERE account_id = current_setting('app.account_id', true)::uuid
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM app_user
      WHERE account_id = current_setting('app.account_id', true)::uuid
    )
  );
