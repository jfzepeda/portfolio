export const LoginRightCard = () => {
  return (
    <div
      className="hidden md:flex md:w-[55%] relative flex-col items-center justify-center overflow-hidden px-12 py-10"
      style={{ backgroundColor: "#2C3E50" }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-24 -right-24 h-80 w-80 rounded-full"
        style={{ backgroundColor: "rgba(70,98,128,0.4)" }}
      />
      <div
        className="absolute top-10 right-10 h-48 w-48 rounded-full"
        style={{ backgroundColor: "rgba(70,98,128,0.3)" }}
      />

      {/* Feature card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl bg-white p-6 shadow-2xl">
          <div className="mb-4">
            <h2
              className="text-xl font-bold leading-tight mb-2"
              style={{ color: "#26211d" }}
            >
              Rediseñamos tu experiencia
              <br />
              un ambiente más cálido
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#8a8073" }}>
              Explora el nuevo diseño de nuestra plataforma, pensado para hacer
              tu día a día más fácil
            </p>
          </div>

          {/* Stats row */}
          <div
            className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: "#faf7f2" }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ backgroundColor: "rgba(250,198,95,0.2)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                style={{ color: "#A97820" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs" style={{ color: "#8a8073" }}>
                Warm Earth
              </p>
              <p className="text-base font-bold" style={{ color: "#26211d" }}>
                Nuevos colores
              </p>
            </div>
          </div>

          <button
            className="mt-4 rounded-full px-5 py-2 text-sm font-medium transition"
            style={{ backgroundColor: "#fac65f", color: "#26211d" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f0b840")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#fac65f")
            }
          >
            Explorar módulos
          </button>
        </div>
      </div>

      {/* Bottom text */}
      <div className="relative z-10 mt-10 text-center max-w-sm">
        <h3 className="text-2xl font-bold text-white mb-3">
          Barra lateral simplificada
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Nuestra barra lateral cambió, ahora es un solo icono que se expande al
          hacer clic, para darte más espacio para trabajar.
        </p>
      </div>

      {/* Dots */}
      <div className="relative z-10 mt-8 flex items-center gap-2">
        <span
          className="h-1.5 w-5 rounded-full"
          style={{ backgroundColor: "#fac65f" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
        />
      </div>
    </div>
  );
};

export default LoginRightCard;
