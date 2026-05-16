"use client";
import PreQuotePageBase from "~/components/suite/prequote/PreQuotePageBase.jsx";
import { doctypeOptions } from "~/utils/global.js";

export default function PreQuotePageQuote(props) {
  return (
    <PreQuotePageBase
      {...props}
      enableServices
      enableVehicleDialog
      enableSaveButtons
      priceMode="byClientType"
      doctypeOptions={doctypeOptions}
      defaultType="prequote"
    />
  );
}
