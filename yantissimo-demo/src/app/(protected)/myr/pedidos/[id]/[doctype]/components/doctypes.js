import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
export const doctypes = [
  {
    key: "preorder",
    label: "Pre-orden",
    icon: <DescriptionOutlinedIcon />,
  },
  {
    key: "prov",
    label: "Coti proveedores",
    icon: <RequestQuoteOutlinedIcon />,
  },
  {
    key: "sentorder",
    label: "Pedido",
    icon: <ShoppingCartOutlinedIcon />,
  },
  {
    key: "invoiced",
    label: "Factura",
    icon: <ReceiptIcon />,
  },
  {
    key: "payments",
    label: "Pagos",
    icon: <PaymentsOutlinedIcon />,
  },
];

export default doctypes;
