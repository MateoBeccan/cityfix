import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./axios";
import Button from "./Button";
import EmptyState from "./EmptyState";
import { useAuth } from "./AuthContext";

const DashboardCitizen = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await api.get("/api/claims/my-claims", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(response.data);
    } catch (error) {
      console.error("Error fetching claims:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "En Proceso": "bg-blue-100 text-blue-800 border-blue-300",
      Resuelto: "bg-green-100 text-green-800 border-green-300",
      Rechazado: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* TOP HEADER */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-5 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel del Ciudadano
        </h1>
        <p className="text-gray-600 mt-1">
          Gestiona tus reclamos urbanos de manera rápida y sencilla
        </p>
      </div>

      {/* ACTIONS + STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Crear reclamo */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Crear Nuevo Reclamo
            </h2>
            <p className="text-gray-600 mb-4">
              Reporta un problema urbano para que la municipalidad pueda actuar.
            </p>
          </div>
          <Link to="/claims/new">
            <Button className="w-full">Crear Reclamo</Button>
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estadísticas Personales
          </h2>

          <div className="space-y-3">
            {[
              { label: "Total de reclamos", value: claims.length },
              {
                label: "Pendientes",
                value: claims.filter((c) => c.estado?.nombre === "Pendiente").length,
              },
              {
                label: "Resueltos",
                value: claims.filter((c) => c.estado?.nombre === "Resuelto").length,
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-300">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT CLAIMS */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Mis Reclamos</h2>
          {!!claims.length && (
            <Link to="/claims">
              <Button variant="secondary" size="sm">
                Ver Todos
              </Button>
            </Link>
          )}
        </div>

        {/* Empty */}
        {claims.length === 0 ? (
          <EmptyState
            title="No tienes reclamos todavía"
            description="Comienza reportando tu primer reclamo urbano."
            action={
              <Link to="/claims/new">
                <Button>Crear Reclamo</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">

            {claims.slice(0, 5).map((claim) => (
              <div
                key={claim.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all flex justify-between"
              >
                {/* LEFT SIDE */}
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold text-gray-900">{claim.titulo}</h3>

                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {claim.descripcion}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>📍 {claim.ubicacion || "Sin ubicación"}</span>
                    <span>🏷️ {claim.categoria?.nombre}</span>
                    <span>{new Date(claim.fechaCreacion).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* RIGHT STATUS */}
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                    claim.estado?.nombre
                  )}`}
                >
                  {claim.estado?.nombre}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCitizen;
