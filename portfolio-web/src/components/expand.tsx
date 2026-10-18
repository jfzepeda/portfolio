// Collapsible region. Content stays in the DOM (crawlable); only the height
// animates. Pair with a trigger that sets aria-expanded + aria-controls={id}.
export function Expand({
  id,
  open,
  children,
}: {
  id?: string;
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="expand" data-open={open ? "1" : "0"}>
      <div className="expand-inner">{children}</div>
    </div>
  );
}
