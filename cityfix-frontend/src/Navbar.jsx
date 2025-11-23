import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import api from "./axios";
import logo from "./assets/logo_cityfix.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const menuRef = useRef(null);
  const mobileRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api
        .get("/api/notifications/unread-count")
        .then((res) => setUnreadCount(res.data))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !e.target.closest("#user-avatar")
      ) {
        setOpenMenu(false);
      }
      if (
        mobileRef.current &&
        !mobileRef.current.contains(e.target) &&
        !e.target.closest("#mobile-menu-btn")
      ) {
        setOpenMobile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-[9999] bg-white/90 backdrop-blur-xl shadow-md border-b border-blue-100"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="CityFix Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 shadow-sm"
          />
          <span className="text-lg sm:text-xl font-bold text-blue-700">
            CityFix
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <Link to="/feed" className="hover:text-blue-600 transition">
            Reclamos Públicos
          </Link>

          {/* NOTIFICACIONES */}
          {user && (
            <Link to="/notifications" className="relative">
              <span className="text-2xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {!user && (
            <>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm"
              >
                Registrarse
              </Link>
            </>
          )}

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                id="user-avatar"
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-2"
              >
                <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {user.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-700">
                  {user.nombre}
                </span>
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-[9999]">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    onClick={() => setOpenMenu(false)}
                  >
                    Mi Perfil
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          id="mobile-menu-btn"
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpenMobile((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 text-blue-700"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {openMobile ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE MENU */}
      {openMobile && (
        <div
          ref={mobileRef}
          className="md:hidden bg-white border-t border-gray-200 shadow-md px-4 py-4 space-y-4 z-[9999]"
        >
          <Link
            to="/feed"
            className="block text-gray-700 font-medium hover:text-blue-600"
            onClick={() => setOpenMobile(false)}
          >
            Reclamos Públicos
          </Link>

          {user && (
            <Link
              to="/notifications"
              className="block text-gray-700 font-medium hover:text-blue-600"
              onClick={() => setOpenMobile(false)}
            >
              🔔 Notificaciones{" "}
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {!user && (
            <>
              <Link
                to="/login"
                className="block bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setOpenMobile(false)}
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className="block bg-green-500 text-white px-4 py-2 rounded-lg"
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
                className="block text-gray-700 font-medium hover:text-blue-600"
                onClick={() => setOpenMobile(false)}
              >
                Mi Perfil
              </Link>

              <button
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  handleLogout();
                  setOpenMobile(false);
                }}
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
