"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Radio,
  TextField,
} from "@mui/material";
import CreateQuoteDialog from "../CreateQuoteDialog";
import PrintIcon from "@mui/icons-material/Print";
import { downloadPDF } from "../checksPDF"; // Asegúrate de que la ruta sea correcta
import { saveChecks } from "~/app/(protected)/ordenes/savechecks"; // Asegúrate de que la ruta sea correcta

const CheckOut = ({ open, onClose, onConfirm, id, initialData, check_out }) => {
  const [missingFields, setMissingFields] = useState(false);

  // -----------------------
  // 1. Definición de datos
  // -----------------------
  // Primera sección
  const items = [
    { name: "item1", label: "ACEITE Y FILTRO DE MOTOR" },
    { name: "item2", label: "ANTICONGELANTE" },
    { name: "item3", label: "LÍQUIDO LIMPIABRIZAS" },
    { name: "item4", label: "PLUMAS LIMPIABRIZAS" },
    { name: "item5", label: "LÍQUIDO DE FRENOS" },
    { name: "item6", label: "BASES DE AMORTIGUADOR" },
    { name: "item7", label: "HULES DE REBOTE" },
    { name: "item8", label: "AMORTIGUADORES DELANTEROS" },
    { name: "item9", label: "AMORTIGUADORES TRASEROS" },
    { name: "item10", label: "TERMINALES" },
    { name: "item11", label: "RÓTULAS" },
    { name: "item12", label: "BUES DE HORQUILLA" },
    { name: "item13", label: "BUES DE TIRANTES" },
    { name: "item14", label: "BIELETAS" },
    { name: "item15", label: "TORNILLO ESTABILIZADOR" },
    { name: "item16", label: "BARRA CENTRAL/CREMALLERA" },
    { name: "item17", label: "HULES DE BARRA" },
    { name: "item18", label: "CUBRE POLVO RUEDA DEL IZQ." },
    { name: "item19", label: "CUBRE POLVO RUEDA DEL DER." },
    { name: "item20", label: "PUNTA DE FLECHA HOMOCINÉTICA" },
    { name: "item21", label: "BRAZO AUXILIAR" },
    { name: "item22", label: "BRAZO PITMAN" },
    { name: "item23", label: "SOPORTES DE MOTOR" },
    { name: "item24", label: "BALERO RUEDA DELANTERA IZQ." },
    { name: "item25", label: "BALERO RUEDA DELANTERA DER." },
    { name: "item26", label: "BALERO RUEDA TRASERA IZQ." },
    { name: "item27", label: "BALERO RUEDA TRASERA DER." },
    { name: "item28", label: "BALATAS DELANTERAS" },
    { name: "item29", label: "BALATAS TRASERAS" },
    { name: "item30", label: "ALINEACIÓN" },
    { name: "item31", label: "CREMALLERA" },
  ];

  // Segunda sección: Revisión de Llantas
  const tireItems = [
    { name: "tire1", label: "DELANTERA IZQUIERDA" },
    { name: "tire2", label: "DELANTERA DERECHA" },
    { name: "tire3", label: "TRASERA IZQUIERDA" },
    { name: "tire4", label: "TRASERA DERECHA" },
  ];

  // ----------------------------------
  // 2. Estados para la primera sección
  // ----------------------------------
  const [radioState, setRadioState] = useState(
    check_out?.radioState ||
      items.reduce((acc, item) => {
        acc[item.name] = "OK";
        return acc;
      }, {})
  );

  const [noteState, setNoteState] = useState(
    check_out?.noteState ||
      items.reduce((acc, item) => {
        acc[item.name] = "";
        return acc;
      }, {})
  );

  // ----------------------------------
  // 3. Estados para la segunda sección
  // ----------------------------------
  const [tireRadioState, setTireRadioState] = useState(
    check_out?.tireRadioState ||
      tireItems.reduce((acc, item) => {
        acc[item.name] = "OK";
        return acc;
      }, {})
  );

  const [tireDataState, setTireDataState] = useState(
    check_out?.tireDataState ||
      tireItems.reduce((acc, item) => {
        acc[`${item.name}_llegar`] = "";
        acc[`${item.name}_entregar`] = "";
        acc[`${item.name}_dot`] = "";
        return acc;
      }, {})
  );

  const [cotizacionPCK, setCotizacionPCK] = useState(
    check_out?.cotizacionPCK || ""
  );

  // ---------------------------------------
  // 4. Estados para el diálogo de cotización
  // ---------------------------------------
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [initialQuoteData, setInitialQuoteData] = useState(initialData);

  // ---------------------------------------
  // 5. Control de pasos (step 1 / step 2)
  // ---------------------------------------
  const [step, setStep] = useState(1);

  // -------------------------------------------
  // 6. Manejadores de eventos para cada sección
  // -------------------------------------------
  const handleRadioChange = (event) => {
    setRadioState({
      ...radioState,
      [event.target.name]: event.target.value,
    });
  };

  const handleNoteChange = (event) => {
    setNoteState({
      ...noteState,
      [event.target.name]: event.target.value,
    });
  };

  const handleTireRadioChange = (event) => {
    setTireRadioState({
      ...tireRadioState,
      [event.target.name]: event.target.value,
    });
  };

  const handleTireDataChange = (event) => {
    const { name, value } = event.target;
    // Se usa el valor tal cual sin filtrar
    setTireDataState({
      ...tireDataState,
      [name]: value,
    });
  };

  const handleConfirm = async () => {
    // Construimos un array con solo las llaves que deben llenarse
    const requiredKeys = tireItems.flatMap((tire) => [
      `${tire.name}_llegar`,
      `${tire.name}_dot`,
    ]);

    // Revisamos que todos estén llenos
    const allTireDataFilled = requiredKeys.every(
      (key) => tireDataState[key] !== ""
    );

    if (!allTireDataFilled) {
      setMissingFields(true);
      window.showToast(
        "Por favor, complete todos los campos de las llantas antes de guardar."
      );
      return;
    }

    // Ahora sí guardamos
    const data = {
      radioState,
      noteState,
      tireRadioState,
      tireDataState,
      cotizacionPCK,
    };
    saveChecks(id, data);
    onConfirm();
  };

  // Manejador para abrir el diálogo de cotización
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  // Manejador para guardar una nueva cotización
  async function handleSaveNewQuote(savedQuote) {
    console.log("Nueva cotización guardada:", savedQuote);
    setCotizacionPCK(savedQuote.id);

    const data = {
      radioState,
      noteState,
      tireRadioState,
      tireDataState,
      cotizacionPCK: savedQuote.id,
    };
    saveChecks(id, data);
    onConfirm();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Revisión de Automóvil</DialogTitle>
      <DialogContent dividers>
        {step === 1 && (
          <>
            <p>
              Asegúrese de que los siguientes puntos han sido revisados y
              confirmados minuciosamente. Seleccione el estado correspondiente.
            </p>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="center">OK</TableCell>
                  <TableCell align="center">Preventivo</TableCell>
                  <TableCell align="center">Cambio</TableCell>
                  <TableCell align="center">Nota</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell align="center">
                      <Radio
                        name={item.name}
                        value="OK"
                        checked={radioState[item.name] === "OK"}
                        onChange={handleRadioChange}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        name={item.name}
                        value="Preventivo"
                        checked={radioState[item.name] === "Preventivo"}
                        onChange={handleRadioChange}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        name={item.name}
                        value="Cambio"
                        checked={radioState[item.name] === "Cambio"}
                        onChange={handleRadioChange}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        name={item.name}
                        value={noteState[item.name]}
                        onChange={handleNoteChange}
                        variant="standard"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {step === 2 && (
          <>
            <h3>Revisión de Llantas</h3>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Revisión</TableCell>
                  <TableCell align="center">OK</TableCell>
                  <TableCell align="center">Preventivo</TableCell>
                  <TableCell align="center">Cambio</TableCell>
                  <TableCell align="center">Presión al Llegar (Lbs)</TableCell>
                  <TableCell align="center">DOT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tireItems.map((tire) => (
                  <TableRow key={tire.name}>
                    <TableCell>{tire.label}</TableCell>
                    <TableCell align="center">
                      <Radio
                        name={tire.name}
                        value="OK"
                        checked={tireRadioState[tire.name] === "OK"}
                        onChange={handleTireRadioChange}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        name={tire.name}
                        value="Preventivo"
                        checked={tireRadioState[tire.name] === "Preventivo"}
                        onChange={handleTireRadioChange}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        name={tire.name}
                        value="Cambio"
                        checked={tireRadioState[tire.name] === "Cambio"}
                        onChange={handleTireRadioChange}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        name={`${tire.name}_llegar`}
                        value={tireDataState[`${tire.name}_llegar`]}
                        onChange={handleTireDataChange}
                        variant="standard"
                        size="small"
                        error={
                          !tireDataState[`${tire.name}_llegar`] && missingFields
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        name={`${tire.name}_dot`}
                        value={tireDataState[`${tire.name}_dot`]}
                        onChange={handleTireDataChange}
                        variant="standard"
                        size="small"
                        error={
                          !tireDataState[`${tire.name}_dot`] && missingFields
                        }
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="contrast"
          onClick={() =>
            downloadPDF({
              radioState,
              noteState,
              tireRadioState,
              tireDataState,
            })
          }
          sx={{ mr: 1 }}
        >
          <PrintIcon />
        </Button>
        {step === 1 && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setStep(2)}
          >
            Siguiente
          </Button>
        )}
        {step === 2 && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCreateDialog}
              sx={{ mr: 1 }}
            >
              Cotizar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setStep(1)}
              sx={{ mr: 1 }}
            >
              Atras
            </Button>
            <Button variant="contained" color="primary" onClick={handleConfirm}>
              Guardar
            </Button>
          </>
        )}
      </DialogActions>
      <CreateQuoteDialog
        open={openCreateDialog}
        handleClose={() => {
          setOpenCreateDialog(false);
          setInitialQuoteData(null);
        }}
        initialData={{ ...initialQuoteData, channel: "Postcheck" }}
        onQuoteSaved={(savedQuote) => {
          setOpenCreateDialog(false);
          setInitialQuoteData(null);
          handleSaveNewQuote(savedQuote);
        }}
      />
    </Dialog>
  );
};

export default CheckOut;
