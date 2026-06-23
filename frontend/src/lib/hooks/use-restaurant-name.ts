import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLayout } from "@/lib/layout-context";
import { updateRestaurant as updateRestaurantApi } from "@/lib/api/restaurants";

export function useRestaurantName() {
  const { activeRestaurant, updateRestaurant } = useLayout();
  const [name, setName] = useState(activeRestaurant?.name ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(activeRestaurant?.name ?? "");
  }, [activeRestaurant?.id, activeRestaurant?.name]);

  const save = async () => {
    if (!activeRestaurant) return;
    const previousName = activeRestaurant.name;
    setSaving(true);
    try {
      const updated = await updateRestaurantApi(activeRestaurant.id, { name });
      updateRestaurant(updated);
      setName(updated.name);
      toast.success("Nome do restaurante salvo");
    } catch {
      setName(previousName);
      toast.error("Não foi possível salvar o nome do restaurante");
    } finally {
      setSaving(false);
    }
  };

  return { name, setName, saving, save, hasRestaurant: !!activeRestaurant };
}
