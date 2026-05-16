"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/cotizaciones"); // la nueva ruta de bienvenida
  }, [router]);

  return null;
}
