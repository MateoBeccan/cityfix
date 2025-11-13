import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "./axios";
import { useAuth } from "./AuthContext";
import Button from "./Button";
import ClaimHistory from "./ClaimHistory";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardOperator = () => {
  const { token } = useAuth();
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [description, setDescription] = useState("");
  const [historyClaim, setHistoryClaim] = useState(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    filterStatus,
    filterCategory,
    filterUser,
    filterStartDate,
    filterEndDate,
    claims,
  ]);

  const fetchClaims = async () => {
    try {
      const res = await api.get("/api/claims", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data);
      setFilteredClaims(res.data);
    } catch (err) {
      console.error("❌ Error al cargar reclamos:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = claims;

    if (filterStatus) {
      filtered = filtered.filter(
        (c) => c.estado?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(
        (c) =>
          c.categoria?.toLowerCase().includes(filterCategory.toLowerCase()) ||
          c.categoria === filterCategory
      );
    }

    if (filterUser) {
      filtered = filtered.filter((c) =>
        c.usuarioNombre?.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    if (filterStartDate || filterEndDate) {
      filtered = filtered.filter((c) => {
        if (!c.fechaCreacion) return false;
        const claimDate = new Date(c.fechaCreacion);
        const start = filterStartDate ? new Date(filterStartDate) : null;
        const end = filterEndDate ? new Date(filterEndDate) : null;
        if (start && claimDate < start) return false;
        if (end && claimDate > end) return false;
        return true;
      });
    }

    setFilteredClaims(filtered);
  };

  const handleStatusUpdate = async () => {
    if (!selectedClaim || !newStatus) {
      alert("Selecciona un reclamo y un nuevo estado");
      return;
    }

    try {
      await api.put(
        `/api/claims/${selectedClaim}/status`,
        { estadoNombre: newStatus, descripcion: description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Estado actualizado correctamente");
      setSelectedClaim(null);
      setNewStatus("");
      setDescription("");
      fetchClaims();
    } catch (err) {
      console.error("❌ Error al actualizar estado:", err);
      alert("Error al actualizar el estado");
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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Estadísticas globales
  const countByStatus = (status) =>
    claims.filter((c) => c.estado === status).length;

  const chartData = [
    { name: "Pendiente", value: countByStatus("Pendiente") },
    { name: "En Proceso", value: countByStatus("En Proceso") },
    { name: "Resuelto", value: countByStatus("Resuelto") },
    { name: "Rechazado", value: countByStatus("Rechazado") },
  ];

  const COLORS = ["#FACC15", "#3B82F6", "#22C55E", "#EF4444"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 rounded-xl shadow-sm">
      {/* ENCABEZADO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md border border-blue-100 p-6"
      >
        <h1 className="text-3xl font-semibold text-blue-700 mb-2">
          Panel del Operador
        </h1>
        <p className="text-gray-600">
          Gestiona los reclamos urbanos, aplica filtros, analiza el estado general y cambia su estado.
        </p>
      </motion.div>

      {/* TABLA DE RECLAMOS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-6 overflow-x-auto"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Título</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Categoría</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Estado</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Usuario</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Fecha</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClaims.map((claim) => (
              <motion.tr
                key={claim.id}
                whileHover={{ scale: 1.01, backgroundColor: "#eff6ff" }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer"
              >
                <td className="px-4 py-2 text-sm text-gray-600">{claim.id}</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {claim.titulo}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {claim.categoria || "Sin categoría"}
                </td>
                <td className="px-4 py-2 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                      claim.estado
                    )}`}
                  >
                    {claim.estado || "Sin estado"}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {claim.usuarioNombre || "—"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {formatDate(claim.fechaCreacion)}
                </td>
                <td className="px-4 py-2 text-sm space-x-3 text-right">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedClaim(claim.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Cambiar estado
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setHistoryClaim(claim.id)}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Ver historial
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredClaims.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            No se encontraron reclamos con los filtros aplicados.
          </p>
        )}
      </motion.div>

      {/* PANEL CAMBIO DE ESTADO CON EFECTO */}
      <AnimatePresence>
        {selectedClaim && (
          <motion.div
            key="panel-estado"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="bg-white rounded-xl shadow-lg border border-blue-200 p-6"
          >
            <h2 className="text-lg font-semibold text-blue-700 mb-4">
              Actualizar Estado del Reclamo #{selectedClaim}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Estado
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Resuelto">Resuelto</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Se envió cuadrilla a revisar..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-3">
              <Button onClick={handleStatusUpdate}>Guardar Cambios</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedClaim(null);
                  setNewStatus("");
                  setDescription("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HISTORIAL CON EFECTO */}
      <AnimatePresence>
        {historyClaim && (
          <motion.div
            key="historial"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 90, damping: 14 }}
          >
            <ClaimHistory
              claimId={historyClaim}
              onClose={() => setHistoryClaim(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardOperator;
