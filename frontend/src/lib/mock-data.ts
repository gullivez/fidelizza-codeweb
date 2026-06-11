export type Restaurant = {
  id: string;
  name: string;
  address: string;
};

export const mockRestaurants: Restaurant[] = [
  { id: "r1", name: "Cantina da Nona", address: "Rua Augusta, 1200 — São Paulo" },
  { id: "r2", name: "Burger Lab", address: "Av. Paulista, 900 — São Paulo" },
  { id: "r3", name: "Sushi Express", address: "Rua Oscar Freire, 450 — São Paulo" },
  { id: "r4", name: "Pizza Forno", address: "Av. Faria Lima, 3500 — São Paulo" },
];

export const mockUser = {
  name: "Ana Souza",
  email: "ana@fidelizza.com",
  initials: "AS",
};

export const mockLayoutDefaults = {
  whatsappConnected: false,
};
