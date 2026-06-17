export function TemplateBlock({
  templateName,
  contentSid,
}: {
  templateName: string;
  contentSid: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card divide-y divide-border">
      <Row label="Template" value={templateName} />
      <Row label="Content SID" value={contentSid} mono />
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground pt-0.5">
        {label}
      </dt>
      <dd className={mono ? "text-sm font-mono text-foreground" : "text-sm text-foreground"}>
        {value}
      </dd>
    </div>
  );
}
