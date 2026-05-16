"use client";
import QuotePage from "~/components/suite/quote/QuotePage.jsx";
import QuoteTable from "~/components/suite/quote/QuoteTable.jsx";
import { fetchCotizar, overwriteDiscount } from "~/lib/ordersApi.js";
import OrderActions from "./actions.jsx";

export default function QuotePageOrder({ setOrder, ...props }) {
  return (
    <QuotePage
      {...props}
      TableComponent={QuoteTable}
      fetchItems={fetchCotizar}
      tableProps={{
        overwriteDiscount,
        ActionsComponent: OrderActions,
        actionsProps: { setOrder },
        title: "COTIZACIÓN DE ORDEN",
        isDistribuidor: true,
      }}
    />
  );
}
