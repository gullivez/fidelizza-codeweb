-- Correção de segurança (Sprint 6 Bloco 4): a tabela account nunca teve RLS
-- habilitada — única tabela multi-tenant sem proteção, encontrada durante
-- revisão de isolamento antes do go-live. Não há leitura cross-tenant ativa
-- hoje (nenhum endpoint faz SELECT em account), mas qualquer código futuro
-- que leia essa tabela ficaria desprotegido sem essa policy.
--
-- account não tem coluna account_id (a própria id da linha É o account_id),
-- então a policy compara id diretamente — mesmo padrão CASE WHEN das demais
-- tabelas (GUC vazio/nulo libera leitura, ex.: migrations rodando via
-- superuser já bypassam RLS de qualquer forma; o CASE existe para o caso de
-- alguém usar a role fidelizza_app sem contexto de tenant setado).

ALTER TABLE account ENABLE ROW LEVEL SECURITY;
ALTER TABLE account FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON account
  USING (
    CASE
      WHEN current_setting('app.account_id', true) IS NULL
        OR current_setting('app.account_id', true) = ''
      THEN true
      ELSE id = current_setting('app.account_id', true)::uuid
    END
  )
  WITH CHECK (
    id = current_setting('app.account_id', true)::uuid
  );
