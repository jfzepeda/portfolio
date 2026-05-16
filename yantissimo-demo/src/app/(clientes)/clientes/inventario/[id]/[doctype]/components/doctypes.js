import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
export const doctypes = [
  { key: "cartdraft", label: "Carrito", icon: <ShoppingCartOutlinedIcon /> },
  {
    key: "sentorder",
    label: "Cotización",
    icon: <DescriptionOutlinedIcon />,
  },
];

export default doctypes;
