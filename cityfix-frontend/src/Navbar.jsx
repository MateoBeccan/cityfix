import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import api from "./axios";
import logo from "./assets/logo_cityfix.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuRef = useRef(null);
  const mobileRef = useRef(null);

  // 🧠 Helpers de rol
  const isCitizen = user?.role === "CIUDADANO";
  const isAdmin = user?.role === "ADMIN";
  const isOperator = user?.role === "OPERADOR";

  const getDashboardLabel = () => {
    if (isAdmin) return "Panel Administrador";
    if (isOperator) return "Panel Operador";
    if (isCitizen) return "Panel Ciudadano";
    return "Panel";
  };

  const getDashboardPath = () => {
    if (isAdmin) return "/dashboard";          // ajusta si tu ruta es distinta
    if (isOperator) return "/dashboard";    // ajusta si tu ruta es distinta
    return "/dashboard";                   // ciudadano por defecto
  };

  // Notificaciones no leídas
  useEffect(() => {
    if (user) {
      api
        .get("/api/notifications/unread-count")
        .then((res) => setUnreadCount(res.data))
        .catch(() => {});
    }
  }, [user]);

  // Logout
  const handleLogout = () => {
    logout("/"); // Redirige a landing page
  };

  // Cerrar dropdowns si se hace click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setOpenMobile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 z-[9999] w-full bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

        {/* ---------- LOGO ---------- */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="CityFix Logo"
            className="w-10 h-10 rounded-full shadow border-2 border-blue-500"
          />
          <span className="text-xl font-semibold text-blue-700 tracking-tight">
            CityFix
          </span>
        </Link>

        {/* ---------- DESKTOP MENU ---------- */}
        <div className="hidden md:flex items-center gap-6 text-gray-700">

          {/* ENLACE A PANEL (para cualquier rol logueado) */}
          {user && (
            <Link
              to={getDashboardPath()}
              className="hover:text-blue-600 font-medium transition"
            >
              {getDashboardLabel()}
            </Link>
          )}

          {/* RECLAMOS PÚBLICOS */}
          <Link
            to="/feed"
            className="hover:text-blue-600 font-medium transition"
          >
            Reclamos Públicos
          </Link>

          {/* NOTIFICACIONES */}
          {user && (
            <Link to="/notifications" className="relative">
              <span className="text-2xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* LOGIN / REGISTER */}
          {!user && (
            <>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Registrarse
              </Link>
            </>
          )}

          {/* DROPDOWN DEL USUARIO */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((p) => !p)}
                className="flex items-center gap-2"
              >
                <div className="w-9 h-9 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full shadow">
                  {user.nombre?.[0]?.toUpperCase()}
                </div>
              </button>

              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2"
                  >
                    <p className="px-4 py-2 text-gray-700 font-semibold border-b border-gray-100">
                      {user.nombre}
                    </p>

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                      onClick={() => setOpenMenu(false)}
                    >
                      Mi Perfil
                    </Link>

                    <button
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ---------- MOBILE BUTTON ---------- */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpenMobile((p) => !p)}
        >
          <svg
            className="w-7 h-7 text-blue-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {openMobile ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* ---------- MOBILE MENU ---------- */}
      <AnimatePresence>
        {openMobile && (
          <motion.div
            ref={mobileRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="md:hidden bg-white shadow-lg border-t border-gray-200 py-4 px-4 space-y-4"
          >
            {user && (
              <Link
                to={getDashboardPath()}
                onClick={() => setOpenMobile(false)}
                className="block text-gray-800 text-lg font-medium"
              >
                🏠 {getDashboardLabel()}
              </Link>
            )}

            <Link
              to="/feed"
              onClick={() => setOpenMobile(false)}
              className="block text-gray-800 text-lg font-medium"
            >
              🌍 Reclamos Públicos
            </Link>

            {user && (
              <Link
                to="/notifications"
                onClick={() => setOpenMobile(false)}
                className="block text-gray-800 text-lg font-medium"
              >
                🔔 Notificaciones{" "}
                {unreadCount > 0 && (
                  <span className="ml-2 text-white bg-red-600 px-2 py-0.5 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
                  onClick={() => setOpenMobile(false)}
                >
                  Iniciar sesión
                </Link>

                <Link
                  to="/register"
                  className="block bg-green-600 text-white px-4 py-2 rounded-lg text-center"
                  onClick={() => setOpenMobile(false)}
                >
                  Registrarse
                </Link>
              </>
            )}

            {user && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpenMobile(false)}
                  className="block text-gray-800 text-lg font-medium"
                >
                  👤 Mi Perfil
                </Link>

                <button
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    handleLogout();
                    setOpenMobile(false);
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
