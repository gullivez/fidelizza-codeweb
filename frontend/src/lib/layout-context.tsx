import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ApiRestaurant, AuthUser } from "./api-types";
import { consumeAuthData } from "./auth-store";
import { getWhatsappStatus } from "./api/analytics";

type LayoutContextValue = {
  restaurants: ApiRestaurant[];
  activeRestaurant: ApiRestaurant | null;
  setActiveRestaurant: (r: ApiRestaurant) => void;
  setRestaurants: (list: ApiRestaurant[]) => void;
  updateRestaurant: (updated: ApiRestaurant) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser) => void;
  whatsappConnected: boolean;
  setWhatsappConnected: (v: boolean) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurantsState] = useState<ApiRestaurant[]>([]);
  const [activeRestaurant, setActiveRestaurant] = useState<ApiRestaurant | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  useEffect(() => {
    const { user, restaurants } = consumeAuthData();
    if (user) setCurrentUser(user);
    if (restaurants.length) setRestaurants(restaurants);
    // Roda uma única vez ao montar — consumeAuthData() limpa o store após leitura
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeRestaurant) return;
    let cancelled = false;

    getWhatsappStatus(activeRestaurant.id)
      .then((status) => {
        if (cancelled) return;
        setWhatsappConnected(status.healthy);
      })
      .catch(() => {
        if (cancelled) return;
        setWhatsappConnected(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeRestaurant]);

  const setRestaurants = useCallback((list: ApiRestaurant[]) => {
    setRestaurantsState(list);
    setActiveRestaurant((prev) => {
      if (prev) {
        const still = list.find((r) => r.id === prev.id);
        return still ?? list[0] ?? null;
      }
      return list[0] ?? null;
    });
  }, []);

  const updateRestaurant = useCallback((updated: ApiRestaurant) => {
    setRestaurantsState((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setActiveRestaurant((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  const value = useMemo<LayoutContextValue>(
    () => ({
      restaurants,
      activeRestaurant,
      setActiveRestaurant,
      setRestaurants,
      updateRestaurant,
      currentUser,
      setCurrentUser,
      whatsappConnected,
      setWhatsappConnected,
    }),
    [
      restaurants,
      activeRestaurant,
      setRestaurants,
      updateRestaurant,
      currentUser,
      whatsappConnected,
    ],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
