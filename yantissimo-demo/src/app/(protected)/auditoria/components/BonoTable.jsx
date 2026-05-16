"use client";
import ProgressBar from "./ProgressBar";

export default function BonoTable({ rows = [] }) {
  if (!rows || rows.length === 0) {
    return <div className="aud-empty">Sin objetivos configurados</div>;
  }

  return (
    <div className="bono-table-wrap">
      <table className="bono-table">
        <thead>
          <tr>
            <th>Línea</th>
            <th>Realizado</th>
            <th className="bono-th-ok">Bono 1</th>
            <th className="bono-th-accent">Bono 2</th>
            <th className="bono-progress-head">Avance</th>
            <th>Falta/día</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id ?? row.linea} className={row.rowClass}>
              <td className="bono-linea">{row.linea}</td>
              <td>{row.realizado}</td>
              <td className="bono-ok">{row.bono1}</td>
              <td className="bono-accent">{row.bono2}</td>
              <td className="bono-progress-cell">
                <ProgressBar
                  percent={row.pctBar}
                  mark={row.marcaPct}
                  tone={row.progressTone}
                />
              </td>
              <td className={row.faltaCompleta ? "bono-ok" : row.estadoClass === "bi" ? "bono-accent" : "bono-danger"}>
                {row.faltaDia}
              </td>
              <td>
                <span className={`b ${row.estadoClass}`}>{row.estado}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
