"use client";
import { post } from "~/lib/api";

export async function saveNewOrder({ userProfile, quoteData }) {
  console.debug("Saving new order with data:", quoteData, userProfile);
  const payload = {
    client_id: userProfile?.id || null,
    phone: userProfile?.phone,
    additional_notes: quoteData.additional_notes,
    items: quoteData?.items,
    sucursal: userProfile?.sucursal || null,
  };
  try {
    const response = await post("/api/orders/plataforma", payload);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al guardar cotización");
    }
    window.showToast("Cotización guardada exitosamente");
    const savedQuote = await response.json();
    return savedQuote;
  } catch (error) {
    console.error("Error al guardar la cotización:", error);
    window.showToast("Error al guardar la cotización", "error");
  }
}
