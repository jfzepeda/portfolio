"use client";
import api from "~/lib/api";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUserProfile, saveTokens } from "~/utils/session";
import { LoginRightCard } from "./loginRightCard";
import Image from "next/image";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        const userData = data?.user;
        console.log("Usuario logueado", userData.username);
        if (userData) saveUserProfile(userData);
        if (data.acc?.value && data.ref?.value)
          saveTokens(data.acc.value, data.ref.value);
        router.replace("/dashboard");
      } else {
        console.error("Credenciales incorrectas para:", username);
        window.showToast("Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en el login:", error);
      window.showToast("Error en el login" + error, "error");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Panel */}
      <div
        className="flex w-full flex-col justify-center px-12 py-10 md:w-[45%]"
        style={{ backgroundColor: "#faf7f2" }}
      >
        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/logo_blanco.jpeg"
            alt="YSSM Logo"
            width={100}
            height={40}
            className="object-contain rounded-lg"
          />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#26211d" }}>
            Iniciar sesión
          </h1>
          <p className="text-sm" style={{ color: "#8a8073" }}>
            Accede a tu cuenta para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#5c544a" }}>
              Usuario
            </label>
            <input
              type="text"
              placeholder="tu_usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5dcc8",
                color: "#26211d",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#fac65f";
                e.target.style.boxShadow = "0 0 0 3px rgba(250,198,95,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5dcc8";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#5c544a" }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5dcc8",
                  color: "#26211d",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#fac65f";
                  e.target.style.boxShadow = "0 0 0 3px rgba(250,198,95,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5dcc8";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition"
                style={{ color: "#9E9A92" }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.274-3.593M6.477 6.477A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.293 2.665M6.477 6.477L3 3m3.477 3.477l7.046 7.046M17.523 17.523L21 21m-3.477-3.477l-7.046-7.046"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 w-full rounded-full py-3.5 text-sm font-semibold transition active:scale-[0.98]"
            style={{ backgroundColor: "#fac65f", color: "#26211d" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f0b840")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#fac65f")
            }
          >
            Iniciar sesión
          </button>
        </form>
      </div>

      {/* Right Panel */}
      <LoginRightCard />
    </div>
  );
};

export default Login;
