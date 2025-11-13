import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "./axios";
import Button from "./Button";
import ClaimCard from "./ClaimCard";
import EmptyState from "./EmptyState";

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await api.get("/api/claims/my-claims");
      setClaims(response.data);
    } catch (error) {
      console.error("❌ Error al obtener reclamos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (claimId) => {
    try {
      await api.delete(`/api/claims/${claimId}`);
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
    } catch (error) {
      console.error("❌ Error al eliminar reclamo:", error);
      alert("Error al eliminar el reclamo");
    }
  };

  // 🔹 Filtro seguro por estado
  const filteredClaims = claims.filter((claim) => {
    if (filter === "all") return true;
    const estado = (claim.estado || "").toLowerCase();
    return estado === filter;
  });

  // 🔹 Contadores seguros (incluye 'Rechazado')
  const getFilterCounts = () => {
    const safe = (estado) =>
      claims.filter((c) => (c.estado || "").toLowerCase() === estado).length;

    return {
      all: claims.length,
      pendiente: safe("pendiente"),
      "en proceso": safe("en proceso"),
      resuelto: safe("resuelto"),
      rechazado: safe("rechazado"),
    };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Mis Reclamos
            </h1>
            <p className="text-gray-600">
              Gestiona tus reportes urbanos realizados
            </p>
          </div>
          <Link to="/claims/new">
            <Button className="w-full sm:w-auto">Nuevo Reclamo</Button>
          </Link>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Todos", count: counts.all },
            { key: "pendiente", label: "Pendientes", count: counts.pendiente },
            { key: "en proceso", label: "En Proceso", count: counts["en proceso"] },
            { key: "resuelto", label: "Resueltos", count: counts.resuelto },
            { key: "rechazado", label: "Rechazados", count: counts.rechazado },
          ].map((filterItem) => (
            <button
              key={filterItem.key}
              onClick={() => setFilter(filterItem.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === filterItem.key
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filterItem.label} ({filterItem.count})
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE RECLAMOS */}
      {filteredClaims.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm">
          <EmptyState
            title="No hay reclamos"
            description={
              filter === "all"
                ? "Aún no has creado ningún reclamo."
                : `No tienes reclamos ${filter}.`
            }
            action={
              <Link to="/claims/new">
                <Button>Crear Reclamo</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Claims;
