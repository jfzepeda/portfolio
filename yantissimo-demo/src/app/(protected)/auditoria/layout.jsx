import { auditoriaFontsClass } from "./styles/fonts";
import "./styles/auditoria.css";

export default function AuditoriaLayout({ children }) {
  return (
    <div className={`auditoria-root ${auditoriaFontsClass}`}>{children}</div>
  );
}
