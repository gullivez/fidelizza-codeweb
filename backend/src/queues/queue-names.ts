export const QUEUE_NAMES = [
  'integration.ingest',
  'segmentation.recalculate',
  'campaign.dispatch',
  'message.status',
  'conversion.attribution',
  'alerts.check',
] as const;

export type QueueName = (typeof QUEUE_NAMES)[number];
