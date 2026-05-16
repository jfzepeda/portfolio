'use client';

import { Box } from '@mui/material';
import TopBar from './ui/TopBar';
import { DASHBOARD_TABS } from './dashboardTabs';
import WorkflowRibbon from './WorkflowRibbon';
import PageTransition from './PageTransition';
import CopilotPanel from './CopilotPanel';

export default function DashboardShell({ children }) {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        p: '14px',
        gap: '10px',
        background: 'transparent',
      }}
    >
      <TopBar tabs={DASHBOARD_TABS} />
      <WorkflowRibbon />
      <Box sx={{ minHeight: 0, overflow: 'hidden', borderRadius: '14px' }}>
        <PageTransition>{children}</PageTransition>
      </Box>
      <CopilotPanel />
    </Box>
  );
}
