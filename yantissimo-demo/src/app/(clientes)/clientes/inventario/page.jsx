// app/(protected)/cotizaciones/[id]/[doctype]/page.jsx
import { redirect } from "next/navigation";

export default function Page({ params }) {
  // /cotizaciones/:id/:doctype  ->  /cotizaciones/:id/:doctype/cartdraft
  redirect(`/clientes/inventario/${params.id ?? "nueva"}`);
}
