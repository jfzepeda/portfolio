"use client";

/**
 * Tabla `.st` editorial. Contrato:
 *   columns: Array<{ key, header, className?, align?, render?(row) }>
 *   rows:    Array<any>
 *   getRowClassName(row): 'rc' | 'rw' | 'ri' | 'rj' | ''
 *   footer:  ReactNode en <tfoot>
 *   emptyMessage: string
 */
export default function DataTable({
  columns,
  rows,
  footer,
  getRowClassName,
  bordered = true,
  emptyMessage = "Sin datos",
}) {
  const Wrapper = bordered ? "div" : "div";
  const wrapperClass = bordered ? "tw-brd" : "tw";

  if (!rows || rows.length === 0) {
    return <div className="aud-empty">{emptyMessage}</div>;
  }

  return (
    <Wrapper className={wrapperClass}>
      <table className="st">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={c.className}
                style={c.align ? { textAlign: c.align } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rowCls = getRowClassName ? getRowClassName(row) : "";
            return (
              <tr key={row.id ?? i} className={rowCls}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={c.className}
                    style={c.align ? { textAlign: c.align } : undefined}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        {footer ? <tfoot>{footer}</tfoot> : null}
      </table>
    </Wrapper>
  );
}
