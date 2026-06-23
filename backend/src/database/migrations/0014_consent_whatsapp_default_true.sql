-- Correção pós-QA (Bloco 2): consent_whatsapp é opt-out, não opt-in —
-- ausência de manifestação de vontade do cliente deve significar
-- consentimento ativo (true). O default original (false) e o backfill
-- da migration 0007 invertiam essa regra.

ALTER TABLE customer ALTER COLUMN consent_whatsapp SET DEFAULT true;

UPDATE customer
SET consent_whatsapp = true
WHERE consent_whatsapp IS NULL
   OR consent_whatsapp = false;
