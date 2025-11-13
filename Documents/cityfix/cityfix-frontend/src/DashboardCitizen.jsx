import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./axios";
import Button from "./Button";
import EmptyState from "./EmptyState";
import { useAuth } from "./AuthContext"; // ✅ para acceder al token y logout

const DashboardCitizen = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, logout } = useAuth(); // ✅ obtener token y logout global

  useEffect(() => {
    fetchClaims();
  }, []);

  // ✅ Obtener reclamos del ciudadano autenticado
  const fetchClaims = async () => {
    try {
      const response = await api.get("/api/claims/my-claims", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Enviar token JWT
        },
      });
      setClaims(response.data);
    } catch (error) {
      console.error("Error fetching claims:", error);

      // 🔒 Si el token expiró o el servidor devuelve 403/401 → cerrar sesión
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Colores de estado
  const getStatusColor = (status) => {
    const colors = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En Proceso": "bg-blue-100 text-blue-800",
      Resuelto: "bg-green-100 text-green-800",
      Rechazado: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Panel Ciudadano
        </h1>
        <p className="text-gray-600">
          Gestiona tus reclamos urbanos registrados en el sistema
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Crear Nuevo Reclamo
          </h2>
          <p className="text-gray-600 mb-4">
            Reporta un problema urbano en tu zona para su revisión
          </p>
          <Link to="/claims/new">
            <Button>Crear Reclamo</Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estadísticas
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{claims.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pendientes:</span>
              <span className="font-medium">
                {claims.filter((c) => c.estado?.nombre === "Pendiente").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Resueltos:</span>
              <span className="font-medium">
                {claims.filter((c) => c.estado?.nombre === "Resuelto").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Mis Reclamos Recientes
          </h2>
          {claims.length > 0 && (
            <Link to="/claims">
              <Button variant="secondary" size="sm">
                Ver Todos
              </Button>
            </Link>
          )}
        </div>

        {claims.length === 0 ? (
          <EmptyState
            title="No tienes reclamos aún"
            description="Comienza reportando tu primer problema urbano"
            action={
              <Link to="/claims/new">
                <Button>Crear Primer Reclamo</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {claims.slice(0, 5).map((claim) => (
              <div
                key={claim.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{claim.titulo}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {claim.descripcion?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{claim.categoria?.nombre}</span>
                      <span>
                        {new Date(claim.fechaCreacion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      claim.estado?.nombre
                    )}`}
                  >
                    {claim.estado?.nombre}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCitizen;
