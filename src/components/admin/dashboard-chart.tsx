"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toPersianDigits } from "@/lib/slug";
import { formatJalaliShort } from "@/lib/jalali";

type DataPoint = { date: string; count: number };

export function DashboardChart({ data }: { data: DataPoint[] }) {
  const formatted = React.useMemo(
    () =>
      data.map((d) => ({
        ...d,
        label: formatJalaliShort(new Date(d.date + "T00:00:00")),
        raw: d.date,
      })),
    [data]
  );

  return (
    <div className="h-56 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: string) => (typeof v === "string" ? v.split("/").slice(1).join("/") : v)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={28}
            tickFormatter={(v: number) => toPersianDigits(v)}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              direction: "rtl",
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            formatter={(value: number) => [`${toPersianDigits(value)} بازدید`, "بازدید"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#viewsGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
