"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DailyUsage } from "@/lib/types";

interface UsageChartProps {
  data: DailyUsage[];
}

export function UsageChart({ data }: UsageChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // "MM-DD"
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="prompt_tokens"
          stroke="hsl(var(--chart-1))"
          name="프롬프트 토큰"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="completion_tokens"
          stroke="hsl(var(--chart-2))"
          name="완성 토큰"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="request_count"
          stroke="hsl(var(--chart-3))"
          name="요청 수"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
