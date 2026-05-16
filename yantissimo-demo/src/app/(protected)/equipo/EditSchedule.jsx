// src/components/EditSchedule.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Typography,
  Box,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { ROLES, SUCS } from "~/utils/global";
import api from "~/lib/api";
const sucursales = SUCS;

const EditSchedule = ({
  open,
  handleClose,
  onUserSaved,
  initialData,
  toggleStatus,
  curRole,
}) => {
  const [isActive, setIsActive] = useState(initialData.status);
  const [schedule, setSchedule] = useState([0, 0]);
  const [breakTime, setBreakTime] = useState([0, 0]);
  const [userData, setUserData] = useState(initialData);

  // Fetch initial data when the component mounts or when initialData changes
  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await api(
          `/api/team/get/working-hours?id=${initialData.id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener horario");
        }
        const data = await response.json();
        // console.log('Schedule:', data);
        const { receso, salida, entrada, recesoFin } = data.current;
        setSchedule([entrada, salida]);
        setBreakTime([receso, recesoFin]);
        // setIsActive(data.status);
      } catch (error) {
        console.error("Error al cargar horario:", error);
      }
    }
    fetchSchedule();
  }, [initialData]);

  const handleToggle = async () => {
    toggleStatus(initialData);
    setIsActive(!isActive);
  };

  const handleSliderChange = (event, newValue) => {
    setSchedule(newValue);
  };

  const handleSliderChange2 = (event, newValue) => {
    setBreakTime(newValue);
  };

  // const handleBreakTimeChange = (event, newValue) => {
  //   setBreakTime(newValue);
  // };

  const handleSaveSchedule = async (type) => {
    try {
      const response = await api(`/api/team/mod/working-hours`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initialData.id, schedule, breakTime, type }),
      });
      const data = await response.json();

      if (!response.ok) {
        console.error("Error:", data.error); // <- Muestra el mensaje específico
        return;
      }
      console.log("Éxito:", data);
      onUserSaved(data);
    } catch (err) {
      console.error("Error general:", err);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box
        my={2}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <DialogTitle variant="h5">Modo de edicion</DialogTitle>
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          color={!isActive ? "error" : "success"}
          sx={{ mr: 3, fontSize: 16, height: 40 }}
        >
          {isActive ? "Deshabilitar" : "Habilitar"} <PowerSettingsNewIcon />
        </Button>
      </Box>
      <DialogContent>
        <Box my={2}>
          <Typography gutterBottom>Horario Laboral</Typography>
          <Slider
            value={schedule}
            onChange={(e, newValue) => {
              e.stopPropagation();
              handleSliderChange(e, newValue);
            }}
            valueLabelDisplay="auto"
            min={9}
            max={19}
          />
          <Box display="flex" justifyContent="space-around">
            <Typography variant="h7">
              {schedule[0]}:00 - {schedule[1]}:00
            </Typography>
          </Box>
          <Typography gutterBottom>Descanso</Typography>
          <Slider
            value={breakTime}
            onChange={(e, newValue) => {
              e.stopPropagation();
              handleSliderChange2(e, newValue);
            }}
            valueLabelDisplay="auto"
            min={schedule[0]}
            max={schedule[1]}
            track={"inverted"}
          />
          <Box display="flex" justifyContent="space-around">
            <Typography variant="h7">
              {breakTime[0]}:00 - {breakTime[1]}:00
            </Typography>
          </Box>
          <Box mt={6}>
            {curRole >= ROLES.MARKETING && (
              <ToggleButtonGroup
                value={userData.sucursal}
                exclusive
                fullWidth
                onChange={(e, newSucursal) => {
                  if (newSucursal !== null) {
                    setUserData((prev) => ({ ...prev, sucursal: newSucursal }));
                  }
                }}
              >
                {sucursales.map((sucursalOption) => (
                  <ToggleButton
                    key={sucursalOption}
                    value={sucursalOption}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#FFC600",
                        "&:hover": {
                          backgroundColor: "#FFC600",
                        },
                      },
                    }}
                  >
                    {sucursalOption}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleSaveSchedule("defult");
          }}
          variant="outlined"
          color="error"
        >
          Definitivo
        </Button>
        <Box>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveSchedule("current");
            }}
            variant="contained"
            color="primary"
          >
            Guardar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

const ManageUser = ({
  open,
  handleClose,
  initialData,
  toggleStatus,
  curRole,
  handleAssign,
}) => {
  // Local copy of user data for editing branch and other fields
  const [userData, setUserData] = useState(initialData);
  // Generic change handler to update userData state
  // const handleChange = (field) => (event) => {
  //   setUserData(prev => ({ ...prev, [field]: event.target.value }));
  // };
  const [isActive, setIsActive] = useState(initialData.status);

  // async function toggleStatus(editSchedule)
  const handleToggle = async () => {
    toggleStatus(initialData);
    setIsActive(!isActive);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <Box
        my={2}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <DialogTitle variant="h5">Asignar Usuario</DialogTitle>
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          color={!isActive ? "error" : "success"}
          sx={{ mr: 3, fontSize: 16, height: 40 }}
        >
          {isActive ? "Deshabilitar" : "Habilitar"} <PowerSettingsNewIcon />
        </Button>
      </Box>
      <DialogContent>
        <Box my={2}>
          {curRole < ROLES.MANAGER ? (
            <TextField
              label="Sucursal"
              fullWidth
              value="ADMIN"
              required
              disabled
            />
          ) : (
            <ToggleButtonGroup
              value={userData.sucursal}
              exclusive
              fullWidth
              onChange={(e, newSucursal) => {
                if (newSucursal !== null) {
                  setUserData((prev) => ({ ...prev, sucursal: newSucursal }));
                }
              }}
            >
              {sucursales.map((sucursalOption) => (
                <ToggleButton
                  key={sucursalOption}
                  value={sucursalOption}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#FFC600",
                      "&:hover": {
                        backgroundColor: "#FFC600",
                      },
                    },
                  }}
                >
                  {sucursalOption}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-end", p: 2 }}>
        {/* <Button onClick={(e) => {
          e.stopPropagation();
          handleAssign('defult');
        }} variant="outlined" color="error">Definitivo</Button> */}
        <Box>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAssign(initialData.id, userData.sucursal);
            }}
            variant="contained"
            color="primary"
          >
            Guardar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export { EditSchedule, ManageUser };
