import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { mockLayoutDefaults, mockRestaurants, type Restaurant } from "./mock-data";

type LayoutContextValue = {
  restaurants: Restaurant[];
  activeRestaurant: Restaurant;
  setActiveRestaurant: (r: Restaurant) => void;
  whatsappConnected: boolean;
  setWhatsappConnected: (v: boolean) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant>(mockRestaurants[0]);
  const [whatsappConnected, setWhatsappConnected] = useState(mockLayoutDefaults.whatsappConnected);

  const value = useMemo<LayoutContextValue>(
    () => ({
      restaurants: mockRestaurants,
      activeRestaurant,
      setActiveRestaurant,
      whatsappConnected,
      setWhatsappConnected,
    }),
    [activeRestaurant, whatsappConnected],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
