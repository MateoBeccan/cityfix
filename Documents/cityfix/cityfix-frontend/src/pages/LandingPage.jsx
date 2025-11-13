import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../Button";
import heroImage from "../assets/logo_reclamo.png";
import logo from "../assets/logo_cityfix.png";
import PageTransition from "../PageTransition";

export default function LandingPage() {
  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-blue-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={logo}
              alt="CityFix"
              className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-sm"
            />
            <h1 className="text-xl font-bold text-blue-700">CityFix</h1>
          </motion.div>

          <motion.nav
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            aria-label="Acciones principales"
          >
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400">
                Registrarse
              </Button>
            </Link>
          </motion.nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-col lg:flex-row items-center justify-center flex-grow max-w-6xl mx-auto px-6 py-16 gap-10">
        <motion.div
          className="text-center lg:text-left max-w-xl"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-4">
            Conectando ciudadanos con soluciones urbanas.
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Reportá y visualizá problemas urbanos: baches, alumbrado, limpieza y más.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/feed">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow focus:ring-2 focus:ring-blue-400">
                Ver Reclamos Públicos
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow focus:ring-2 focus:ring-green-400">
                Reportar un Reclamo
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <img
            src={heroImage}
            alt="Ilustración urbana"
            className="w-80 lg:w-[420px] drop-shadow-xl rounded-2xl hover:scale-105 transition-transform duration-500"
          />
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        className="bg-white/70 backdrop-blur-md border-t border-blue-100 py-4 text-center text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        🌆 CityFix © 2025 — Innovación Urbana Ciudadana
      </motion.footer>
    </PageTransition>
  );
}
