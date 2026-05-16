"use client";
import PreQuotePageBase from "~/components/suite/prequote/PreQuotePageBase.jsx";
import { doctypeOptions } from "~/utils/global.js";

export default function PreQuotePageOrder(props) {
  return (
    <PreQuotePageBase
      {...props}
      enableServices={false}
      enableVehicleDialog={false}
      enableSaveButtons
      saveSelectionPath="/orders"
      priceMode="byClientType"
      doctypeOptions={doctypeOptions}
      defaultType="prequote"
    />
  );
}
