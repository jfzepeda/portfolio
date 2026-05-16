import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
export const doctypes = [
  { key: "pre", label: "Pre-cotización", icon: <DescriptionOutlinedIcon /> },
  {
    key: "prov",
    label: "Coti proveedores",
    icon: <RequestQuoteOutlinedIcon />,
  },
  {
    key: "cotizacion",
    label: "Cotización cliente",
    icon: <ShoppingCartOutlinedIcon />,
  },
  { key: "anticipo", label: "Anticipo", icon: <PaymentsOutlinedIcon /> },
  { key: "traspaso", label: "Traspaso", icon: <CompareArrowsOutlinedIcon /> },
  { key: "agendar", label: "Agendar", icon: <EventOutlinedIcon /> },
  { key: "remision", label: "Remisión", icon: <ReceiptLongOutlinedIcon /> },
  { key: "factura", label: "Factura", icon: <ReceiptOutlinedIcon /> },
];

export default doctypes;
