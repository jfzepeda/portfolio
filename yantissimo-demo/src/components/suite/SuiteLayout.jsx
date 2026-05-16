"use client";

import { Box } from "@mui/material";

export const SUITE_CONTENT_MARGIN_LEFT = 72;

export default function SuiteLayout({ children, sx }) {
  return (
    <Box
      sx={[
        {
          ml: `${SUITE_CONTENT_MARGIN_LEFT}px`,
          width: `calc(100% - ${SUITE_CONTENT_MARGIN_LEFT}px)`,
        },
        sx,
      ]}
    >
      {children}
    </Box>
  );
}
