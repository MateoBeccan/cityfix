import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../axios";
import { useAuth } from "../AuthContext";
import Button from "../Button";
import logo from "../assets/logo_cityfix.png";

// Dashboards por rol
import DashboardAdmin from "./DashboardAdmin";
import DashboardOperator from "./DashboardOperator";
import DashboardCitizen from "./DashboardCitizen";

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;

    const fetchClaims = async () => {
      try {
        if (user.role === "CIUDADANO") {
          const res = await api.get("/api/claims/my-claims");
          setClaims(res.data || []);
        }
      } catch (error) {
        console.error("Error al obtener reclamos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [user, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">No estás autenticado</h2>
        <Link to="/login">
          <Button>Iniciar Sesión</Button>
        </Link>
      </div>
    );
  }

  const renderDashboardByRole = () => {
    switch (user.role) {
      case "ADMIN":
        return <DashboardAdmin />;
      case "OPERADOR":
        return <DashboardOperator />;
      case "CIUDADANO":
      default:
        return <DashboardCitizen claims={claims} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">

          {/* LOGO + TÍTULO */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="CityFix logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-500 shadow"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-blue-700">Dashboard</h1>
          </div>

          {/* USUARIO + LOGOUT */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-gray-700 text-sm sm:text-base">
              👤 {user.nombre || "Usuario"}{" "}
              <span className="text-gray-500">({user.role})</span>
            </span>

            <Button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-sm text-sm sm:text-base"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Panel principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {renderDashboardByRole()}
      </main>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-sm text-gray-500 border-t border-blue-100">
        🌆 CityFix © 2025 — Panel de Gestión Urbana
      </footer>
    </div>
  );
};

export default Dashboard;
