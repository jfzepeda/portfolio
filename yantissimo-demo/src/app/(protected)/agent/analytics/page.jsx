"use client";
// Añadir busqusqueda de personas
import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { NewBadge } from "~/resources/badges";
import { CustomGraph, WeeklyGreph, MonthlyGraph } from "./components";
import dayjs from "dayjs";
import { loadMonthly, loadWeekly, loadCustomStats } from "./functions";
import Header from "~/components/header";

const AnalyticsPage = () => {
  // ----------------- MONTHLY -----------------
  const today = dayjs();
  const [month, setMonth] = useState(today.format("YYYY-MM")); // YYYY-MM
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalMes, setTotalMes] = useState(0);

  useEffect(() => {
    loadMonthly(month)
      .then((data) => {
        setMonthlyData(data);
        const total = data.reduce((sum, item) => sum + item.usuarios, 0);
        setTotalMes(total);
      })
      .catch((err) => console.error("Error loading monthly data:", err));
  }, [month]);

  const displayMonth = useMemo(() => {
    const [year, monthNum] = month.split("-");
    const dateObj = new Date(Number(year), Number(monthNum) - 1, 1);
    const monthName = dateObj.toLocaleString("es-ES", { month: "long" });
    return `${
      monthName.charAt(0).toUpperCase() + monthName.slice(1)
    } ${year.slice(2)}`;
  }, [month]);

  const monthOptions = useMemo(() => {
    const start = new Date(2025, 4); // mayo es mes 4 (0-index)
    const now = new Date();
    const options = [];
    const date = new Date(start);
    while (date <= now) {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const value = `${y}-${String(m).padStart(2, "0")}`;
      const name = date.toLocaleString("es-ES", { month: "long" });
      const yearShort = String(y).slice(2);
      options.push({
        value,
        label: `${name.charAt(0).toUpperCase() + name.slice(1)} ${yearShort}`,
      });
      date.setMonth(date.getMonth() + 1);
    }
    return options;
  }, []);

  // ----------------- WEEKLY -----------------
  const [semanas, setSemanas] = useState(4);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalSemanas, setTotalSemanas] = useState(0);

  useEffect(() => {
    loadWeekly(semanas)
      .then((data) => {
        setWeeklyData(data);
        const total = data.reduce((sum, item) => sum + item.usuarios, 0);
        setTotalSemanas(total);
      })
      .catch((err) => console.error("Error loading weekly data:", err));
  }, [semanas]);

  // ----------------- CUSTOM RANGE -----------------
  const [customDate, setCustomDate] = useState({
    start: dayjs().subtract(14, "day"),
    end: dayjs(),
  });
  const [customData, setCustomData] = useState([]);
  const [totalCustom, setTotalCustom] = useState(0);

  useEffect(() => {
    // Validación y normalización del rango seleccionado
    const startVal = customDate?.start;
    const endVal = customDate?.end;
    if (!startVal || !endVal || !startVal.isValid?.() || !endVal.isValid?.()) {
      return; // Espera a tener ambas fechas válidas
    }

    // Asegurar orden correcto (from <= to)
    const startNorm = startVal.startOf("day");
    const endNorm = endVal.endOf("day");
    const from = startNorm.isAfter(endNorm) ? endNorm : startNorm;
    const to = startNorm.isAfter(endNorm) ? startNorm : endNorm;

    const startISO = from.toDate().toISOString();
    const start = from.format("YYYY-MM-DD");
    const end = to.format("YYYY-MM-DD");

    loadCustomStats(start, end, startISO)
      .then((data) => {
        setCustomData(data);
        const total = data.reduce((sum, item) => sum + item.usuarios, 0);
        setTotalCustom(total);
      })
      .catch((err) => console.error("Error loading custom data:", err));
  }, [customDate]);

  return (
    <Box>
      <Header
        title={
          <>
            Analíticas
            <NewBadge />
          </>
        }
      />

      <MonthlyGraph
        data={monthlyData}
        total={totalMes}
        month={month}
        onChangeMonth={setMonth}
        monthOptions={monthOptions}
        displayMonth={displayMonth}
      />

      <WeeklyGreph
        data={weeklyData}
        semanas={semanas}
        total={totalSemanas}
        onChangeSemanas={setSemanas}
      />

      <CustomGraph
        data={customData}
        total={totalCustom}
        startDate={customDate.start}
        endDate={customDate.end}
        onChangeStart={(newDate) => {
          if (newDate && newDate.isValid?.()) {
            setCustomDate((p) => ({ ...p, start: newDate }));
          }
        }}
        onChangeEnd={(newDate) => {
          if (newDate && newDate.isValid?.()) {
            setCustomDate((p) => ({ ...p, end: newDate }));
          }
        }}
      />
    </Box>
  );
};

export default AnalyticsPage;
