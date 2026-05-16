"use client";
import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import AddIcon from "@mui/icons-material/Add";
import { getRamps } from "~/utils/global";
import Header from "~/components/header";

const UserCard = ({ user, onClick }) => (
  <Button onClick={() => onClick(user)}>
    <Box textAlign="center" m={1}>
      <PrecisionManufacturingIcon
        color={user.status ? "success" : "error"}
        sx={{
          fontSize: 100,
          borderRadius: 3,
          boxShadow: 2,
          "&:hover": { backgroundColor: "#f5f5f5" },
        }}
      />
      <Typography variant="body2" sx={{ color: "black" }}>
        {user.name}
      </Typography>
    </Box>
  </Button>
);

const AddButton = ({ handleCreate, userType }) => (
  <Box mt={1}>
    <IconButton onClick={() => handleCreate(userType)} size="small">
      <AddIcon
        sx={{ fontSize: 40, color: "black", "&:hover": { color: "#FFC600" } }}
      />
    </IconButton>
  </Box>
);

const RampsPage = () => {
  const [sucFilter, setSucFilter] = React.useState("TEC");
  const [ramps, setRamps] = React.useState(
    getRamps(sucFilter).map((name, index) => ({
      id: index,
      name,
      status: false,
    }))
  );

  React.useEffect(() => {
    setRamps(
      getRamps(sucFilter).map((name, index) => ({
        id: index,
        name,
        status: false,
      }))
    );
  }, [sucFilter]);

  const handleToggle = (ramp) => {
    setRamps((prev) =>
      prev.map((r) => (r.id === ramp.id ? { ...r, status: !r.status } : r))
    );
    console.log("Toggled ramp status:", ramp);
  };

  const handleCreate = (userType) => {
    console.log("Crear usuario del tipo:", userType);
  };

  return (
    <Box>
      <Header
        title="Gestión de Rampas"
        actions={
          <FormControl variant="standard" sx={{ minWidth: 120 }}>
            <InputLabel id="sucursal-label">Sucursal</InputLabel>
            <Select
              labelId="sucursal-label"
              id="sucursal-select"
              value={sucFilter || ""}
              onChange={(e) => setSucFilter(e.target.value)}
              label="Sucursal"
            >
              <MenuItem value={"CON"}>CON</MenuItem>
              <MenuItem value={"NHS"}>NHS</MenuItem>
              <MenuItem value={"TEC"}>TEC</MenuItem>
              <MenuItem value={"MAN"}>MAN</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <Box display="flex" flexWrap="wrap" justifyContent="left">
        {ramps.map((ramp) => (
          <UserCard key={ramp.id} user={ramp} onClick={handleToggle} />
        ))}
        <AddButton handleCreate={handleCreate} userType={0} />
      </Box>
    </Box>
  );
};

export default RampsPage;
