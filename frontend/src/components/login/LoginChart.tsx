import { Area, AreaChart, ResponsiveContainer } from "recharts";

const data = [
  { v: 12 },
  { v: 18 },
  { v: 16 },
  { v: 24 },
  { v: 28 },
  { v: 26 },
  { v: 35 },
  { v: 42 },
  { v: 48 },
  { v: 56 },
  { v: 62 },
  { v: 78 },
  { v: 88 },
  { v: 96 },
];

export function LoginChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#loginGradient)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
