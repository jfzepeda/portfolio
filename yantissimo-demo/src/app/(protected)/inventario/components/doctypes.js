import CalculateIcon from "@mui/icons-material/Calculate";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import SwipeIcon from "@mui/icons-material/Swipe";
import SearchIcon from "@mui/icons-material/Search";
export const doctypes = [
  { key: "", label: "Buscador", icon: <SearchIcon /> },
  { key: "cotizador", label: "Cotizador", icon: <CalculateIcon /> },
  { key: "existencias", label: "Existencias", icon: <DashboardIcon /> },
  { key: "imagenes", label: "Imágenes", icon: <ImageSearchIcon /> },
  { key: "tinder", label: "Tinder", icon: <SwipeIcon /> },
];

export default doctypes;
