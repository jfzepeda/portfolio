import dayjs from "dayjs";
import api from "~/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Generic fetch utility for stats endpoints
const fetchStats = async (path) => {
  const res = await api(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(res.statusText);
  const { data } = await res.json();
  return data;
};

export const loadMonthly = async (month) => {
  try {
    const usuariosPorDia = await fetchStats(
      `/api/stats/monthly?month=${month}`
    );
    return usuariosPorDia.map((count, i) => ({
      fecha: `${month}-${String(i + 1).padStart(2, "0")}`,
      usuarios: Number(count),
    }));
  } catch (err) {
    console.error("loadMonthly:", err);
    return [];
  }
};

export const loadWeekly = async (weeks) => {
  try {
    const semanas = await fetchStats(`/api/stats/weekly?weeks=${weeks}`);
    return semanas.map(({ semana, usuarios_por_dia }) => ({
      semana: new Date(semana).toISOString().slice(0, 10),
      usuarios: usuarios_por_dia.reduce((sum, u) => sum + Number(u), 0),
    }));
  } catch (err) {
    console.error("loadWeekly:", err);
    return [];
  }
};

export const loadCustomStats = async (start, end, startISO) => {
  try {
    const customStats = await fetchStats(
      `/api/stats/custom?start=${start}&end=${end}`
    );
    const base =
      startISO &&
      typeof startISO === "object" &&
      typeof startISO.add === "function"
        ? startISO
        : dayjs(startISO);

    return customStats.map((usuarios, index) => ({
      fecha: base.add(index, "day").format("YYYY-MM-DD"),
      usuarios: Number(usuarios),
    }));
  } catch (err) {
    console.error("loadCustomStats:", err);
    return [];
  }
};
