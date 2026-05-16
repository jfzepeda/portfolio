import React from "react";
import { Button, Stack } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import Header from "~/components/header";

const DashboardHeader = ({
  range,
  onRefresh,
  onExport,
  onOpenComplement,
  loadingFilters,
  loadingTable,
  exporting,
  creatingComplement,
}) => (
  <Header
    title="Clientes"
    subtitle={`Datos agregados por cliente (${range.from} a ${range.to})`}
    actions={
      <Stack direction="row" spacing={1}>
        {onOpenComplement ? (
          <Button
            variant="contained"
            color="secondary"
            onClick={onOpenComplement}
            disabled={loadingTable || creatingComplement}
          >
            {creatingComplement ? "Generando..." : "Complemento REP"}
          </Button>
        ) : null}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loadingTable || loadingFilters}
        >
          Refrescar
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          disabled={loadingTable || exporting}
        >
          {exporting ? "Exportando..." : "Exportar"}
        </Button>
      </Stack>
    }
  />
);

export default DashboardHeader;
