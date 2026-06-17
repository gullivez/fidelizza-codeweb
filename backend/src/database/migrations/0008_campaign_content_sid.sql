-- Sprint 4 (Bloco C): coluna para o Content SID do Twilio, faltante na 0007.
ALTER TABLE campaign ADD COLUMN IF NOT EXISTS content_sid varchar(64) NOT NULL DEFAULT '';
