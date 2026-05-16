'use client';

import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';

import FilterChip from '../ui/FilterChip';

import ClusterStudio from './ClusterStudio';
import SweepBuilder from './SweepBuilder';
import ParetoLeaderboard from './ParetoLeaderboard';
import ExperimentList from './ExperimentList';
import DiagnosticPanel from './DiagnosticPanel';

const SECTIONS = [
  { id: 'diagnostic', label: 'Diagnóstico' },
  { id: 'cluster', label: 'Cluster Studio' },
  { id: 'sweep', label: 'Parameter Sweep' },
  { id: 'pareto', label: 'Pareto' },
  { id: 'experiments', label: 'Experimentos' },
];

export default function LabDashboard() {
  const [section, setSection] = useState('diagnostic');

  return (
    <Box sx={{ p: 2, maxWidth: 1280, margin: '0 auto' }}>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
          Laboratorio VRP
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Diagnostica la instancia, elige familia de algoritmo, experimenta con clusters y barridos de parámetros.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
        {SECTIONS.map((s) => (
          <FilterChip
            key={s.id}
            label={s.label}
            active={section === s.id}
            onClick={() => setSection(s.id)}
            mono={false}
          />
        ))}
      </Stack>

      {section === 'diagnostic' && <DiagnosticPanel />}
      {section === 'cluster' && <ClusterStudio />}
      {section === 'sweep' && <SweepBuilder />}
      {section === 'pareto' && <ParetoLeaderboard />}
      {section === 'experiments' && <ExperimentList />}
    </Box>
  );
}
