export type Segment = "todos" | "campeoes" | "novos" | "em-risco" | "inativos";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  segment: Exclude<Segment, "todos">;
  lastOrderAt: string; // ISO
  orders: number;
  totalSpent: number;
  optOut?: boolean;
};

export const segmentLabels: Record<Exclude<Segment, "todos">, string> = {
  campeoes: "Campeões",
  novos: "Novos",
  "em-risco": "Em Risco",
  inativos: "Inativos",
};

// Aggregate counts shown in chips (simulando base real do restaurante)
export const segmentCounts: Record<Segment, number> = {
  todos: 1240,
  campeoes: 89,
  novos: 156,
  "em-risco": 342,
  inativos: 653,
};

const today = new Date();
function daysAgo(d: number) {
  const x = new Date(today);
  x.setDate(today.getDate() - d);
  return x.toISOString();
}

export const mockCustomers: Customer[] = [
  // Campeões
  { id: "c1", name: "Mariana Oliveira", phone: "(11) 98123-4501", segment: "campeoes", lastOrderAt: daysAgo(2), orders: 24, totalSpent: 1842 },
  { id: "c2", name: "Rafael Almeida", phone: "(11) 97654-3210", segment: "campeoes", lastOrderAt: daysAgo(4), orders: 18, totalSpent: 1356 },
  { id: "c3", name: "Carolina Mendes", phone: "(21) 99812-7733", segment: "campeoes", lastOrderAt: daysAgo(1), orders: 31, totalSpent: 2410 },
  { id: "c4", name: "Bruno Tavares", phone: "(11) 99201-4488", segment: "campeoes", lastOrderAt: daysAgo(3), orders: 14, totalSpent: 1124 },

  // Novos
  { id: "c5", name: "Letícia Ramos", phone: "(11) 98876-1290", segment: "novos", lastOrderAt: daysAgo(2), orders: 1, totalSpent: 78 },
  { id: "c6", name: "Diego Nascimento", phone: "(11) 99432-7821", segment: "novos", lastOrderAt: daysAgo(5), orders: 2, totalSpent: 142 },
  { id: "c7", name: "Camila Ferreira", phone: "(21) 98123-5544", segment: "novos", lastOrderAt: daysAgo(7), orders: 1, totalSpent: 56 },
  { id: "c8", name: "Lucas Pereira", phone: "(31) 99887-1230", segment: "novos", lastOrderAt: daysAgo(9), orders: 2, totalSpent: 168 },
  { id: "c9", name: "Júlia Cardoso", phone: "(11) 98765-9988", segment: "novos", lastOrderAt: daysAgo(11), orders: 1, totalSpent: 92 },
  { id: "c10", name: "Henrique Lima", phone: "(11) 99123-8877", segment: "novos", lastOrderAt: daysAgo(13), orders: 2, totalSpent: 134 },

  // Em risco
  { id: "c11", name: "Aline Souza", phone: "(11) 98012-7766", segment: "em-risco", lastOrderAt: daysAgo(15), orders: 7, totalSpent: 612 },
  { id: "c12", name: "Felipe Carvalho", phone: "(11) 99201-6655", segment: "em-risco", lastOrderAt: daysAgo(18), orders: 5, totalSpent: 388 },
  { id: "c13", name: "Patrícia Gomes", phone: "(21) 98712-3344", segment: "em-risco", lastOrderAt: daysAgo(17), orders: 9, totalSpent: 742, optOut: true },
  { id: "c14", name: "Rodrigo Martins", phone: "(11) 99888-1122", segment: "em-risco", lastOrderAt: daysAgo(20), orders: 6, totalSpent: 498 },
  { id: "c15", name: "Vanessa Ribeiro", phone: "(11) 98123-7755", segment: "em-risco", lastOrderAt: daysAgo(22), orders: 4, totalSpent: 312 },
  { id: "c16", name: "Thiago Barbosa", phone: "(31) 99012-3344", segment: "em-risco", lastOrderAt: daysAgo(24), orders: 8, totalSpent: 656 },
  { id: "c17", name: "Renata Costa", phone: "(11) 97712-8899", segment: "em-risco", lastOrderAt: daysAgo(19), orders: 5, totalSpent: 412 },
  { id: "c18", name: "Gustavo Pinto", phone: "(11) 98876-3322", segment: "em-risco", lastOrderAt: daysAgo(26), orders: 4, totalSpent: 298 },
  { id: "c19", name: "Beatriz Andrade", phone: "(21) 99012-7766", segment: "em-risco", lastOrderAt: daysAgo(21), orders: 6, totalSpent: 524 },
  { id: "c20", name: "Marcelo Duarte", phone: "(11) 99876-2211", segment: "em-risco", lastOrderAt: daysAgo(28), orders: 3, totalSpent: 244 },
  { id: "c21", name: "Isabela Moreira", phone: "(11) 98012-3399", segment: "em-risco", lastOrderAt: daysAgo(16), orders: 7, totalSpent: 588 },
  { id: "c22", name: "André Siqueira", phone: "(11) 99765-4422", segment: "em-risco", lastOrderAt: daysAgo(23), orders: 5, totalSpent: 402 },

  // Inativos
  { id: "c23", name: "Fernanda Rocha", phone: "(11) 98012-4455", segment: "inativos", lastOrderAt: daysAgo(35), orders: 3, totalSpent: 198 },
  { id: "c24", name: "Eduardo Vieira", phone: "(11) 99812-3344", segment: "inativos", lastOrderAt: daysAgo(42), orders: 2, totalSpent: 152 },
  { id: "c25", name: "Tatiana Lopes", phone: "(21) 98765-2211", segment: "inativos", lastOrderAt: daysAgo(48), orders: 4, totalSpent: 312 },
  { id: "c26", name: "Vinícius Araújo", phone: "(11) 99876-1100", segment: "inativos", lastOrderAt: daysAgo(55), orders: 2, totalSpent: 178, optOut: true },
  { id: "c27", name: "Priscila Santos", phone: "(11) 98123-4488", segment: "inativos", lastOrderAt: daysAgo(38), orders: 5, totalSpent: 388 },
  { id: "c28", name: "Caio Monteiro", phone: "(31) 99887-3322", segment: "inativos", lastOrderAt: daysAgo(62), orders: 1, totalSpent: 84 },
  { id: "c29", name: "Sabrina Freitas", phone: "(11) 99765-1122", segment: "inativos", lastOrderAt: daysAgo(45), orders: 3, totalSpent: 224 },
  { id: "c30", name: "Leandro Cunha", phone: "(11) 98012-6677", segment: "inativos", lastOrderAt: daysAgo(72), orders: 2, totalSpent: 168 },
  { id: "c31", name: "Daniela Pires", phone: "(21) 98876-4499", segment: "inativos", lastOrderAt: daysAgo(50), orders: 4, totalSpent: 308 },
  { id: "c32", name: "Ricardo Bastos", phone: "(11) 99201-8833", segment: "inativos", lastOrderAt: daysAgo(85), orders: 1, totalSpent: 72 },
  { id: "c33", name: "Larissa Brito", phone: "(11) 98765-1199", segment: "inativos", lastOrderAt: daysAgo(40), orders: 3, totalSpent: 256 },
  { id: "c34", name: "Murilo Teixeira", phone: "(31) 99812-4477", segment: "inativos", lastOrderAt: daysAgo(60), orders: 2, totalSpent: 142 },
  { id: "c35", name: "Carla Nogueira", phone: "(11) 99876-8822", segment: "inativos", lastOrderAt: daysAgo(46), orders: 5, totalSpent: 402, optOut: true },
  { id: "c36", name: "Pedro Henrique", phone: "(11) 98012-9911", segment: "inativos", lastOrderAt: daysAgo(78), orders: 1, totalSpent: 64 },
  { id: "c37", name: "Amanda Correia", phone: "(21) 99201-3322", segment: "inativos", lastOrderAt: daysAgo(34), orders: 4, totalSpent: 312 },
  { id: "c38", name: "Igor Magalhães", phone: "(11) 99765-8844", segment: "inativos", lastOrderAt: daysAgo(95), orders: 1, totalSpent: 78 },
  { id: "c39", name: "Bianca Faria", phone: "(11) 98876-2233", segment: "inativos", lastOrderAt: daysAgo(52), orders: 3, totalSpent: 234 },
  { id: "c40", name: "Otávio Macedo", phone: "(11) 99812-7711", segment: "inativos", lastOrderAt: daysAgo(110), orders: 2, totalSpent: 156 },
];

export function filterCustomers(segment: Segment, query: string): Customer[] {
  const q = query.trim().toLowerCase();
  return mockCustomers.filter((c) => {
    if (segment !== "todos" && c.segment !== segment) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
    );
  });
}
