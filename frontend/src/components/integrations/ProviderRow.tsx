import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProviderLogo } from "./ProviderLogo";
import {
  type Connection,
  type Provider,
  formatBR,
  formatLastSync,
} from "@/lib/mock-integrations";
import { cn } from "@/lib/utils";

export function ProviderRow({
  provider,
  connection,
  onConnect,
  onReconnect,
  onReconfigure,
}: {
  provider: Provider;
  connection: Connection;
  onConnect: () => void;
  onReconnect: () => void;
  onReconfigure: () => void;
}) {
  const isError = connection.status === "error";
  const isConnecting = connection.status === "connecting";

  return (
    <div
      className={cn(
        "px-5 py-4 transition-colors",
        !provider.available && "pointer-events-none opacity-60",
        isError && "bg-rose-50/60",
      )}
    >
      <div className="flex items-start gap-4">
        <ProviderLogo name={provider.nome} color={provider.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {provider.nome}
            </h3>
            {!provider.available && (
              <StatusBadge variant="neutral">Em breve</StatusBadge>
            )}
            {connection.status === "active" && (
              <StatusBadge variant="success">Ativo</StatusBadge>
            )}
            {connection.status === "syncing" && (
              <StatusBadge variant="info">Sincronizando</StatusBadge>
            )}
            {connection.status === "error" && (
              <StatusBadge variant="danger">Erro</StatusBadge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {provider.descricao}
          </p>

          {connection.status === "active" && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                Último sync:{" "}
                <span className="text-foreground">
                  {formatLastSync(connection.lastSyncMinutesAgo ?? 0)}
                </span>
              </span>
              <span className="text-zinc-300">·</span>
              <span>
                <span className="text-foreground tabular-nums">
                  {formatBR(connection.customers ?? 0)}
                </span>{" "}
                clientes
              </span>
              <span className="text-zinc-300">·</span>
              <span>
                <span className="text-foreground tabular-nums">
                  {formatBR(connection.orders ?? 0)}
                </span>{" "}
                pedidos importados
              </span>
            </div>
          )}

          {connection.status === "syncing" && (
            <div className="mt-3 max-w-md">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Importando seus pedidos…</span>
                <span className="tabular-nums">{connection.progress ?? 0}%</span>
              </div>
              <Progress value={connection.progress ?? 0} className="h-1.5" />
            </div>
          )}

          {connection.status === "error" && (
            <p className="mt-2 text-sm text-rose-700">
              Falha na sincronização: {connection.error ?? "token inválido"}
            </p>
          )}
        </div>

        <div className="shrink-0">
          {!provider.available ? null : connection.status === "disconnected" ? (
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={onConnect}
              disabled={isConnecting}
            >
              {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Conectar
            </Button>
          ) : connection.status === "error" ? (
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700"
              onClick={onReconnect}
            >
              Reconectar
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onReconfigure}>
              Reconfigurar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
