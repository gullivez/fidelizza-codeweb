-- Corrige a policy de SELECT em app_user para permitir busca por email no fluxo de login.
--
-- Problema: /auth/login precisa encontrar o usuário por email ANTES de conhecer o account_id.
-- Com FORCE RLS e sem GUC definido, a policy anterior filtrava todas as linhas → 401.
--
-- Solução: USING passa quando não há contexto de tenant (login) OU quando account_id bate.
-- WITH CHECK permanece estrito — INSERT/UPDATE sempre exige account_id correto.
--
-- restaurants e user_restaurant_access não são acessadas sem contexto → policies inalteradas.

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
