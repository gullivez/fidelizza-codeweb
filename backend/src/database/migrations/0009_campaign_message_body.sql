-- Sprint 4 (correção BE-1): corpo real do template, separado do nome do template,
-- usado pelo preview para renderizar a mensagem (o disparo real continua via Twilio Content SID).
ALTER TABLE campaign ADD COLUMN IF NOT EXISTS message_body text NOT NULL DEFAULT '';
