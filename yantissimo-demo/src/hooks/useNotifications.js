"use client";
import { useState, useEffect } from "react";
import { getJson } from "~/lib/api";
import { ROLES } from "~/utils/session";

const ROLES_WITH_ORDERS = [
  ROLES.ADMIN,
  ROLES.MARKETING,
  ROLES.MYR_MANAGER,
  ROLES.MYR_SELLER,
  ROLES.MYR_HELPER,
];

export function useNotifications(user) {
  const [agentCount, setAgentCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCounts = async () => {
      try {
        const isMarketing = user.role >= ROLES.MARKETING;
        const isMyrSeller = user.role === ROLES.MYR_SELLER;

        const agentParams = isMarketing
          ? {}
          : { sucursal: user.sucursal, userId: user.id };
        const agentData = await getJson(
          "/api/conversations/count",
          agentParams
        );
        setAgentCount(agentData?.count ?? 0);

        if (ROLES_WITH_ORDERS.includes(user.role)) {
          const ordersParams = isMyrSeller ? { seller_id: user.id } : {};
          const ordersData = await getJson("/api/orders/count", ordersParams);
          setOrdersCount(ordersData?.count ?? 0);
        }
      } catch (_) {
        // Notification counts are non-critical — fail silently
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { agentCount, ordersCount };
}
