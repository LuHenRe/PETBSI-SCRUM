"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { BacklogItem, Sprint } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/labels";

// O recharts suporta vars CSS diretamente nas props!
const STATUS_COLORS: Record<string, string> = {
  backlog: "var(--muted)",
  todo: "var(--info)",
  in_progress: "var(--primary)",
  blocked: "var(--danger)",
  review: "var(--warning)",
  done: "var(--success)",
};

export function WorkloadPieChart({ items }: { items: BacklogItem[] }) {
  const data = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([status, value]) => ({
        name: STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status,
        value,
        fill: STATUS_COLORS[status] || "var(--muted)",
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [items]);

  if (data.length === 0) {
    return <div className="text-muted text-sm flex items-center justify-center h-full">Nenhum dado</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={285}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy={70}
          innerRadius={55}
          outerRadius={75}
          stroke="var(--surface)"
          strokeWidth={2}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: any) => [`${value} (${((Number(value) / items.length) * 100).toFixed(0)}%)`, name]}
          contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
          itemStyle={{ color: "var(--text)" }}
        />
        <Legend
          verticalAlign="bottom"
          height={100}
          wrapperStyle={{ fontSize: 12, color: "var(--text-soft)" }}
          formatter={(value, entry: any) => {
            const percent = ((entry.payload.value / items.length) * 100).toFixed(0);
            return `${value}: ${entry.payload.value} (${percent}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SprintBurndownChart({ sprint, items, mode, onModeChange }: { sprint: Sprint; items: BacklogItem[]; mode: "burndown" | "burnup"; onModeChange: (mode: "burndown" | "burnup") => void }) {
  const data = useMemo(() => {
    if (!sprint || items.length === 0) return [];

    // Ajuste de datas (UTC/locais) para mock consistente
    const start = new Date(sprint.startDate + "T00:00:00");
    const end = new Date(sprint.endDate + "T00:00:00");
    const today = new Date("2026-09-15T00:00:00"); // data atual fixa do ambiente demo

    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const totalItems = items.length;
    const doneItems = items.filter(i => i.status === "done").length;

    // Gerar pontos simulados de progressão
    const dataPoints = [];
    let currentRemaining = totalItems;
    let currentDone = 0;

    const pastDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    let itemsToDistribute = doneItems;
    const dropPerDay = pastDays > 0 ? doneItems / pastDays : 0;
    let accumulatedDrop = 0;

    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(start.getTime() + i * 24 * 3600 * 1000);
      const isPastOrToday = date <= today;

      const idealRemaining = Math.max(0, totalItems - (totalItems / totalDays) * i);
      const idealDone = (totalItems / totalDays) * i;

      if (isPastOrToday && i > 0 && itemsToDistribute > 0) {
        accumulatedDrop += dropPerDay;
        const dropNow = Math.floor(accumulatedDrop);
        accumulatedDrop -= dropNow;

        const actualDrop = Math.min(itemsToDistribute, dropNow + (i === pastDays ? Math.ceil(accumulatedDrop) : 0));
        currentRemaining -= actualDrop;
        currentDone += actualDrop;
        itemsToDistribute -= actualDrop;
      }

      dataPoints.push({
        day: `Dia ${i}`,
        date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        ideal: mode === "burndown" ? parseFloat(idealRemaining.toFixed(1)) : parseFloat(idealDone.toFixed(1)),
        real: isPastOrToday ? (mode === "burndown" ? currentRemaining : currentDone) : null,
      });
    }

    return dataPoints;
  }, [sprint, items, mode]);

  if (data.length === 0) {
    return <div className="text-muted text-sm flex items-center justify-center h-full">Nenhum dado</div>;
  }

  return (
    <div style={{ position: "relative" }}>
      <div className="flex gap-2" style={{ position: "absolute", top: -35, right: 0, zIndex: 10 }}>
        <button
          onClick={() => onModeChange("burndown")}
          className={`btn btn-sm ${mode === "burndown" ? "btn-secondary" : "btn-ghost"}`}
          style={{ fontSize: 11, padding: "4px 8px" }}
        >
          Burndown
        </button>
        <button
          onClick={() => onModeChange("burnup")}
          className={`btn btn-sm ${mode === "burnup" ? "btn-secondary" : "btn-ghost"}`}
          style={{ fontSize: 11, padding: "4px 8px" }}
        >
          Burnup
        </button>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-soft)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "var(--text-soft)" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
            itemStyle={{ color: "var(--text)" }}
            labelStyle={{ color: "var(--text-soft)", marginBottom: 4 }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, color: "var(--text-soft)" }} />
          <Line type="monotone" name="Tendência Ideal" dataKey="ideal" stroke="var(--muted)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          <Line type="monotone" name={mode === "burndown" ? "Restantes (Real)" : "Concluídos (Real)"} dataKey="real" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--surface)", strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
