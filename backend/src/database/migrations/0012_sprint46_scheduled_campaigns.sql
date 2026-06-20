-- Sprint 4.6 (Bloco 1): agendamento de campanha — estado 'scheduled'.

ALTER TABLE campaign
  DROP CONSTRAINT IF EXISTS campaign_status_check;

ALTER TABLE campaign
  ADD CONSTRAINT campaign_status_check
    CHECK (status IN ('draft','scheduled','sending','sent','failed'));

ALTER TABLE campaign
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz NULL;

ALTER TABLE campaign
  ADD COLUMN IF NOT EXISTS scheduled_job_id text NULL;
