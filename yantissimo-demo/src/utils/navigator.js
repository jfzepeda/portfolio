"use client";
import { usePathname, useRouter } from "next/navigation";

export const useNavBack = () => {
  const router = useRouter();
  const pathname = usePathname();
  // eliminate the last segment of the path
  const navigateBack = () => {
    const pathSegments = pathname.split("/").filter((segment) => segment);
    if (pathSegments.length > 1) {
      pathSegments.pop();
      const newPath = "/" + pathSegments.join("/");
      router.push(newPath);
    } else {
      router.push("/"); // or any default path
    }
  };
  return navigateBack;
};

export const useNavBack2 = () => {
  const router = useRouter();
  const pathname = usePathname();
  // eliminate the last 2 segment of the path
  // http://localhost:3000/cotizaciones/368/pre -> http://localhost:3000/cotizaciones
  const navigateBack = () => {
    const pathSegments = pathname.split("/").filter((segment) => segment);
    if (pathSegments.length > 2) {
      pathSegments.pop();
      pathSegments.pop();
      const newPath = "/" + pathSegments.join("/");
      router.push(newPath);
    } else {
      router.push("/"); // or any default path
    }
  };
  return navigateBack;
};
