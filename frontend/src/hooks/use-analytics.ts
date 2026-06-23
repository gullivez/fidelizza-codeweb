import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getDashboard,
  getRfmDistribution,
  getWhatsappStatus,
  type AnalyticsPeriod,
  type DashboardResponse,
  type RfmDistribution,
  type WhatsappStatus,
} from "@/lib/api/analytics";

interface UseAnalyticsResult {
  dashboard: DashboardResponse | null;
  rfm: RfmDistribution | null;
  whatsappStatus: WhatsappStatus | null;
  loading: boolean;
  error: boolean;
}

export function useAnalytics(
  restaurantId: string | undefined,
  period: AnalyticsPeriod,
): UseAnalyticsResult {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [rfm, setRfm] = useState<RfmDistribution | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsappStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.all([
      getDashboard(restaurantId, period),
      getRfmDistribution(restaurantId),
      getWhatsappStatus(restaurantId),
    ])
      .then(([dashboardRes, rfmRes, whatsappRes]) => {
        if (cancelled) return;
        setDashboard(dashboardRes);
        setRfm(rfmRes);
        setWhatsappStatus(whatsappRes);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(true);
        toast.error(err instanceof Error ? err.message : "Falha ao carregar dados do dashboard");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId, period]);

  return { dashboard, rfm, whatsappStatus, loading, error };
}
