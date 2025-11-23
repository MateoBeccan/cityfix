import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import Button from "../Button";
import heroImage from "../assets/logo_reclamo.png";
import logo from "../assets/logo_cityfix.png";

const LandingPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">

      {/* HEADER */}
      <header className="bg-white/70 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

          {/* LOGO */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={logo}
              alt="CityFix"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 shadow-sm"
            />
            <h1 className="text-lg sm:text-xl font-bold text-blue-700">CityFix</h1>
          </motion.div>

          {/* CONTROLES DE USUARIO */}
          {user ? (
            <motion.div
              className="flex items-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <span className="text-gray-700 font-semibold hidden sm:block">
                Hola, {user.nombre}
              </span>

              <Link to="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm">
                  Panel
                </Button>
              </Link>

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm"
              >
                Cerrar sesión
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm">
                  Iniciar Sesión
                </Button>
              </Link>

              <Link to="/register">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm">
                  Registrarse
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </header>

      {/* HERO */}
      <main className="flex flex-col lg:flex-row items-center justify-center flex-grow max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 gap-8 lg:gap-10">

        {/* TEXTO */}
        <motion.div
          className="text-center lg:text-left max-w-xl"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-4">
            Conectando ciudadanos con soluciones urbanas.
          </h2>

          <p className="text-gray-600 mb-6 text-sm sm:text-base lg:text-lg">
            Reportá fácilmente problemas urbanos en tu ciudad: alumbrado, baches, limpieza y mucho más.
            CityFix te ayuda a conectar reclamos con soluciones reales.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/feed">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow text-sm sm:text-base">
                Ver Reclamos Públicos
              </Button>
            </Link>

            {user ? (
              <Link to="/dashboard">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow text-sm sm:text-base">
                  Ir al Panel
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow text-sm sm:text-base">
                  Reportar un Reclamo
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* IMAGEN */}
        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          <img
            src={heroImage}
            alt="Ilustración urbana"
            className="w-64 sm:w-72 lg:w-[400px] drop-shadow-xl rounded-2xl hover:scale-[1.03] transition-transform duration-500"
          />
        </motion.div>
      </main>

      {/* FOOTER */}
      <motion.footer
        className="bg-white/70 backdrop-blur-md border-t border-blue-100 py-4 text-center text-xs sm:text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        © CityFix 2025 — Innovación Urbana Ciudadana
      </motion.footer>
    </div>
  );
};

export default LandingPage;
