"use client";
import PreQuotePageBase from "~/components/suite/prequote/PreQuotePageBase.jsx";
import { doctypeOptionsMyr } from "~/utils/global.js";

export default function PreQuotePageClient(props) {
  return (
    <PreQuotePageBase
      {...props}
      enableServices={false}
      enableVehicleDialog={false}
      enableSaveButtons={false}
      priceMode="distContado"
      doctypeOptions={doctypeOptionsMyr}
      defaultType="cartdraft"
      isSearchDisabled={(quote) =>
        doctypeOptionsMyr[quote?.type || "cartdraft"]?.idx >
        doctypeOptionsMyr["confirmed"].idx
      }
      availabilityLabel="Envio"
      availabilityValue={(it) => it?.disponibilidad?.tiempo || "desconocido"}
    />
  );
}
