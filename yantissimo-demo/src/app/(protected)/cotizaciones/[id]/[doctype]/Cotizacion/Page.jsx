"use client";
import QuotePage from "~/components/suite/quote/QuotePage.jsx";
import QuoteTable from "~/components/suite/quote/QuoteTable.jsx";
import {
  fetchCotizar,
  upgradeToQuote,
  overwriteDiscount,
} from "~/lib/quoteApi.js";
import QuoteActions from "./actions.jsx";

export default function QuotePageQuote(props) {
  return (
    <QuotePage
      {...props}
      TableComponent={QuoteTable}
      fetchItems={fetchCotizar}
      onPrequoteUpgrade={upgradeToQuote}
      enableClubYantissimo={true}
      tableProps={{
        overwriteDiscount,
        ActionsComponent: QuoteActions,
      }}
    />
  );
}
