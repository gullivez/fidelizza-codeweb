-- Corrige o cast ::uuid em app_user e restaurants com CASE para garantir short-circuit.
--
-- Problema raiz: OR em SQL não garante short-circuit — o planner pode avaliar
-- current_setting('app.account_id', true)::uuid mesmo quando as cláusulas anteriores
-- são verdadeiras. Com GUC = '' (reset após SET LOCAL + commit), isso lança
-- "invalid input syntax for type uuid: ''".
--
-- CASE garante avaliação sequencial em PostgreSQL: o ramo ELSE (com ::uuid) só é
-- executado quando o GUC tem um valor não-vazio. WITH CHECK permanece estrito em ambas.
--
-- app_user: login() e refresh() buscam usuário sem contexto de tenant — USING precisa
--           aceitar GUC vazio. WITH CHECK nunca relaxado (INSERT/UPDATE sempre exigem GUC).
--
-- restaurants: resolveAllowedRestaurants() também consulta sem contexto de tenant;
--              a aplicação filtra explicitamente por account_id no WHERE, então
--              relaxar o USING não cria vazamento — apenas evita o erro de cast.

DROP POLICY IF EXISTS tenant_isolation ON app_user;
CREATE POLICY tenant_isolation ON app_user
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

DROP POLICY IF EXISTS tenant_isolation ON restaurants;
CREATE POLICY tenant_isolation ON restaurants
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
