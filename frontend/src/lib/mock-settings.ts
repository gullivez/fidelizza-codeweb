export type Role = "owner" | "admin" | "operator";
export type AccountType = "single" | "agency";
export type BillingStatus = "active" | "past_due" | "canceled";
export type WhatsAppHealth = "healthy" | "warming" | "disconnected";

export const CURRENT_USER = {
  role: "owner" as Role,
  accountType: "agency" as AccountType,
};

export const ACCOUNT = {
  empresa: "Burger House Brasil Ltda",
  cnpj: "12.345.678/0001-90",
  plano: "Pro",
  billingStatus: "active" as BillingStatus,
  limites: { whatsappNumeros: 3, restaurantes: 5 },
  uso: { whatsappNumeros: 1, restaurantes: 3 },
};

export const WHATSAPP = {
  connected: true,
  numero: "+55 11 98765-4321",
  health: "healthy" as WhatsAppHealth,
};

export type SettingsUser = {
  id: string;
  nome: string;
  email: string;
  role: Role;
  status: "ativo" | "pendente";
};

export const USERS: SettingsUser[] = [
  { id: "u1", nome: "Ana Souza", email: "ana@burgerhouse.com.br", role: "owner", status: "ativo" },
  { id: "u2", nome: "Bruno Lima", email: "bruno@burgerhouse.com.br", role: "admin", status: "ativo" },
  { id: "u3", nome: "Carla Mendes", email: "carla@burgerhouse.com.br", role: "operator", status: "ativo" },
  { id: "u4", nome: "Diego Rocha", email: "diego@burgerhouse.com.br", role: "operator", status: "pendente" },
];

export type SettingsRestaurant = {
  id: string;
  nome: string;
  status: "ativo" | "arquivado";
  clientes: number;
  whatsappConnected: boolean;
};

export const RESTAURANTS: SettingsRestaurant[] = [
  { id: "r1", nome: "Burger House Vila Madá", status: "ativo", clientes: 3420, whatsappConnected: true },
  { id: "r2", nome: "Burger House Pinheiros", status: "ativo", clientes: 2180, whatsappConnected: false },
  { id: "r3", nome: "Burger House Moema", status: "ativo", clientes: 1560, whatsappConnected: true },
];

export const PREFS = {
  timezone: "America/Sao_Paulo",
  restaurantName: "Burger House",
};

export const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "(GMT-3) Brasília — São Paulo" },
  { value: "America/Recife", label: "(GMT-3) Recife" },
  { value: "America/Manaus", label: "(GMT-4) Manaus" },
];

export function formatBR(n: number) {
  return n.toLocaleString("pt-BR");
}
