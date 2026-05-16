"use client";
import { useMemo } from "react";

const DOW = ["D", "L", "M", "M", "J", "V", "S"];

/**
 * @param year, month (0-based)
 * @param daysWithData Set<number> — días del mes con historial
 * @param selectedDay number | null
 * @param onSelectDay (day:number) => void
 */
export default function HistorialCalendar({
  year,
  month,
  daysWithData = new Set(),
  selectedDay = null,
  today = null,
  onSelectDay,
}) {
  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < startDow; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [year, month]);

  return (
    <div className="cal-wrap">
      <div className="cal-dow-row">
        {DOW.map((d, i) => (
          <div className="cal-dow" key={i}>
            {d}
          </div>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d == null) return <div className="cal-day empty" key={i} />;
          const hasData = daysWithData.has(d);
          const isSelected = selectedDay === d;
          const isToday = today === d;
          const cls = [
            "cal-day",
            hasData ? "has-data" : "",
            isSelected ? "selected" : "",
            isToday ? "today" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div key={i} className={cls} onClick={() => onSelectDay?.(d)}>
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
