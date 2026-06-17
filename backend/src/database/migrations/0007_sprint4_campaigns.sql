-- Sprint 4 (Bloco A): esquema de campanhas WhatsApp + opt-in do cliente.
-- Apenas schema nesta entrega — módulo/serviço/Twilio ficam para o próximo bloco.

-- ============================================================
-- ALTER: customer — opt-in de WhatsApp
-- ============================================================
ALTER TABLE customer ADD COLUMN IF NOT EXISTS consent_whatsapp boolean NOT NULL DEFAULT false;
ALTER TABLE customer ADD COLUMN IF NOT EXISTS consent_at timestamptz NULL;

-- ============================================================
-- TABELA: campaign
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign (
  id                       uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id               uuid         NOT NULL REFERENCES account(id),
  restaurant_id            uuid         NOT NULL REFERENCES restaurants(id),
  name                     text         NOT NULL,
  segment_name             text         NOT NULL CHECK (segment_name IN ('champions','new','at_risk','inactive')),
  template_name            varchar(128) NOT NULL,
  template_params          jsonb        NOT NULL DEFAULT '{}'::jsonb,
  status                   text         NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sending','sent','failed')),
  attribution_window_days  int          NOT NULL DEFAULT 7,
  total_targets            int          NOT NULL DEFAULT 0,
  created_at               timestamptz  NOT NULL DEFAULT now(),
  sent_at                  timestamptz  NULL
);

ALTER TABLE campaign ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON campaign
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

CREATE INDEX ON campaign (restaurant_id, status);

-- ============================================================
-- TABELA: campaign_target (snapshot imutável — coração do ROI)
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_target (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid        NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
  account_id        uuid        NOT NULL REFERENCES account(id),
  restaurant_id     uuid        NOT NULL REFERENCES restaurants(id),
  customer_id       uuid        NOT NULL REFERENCES customer(id),
  phone_snapshot    text        NOT NULL,
  name_snapshot     text        NOT NULL,
  segment_snapshot  text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaign_target ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_target FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON campaign_target
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

CREATE INDEX ON campaign_target (campaign_id);
CREATE INDEX ON campaign_target (customer_id);

-- ============================================================
-- TABELA: message_log
-- ============================================================
CREATE TABLE IF NOT EXISTS message_log (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_target_id    uuid        NOT NULL REFERENCES campaign_target(id) ON DELETE CASCADE,
  account_id            uuid        NOT NULL REFERENCES account(id),
  restaurant_id         uuid        NOT NULL REFERENCES restaurants(id),
  provider_message_id   text        NULL,
  status                text        NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','read','failed')),
  error_code            text        NULL,
  category              text        NOT NULL DEFAULT 'marketing' CHECK (category IN ('marketing','utility')),
  sent_at               timestamptz NULL,
  delivered_at          timestamptz NULL,
  read_at               timestamptz NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_log FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON message_log
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

CREATE INDEX ON message_log (campaign_target_id);
CREATE INDEX ON message_log (restaurant_id, status);
CREATE INDEX ON message_log (provider_message_id);

-- ============================================================
-- QA manual (NÃO executar automaticamente — destrava QA #7 depois)
-- ============================================================
-- UPDATE customer SET consent_whatsapp = true, consent_at = now()
--   WHERE phone = '+5519996666167';
