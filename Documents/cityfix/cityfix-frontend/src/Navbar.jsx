import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // ajusta el path si tu AuthContext está en otra carpeta
import { motion } from "framer-motion";
import logo from "./assets/logo_cityfix.png"; // asegurate que exista en /src/assets/

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm border-b border-blue-100"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo + Título */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <img
            src={logo}
            alt="CityFix Logo"
            className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-sm"
          />
          <span className="text-xl font-bold text-blue-700">CityFix</span>
        </Link>

        {/* Navegación */}
        <div className="flex items-center gap-5 text-gray-700 font-medium">
          <Link
            to="/feed"
            className="hover:text-blue-600 transition-colors"
          >
            Reclamos Públicos
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hover:text-blue-600 transition-colors"
              >
                Panel
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
