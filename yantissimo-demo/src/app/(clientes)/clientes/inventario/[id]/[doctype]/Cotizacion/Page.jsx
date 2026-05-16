"use client";
import { useCallback } from "react";
import QuotePage from "~/components/suite/quote/QuotePage.jsx";
import ClientOrderTable from "~/components/suite/quote/OrderTable.jsx";
import { fetchCotizar, sendOrder } from "~/lib/ordersApi.js";
import Actions from "./actions.jsx";

export default function QuotePageClient(props) {
  const handleSendOrder = useCallback(async (cotId) => {
    const res = await sendOrder(cotId);
    if (!res?.allowed) {
      window?.showToast?.(res?.message || "No se pudo enviar la orden", "error");
      return false;
    }
    return true;
  }, []);

  return (
    <QuotePage
      {...props}
      TableComponent={ClientOrderTable}
      fetchItems={fetchCotizar}
      onPrequoteUpgrade={handleSendOrder}
      upgradeTypes={["cartdraft", "counteroffer"]}
      tableProps={{
        ActionsComponent: Actions,
      }}
    />
  );
}
