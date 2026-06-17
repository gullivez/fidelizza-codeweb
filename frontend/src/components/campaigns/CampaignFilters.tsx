import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CampaignStatus } from "@/lib/api/campaigns";

export type StatusFilter = CampaignStatus | "all";

type Props = {
  status: StatusFilter;
  onStatusChange: (s: StatusFilter) => void;
};

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos os status" },
  { value: "draft", label: "Rascunho" },
  { value: "sending", label: "Enviando" },
  { value: "sent", label: "Enviada" },
  { value: "failed", label: "Falhou" },
];

export function CampaignFilters({ status, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <SelectTrigger className="h-9 w-[200px] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
