import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../axios";
import { useAuth } from "../AuthContext";
import Button from "../Button";
import logo from "../assets/logo_cityfix.png";
import PageTransition from "../PageTransition";
import SkeletonClaimCard from "../SkeletonClaimCard";

// Dashboards por rol
import DashboardAdmin from "./DashboardAdmin";
import DashboardOperator from "./DashboardOperator";
import DashboardCitizen from "./DashboardCitizen";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;
    const load = async () => {
      try {
        if (user.role?.nombre === "CIUDADANO") {
          const res = await api.get("/api/claims/my-claims");
          setClaims(res.data || []);
        }
      } catch (error) {
        console.error("Error al obtener reclamos:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, token]);

  if (!user) {
    return (
      <PageTransition className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">No estás autenticado</h2>
        <Link to="/login">
          <Button>Iniciar Sesión</Button>
        </Link>
      </PageTransition>
    );
  }

  const renderDashboardByRole = () => {
    switch (user.role?.nombre) {
      case "ADMIN":
        return <DashboardAdmin />;
      case "OPERADOR":
        return <DashboardOperator />;
      case "CIUDADANO":
      default:
        return <DashboardCitizen claims={claims} loading={loading} Skeleton={SkeletonClaimCard} />;
    }
  };

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="CityFix logo"
              className="w-12 h-12 rounded-full border-2 border-blue-500 shadow"
            />
            <h1 className="text-2xl font-bold text-blue-700">CityFix Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">
              👤 {user?.nombre || "Usuario"}{" "}
              <span className="text-gray-500">({user.role?.nombre})</span>
            </span>
            <Button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-red-400"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Panel principal */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {renderDashboardByRole()}
      </main>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-sm text-gray-500 border-t border-blue-100">
        <p>🌆 CityFix © 2025 — Panel de Gestión Urbana</p>
      </footer>
    </PageTransition>
  );
}
