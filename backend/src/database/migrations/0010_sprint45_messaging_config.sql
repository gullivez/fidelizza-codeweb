-- Sprint 4.5 (C1): messaging_config — subcontas Twilio por restaurante.
-- 1 registro por restaurante. twilio_subaccount_sid NULL = usa a conta-mãe (fallback do piloto).

CREATE TABLE IF NOT EXISTS messaging_config (
  id                                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id                        uuid        NOT NULL REFERENCES account(id),
  restaurant_id                     uuid        NOT NULL REFERENCES restaurants(id),
  twilio_subaccount_sid             text        NULL,
  twilio_subaccount_auth_token_enc  text        NULL,
  twilio_whatsapp_from              text        NULL,
  status                            text        NOT NULL DEFAULT 'inactive'
                                                 CHECK (status IN ('active', 'inactive')),
  created_at                        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id)
);

ALTER TABLE messaging_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_config FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messaging_config' AND policyname = 'tenant_isolation'
  ) THEN
    CREATE POLICY tenant_isolation ON messaging_config
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
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS messaging_config_restaurant_id_idx ON messaging_config (restaurant_id);
