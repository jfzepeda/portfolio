"use client";
import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export const MonthlyGraph = ({
  data,
  total,
  month,
  onChangeMonth,
  monthOptions,
  displayMonth,
}) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
        }}
      >
        <Box>
          <Typography variant="h5">Tráfico mensual</Typography>
          <Typography variant="h6">
            Tráfico total de {displayMonth}: <b>{total}</b>
          </Typography>
        </Box>
        <FormControl>
          <InputLabel id="month-select-label">Mes</InputLabel>
          <Select
            labelId="month-select-label"
            value={month}
            label="Mes"
            onChange={(e) => onChangeMonth(e.target.value)}
          >
            {monthOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ width: "100%", height: 300, mt: 1.5 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="usuarios" name="Tráfico diario" fill="#2C3E50" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
};

export const WeeklyGreph = ({ data, semanas, total, onChangeSemanas }) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
        }}
      >
        <Box>
          <Typography variant="h5">
            Tráfico de las últimas <b>{semanas}</b> semanas
          </Typography>
          <Typography variant="h6">
            Tráfico total: <b>{total}</b>
          </Typography>
        </Box>
        <FormControl>
          <InputLabel id="weeks-select-label">Semanas</InputLabel>
          <Select
            labelId="weeks-select-label"
            value={semanas}
            label="Semanas"
            onChange={(e) => onChangeSemanas(Number(e.target.value))}
          >
            {Array.from({ length: 9 }, (_, i) => 4 + i).map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt} Semanas
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ width: "100%", height: 300, mt: 1.5 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="usuarios" name="Tráfico semanal" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
};

export const CustomGraph = ({
  data,
  total,
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
}) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
        }}
      >
        <Box>
          <Typography variant="h5">
            Búsqueda personalizada de tráfico
          </Typography>
          <Typography variant="h6">
            Tráfico total: <b>{total}</b>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              variant="standard"
              fullWidth
              label="Fecha de inicio"
              value={startDate || dayjs().subtract(14, "day")}
              onChange={onChangeStart}
              slotProps={{
                textField: {
                  InputProps: { disableUnderline: true },
                  sx: {
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  },
                },
              }}
            />
            <DatePicker
              variant="standard"
              fullWidth
              label="Fecha de fin"
              value={endDate || dayjs()}
              onChange={onChangeEnd}
              slotProps={{
                textField: {
                  InputProps: { disableUnderline: true },
                  sx: {
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Box>
      <Box sx={{ width: "100%", height: 300, mt: 1 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="usuarios" name="Tráfico diario" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
};
