import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import logo from "./assets/logo_cityfix.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Cerrar menú si clickea afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm border-b border-blue-100"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img
            src={logo}
            alt="CityFix Logo"
            className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-sm"
          />
          <span className="text-xl font-bold text-blue-700">CityFix</span>
        </Link>

        {/* Navegación */}
        <div className="flex items-center gap-6 text-gray-700 font-medium">

          <Link to="/feed" className="hover:text-blue-600 transition-colors">
            Reclamos Públicos
          </Link>

          {!user && (
            <>
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm">
                Iniciar sesión
              </Link>
              <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm">
                Registrarse
              </Link>
            </>
          )}

          {/* 🔹 Si está logueado muestra menú perfil */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold shadow-sm group-hover:bg-blue-200 transition">
                  {user.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition">
                  {user.nombre}
                </span>
              </button>

              {openMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 w-48 mt-3 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden z-50"
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Mi Perfil
                  </Link>

                  <Link
                    to="/profile/edit"
                    className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Editar Perfil
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition"
                  >
                    Cerrar sesión
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
