"use client";
import { useAuditoria } from "./state/AuditoriaContext";
import UploadView from "./views/UploadView";
import ProcessingView from "./views/ProcessingView";
import DashboardView from "./views/DashboardView";
import DashboardInicioView from "./views/DashboardInicioView";
import ConfiguracionView from "./views/ConfiguracionView";
import MenuPrincipalPanel from "./panels/MenuPrincipalPanel";
import HistorialPanel from "./panels/HistorialPanel";
import ImportModal from "./modals/ImportModal";
import MailConfigModal from "./modals/MailConfigModal";
import { APP_VERSION_TAG } from "./lib/constants";

export default function AuditoriaShell() {
  const { view, togglePanel, panels } = useAuditoria();

  return (
    <>
      <header className="aud-header">
        <div className="aud-logo">
          <span>Yantissimo</span>
          <em>Auditoría Diaria</em>
        </div>
        <div className="vtag">{APP_VERSION_TAG}</div>
        <div className="spacer" />
        <button className="hbtn" onClick={() => togglePanel("import", true)}>
          📤 Datos
        </button>
        <button className="hbtn" onClick={() => togglePanel("historial", true)}>
          📅 Historial
        </button>
        <button className="hbtn" onClick={() => togglePanel("menu", true)}>
          ☰ Menú
        </button>
      </header>

      {view === "upload" && <UploadView />}
      {view === "processing" && <ProcessingView />}
      {view === "dashboard" && <DashboardView />}
      {view === "dashboardInicio" && <DashboardInicioView />}
      {view === "configuracion" && <ConfiguracionView />}

      <MenuPrincipalPanel />
      <HistorialPanel />
      <ImportModal open={panels.import} onClose={() => togglePanel("import", false)} />
      <MailConfigModal open={panels.mail} onClose={() => togglePanel("mail", false)} />
    </>
  );
}
