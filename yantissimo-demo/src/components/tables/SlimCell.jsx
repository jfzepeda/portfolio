import { TableCell } from "@mui/material";

const SlimCell = ({ children, sx = {}, ...props }) => (
  <TableCell
    sx={{
      py: 0.75,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      ...sx,
    }}
    {...props}
  >
    {children}
  </TableCell>
);

export default SlimCell;
