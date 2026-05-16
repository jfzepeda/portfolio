"use client";

import React from "react";
import { TablePagination } from "@mui/material";
import { PAGE_SIZE_OPTIONS } from "./constants";

function SuperTablePagination({
  totalCount,
  page,
  pageSize,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onPageChange,
  onRowsPerPageChange,
}) {
  return (
    <TablePagination
      component="div"
      count={totalCount}
      page={page}
      rowsPerPage={pageSize}
      rowsPerPageOptions={pageSizeOptions}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      labelRowsPerPage="Filas por página:"
      labelDisplayedRows={({ from, to, count }) =>
        `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
      }
    />
  );
}

export default React.memo(SuperTablePagination);
