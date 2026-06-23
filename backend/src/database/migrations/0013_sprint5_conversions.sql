-- Sprint 5 (Bloco 1): atribuição de receita (last-touch) para o Dashboard de ROI.

CREATE TABLE IF NOT EXISTS conversion (
  id                   uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id           uuid          NOT NULL REFERENCES account(id),
  restaurant_id        uuid          NOT NULL REFERENCES restaurants(id),
  campaign_id          uuid          NOT NULL REFERENCES campaign(id),
  campaign_target_id   uuid          NOT NULL REFERENCES campaign_target(id),
  customer_id          uuid          NOT NULL REFERENCES customer(id),
  restaurant_order_id  uuid          NOT NULL REFERENCES restaurant_order(id),
  revenue_attributed   NUMERIC(10,2) NOT NULL,
  attributed_at        timestamptz   NOT NULL DEFAULT now(),
  order_placed_at      timestamptz   NOT NULL,
  message_sent_at      timestamptz   NOT NULL,
  UNIQUE (restaurant_order_id)
);

ALTER TABLE conversion ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON conversion
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

CREATE INDEX ON conversion (restaurant_id, attributed_at);
CREATE INDEX ON conversion (campaign_id);
CREATE INDEX ON conversion (customer_id);
