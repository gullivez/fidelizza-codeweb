import { useNavigate } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatNumber } from "@/lib/mock-dashboard";

export function ConfirmDispatchDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
  scheduled,
  scheduledAtLabel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  count: number;
  onConfirm: () => void;
  scheduled?: boolean;
  scheduledAtLabel?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {scheduled
              ? `Agendar para ${formatNumber(count)} clientes?`
              : `Enviar para ${formatNumber(count)} clientes?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {scheduled
              ? `Será enviada automaticamente em ${scheduledAtLabel}.`
              : "Esta ação não pode ser desfeita."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {scheduled ? "Confirmar agendamento" : "Confirmar e enviar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CancelScheduleDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar agendamento desta campanha?</AlertDialogTitle>
          <AlertDialogDescription>
            A campanha volta para rascunho e não será enviada automaticamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            Cancelar agendamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function WhatsAppDisconnectedDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Seu WhatsApp não está conectado.</AlertDialogTitle>
          <AlertDialogDescription>Conecte antes de disparar.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => navigate({ to: "/configuracoes" })}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Ir para Configurações
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
