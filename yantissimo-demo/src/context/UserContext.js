// src/contexts/UserContext.jsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

import {
  getUserProfile,
  saveUserProfile,
  getAccessToken,
  decodeToken,
} from "../utils/session";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Al montar el componente, recupera el usuario del almacenamiento local
  useEffect(() => {
    const storedUser = getUserProfile();
    if (storedUser) {
      setUser(storedUser);
    } else {
      const token = getAccessToken();
      const decoded = token ? decodeToken(token) : null;
      if (decoded) setUser(decoded);
    }
  }, []);

  const updateUser = (userData) => {
    saveUserProfile(userData);
    setUser(userData);
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
