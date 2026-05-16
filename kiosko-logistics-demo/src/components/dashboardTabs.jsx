import RouteIcon from "@mui/icons-material/Route";
import TuneIcon from "@mui/icons-material/Tune";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ScienceIcon from "@mui/icons-material/Science";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import BiotechIcon from "@mui/icons-material/Biotech";
import FunctionsIcon from "@mui/icons-material/Functions";

export const DASHBOARD_TABS = [
  {
    id: "routes",
    href: "/rutas",
    label: "Rutas",
    icon: <RouteIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "route-config",
    href: "/configurar-rutas",
    label: "Configurar",
    icon: <TuneIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "modelo",
    href: "/modelo-matematico",
    label: "Modelo",
    icon: <FunctionsIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "testing",
    href: "/testing",
    label: "Testing",
    icon: <ScienceIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "laboratorio",
    href: "/laboratorio",
    label: "Laboratorio",
    icon: <BiotechIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "volumes",
    href: "/volumenes",
    label: "Volúmenes",
    icon: <Inventory2Icon sx={{ fontSize: 16 }} />,
  },
  {
    id: "comparar",
    href: "/comparar",
    label: "Comparar",
    icon: <CompareArrowsIcon sx={{ fontSize: 16 }} />,
  },
];
