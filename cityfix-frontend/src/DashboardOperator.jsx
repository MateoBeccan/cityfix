import { useState, useEffect } from "react";
import api from "./axios";
import { useAuth } from "./AuthContext";
import Button from "./Button";
import ClaimHistory from "./ClaimHistory";
import { motion } from "framer-motion";

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
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [claims, filterStatus, filterCategory, filterUser, filterDateFrom, filterDateTo]);

  const fetchClaims = async () => {
    try {
      const res = await api.get("/api/claims", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data);
      setFilteredClaims(res.data);
    } catch (err) {
      console.error("Error al cargar reclamos:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...claims];

    if (filterStatus)
      filtered = filtered.filter(
        (c) => c.estado?.nombre === filterStatus
      );

    if (filterCategory)
      filtered = filtered.filter(
        (c) => c.categoria?.nombre === filterCategory
      );

    if (filterUser)
      filtered = filtered.filter((c) =>
        c.usuario?.email?.toLowerCase().includes(filterUser.toLowerCase())
      );

    if (filterDateFrom)
      filtered = filtered.filter(
        (c) => new Date(c.fechaCreacion) >= new Date(filterDateFrom)
      );

    if (filterDateTo)
      filtered = filtered.filter(
        (c) => new Date(c.fechaCreacion) <= new Date(filterDateTo)
      );

    setFilteredClaims(filtered);
  };

  const handleStatusUpdate = async () => {
    if (!selectedClaim || !newStatus) {
      alert("Selecciona un reclamo y un estado nuevo");
      return;
    }

    try {
      await api.put(
        `/api/claims/${selectedClaim}/status`,
        { estadoNombre: newStatus, descripcion: description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Estado actualizado correctamente ✅");
      setSelectedClaim(null);
      setNewStatus("");
      setDescription("");
      fetchClaims();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("Error al actualizar el estado ❌");
    }
  };

  // 📊 Calcular métricas
  const getMetrics = () => {
    const total = claims.length;
    const pendientes = claims.filter((c) => c.estado?.nombre === "Pendiente").length;
    const enProceso = claims.filter((c) => c.estado?.nombre === "En Proceso").length;
    const resueltos = claims.filter((c) => c.estado?.nombre === "Resuelto").length;
    const rechazados = claims.filter((c) => c.estado?.nombre === "Rechazado").length;

    return { total, pendientes, enProceso, resueltos, rechazados };
  };

  const metrics = getMetrics();

  const chartData = [
    { name: "Pendiente", value: metrics.pendientes },
    { name: "En Proceso", value: metrics.enProceso },
    { name: "Resuelto", value: metrics.resueltos },
    { name: "Rechazado", value: metrics.rechazados },
  ];

  const COLORS = ["#FACC15", "#3B82F6", "#22C55E", "#EF4444"];

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
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 rounded-xl shadow-sm">
      {/* 🏙️ Encabezado */}
      <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
        <h1 className="text-2xl font-semibold text-blue-700 mb-2">
          Panel del Operador
        </h1>
        <p className="text-gray-600">
          Gestiona los reclamos urbanos, aplica filtros, cambia estados o revisa el historial.
        </p>
      </div>

      {/* 📈 Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Pendientes", value: metrics.pendientes, color: "yellow" },
          { label: "En Proceso", value: metrics.enProceso, color: "blue" },
          { label: "Resueltos", value: metrics.resueltos, color: "green" },
          { label: "Rechazados", value: metrics.rechazados, color: "red" },
          { label: "Total", value: metrics.total, color: "gray" },
        ].map((m) => (
          <div
            key={m.label}
            className={`bg-${m.color}-100 border border-${m.color}-300 rounded-xl p-4 text-center shadow-sm`}
          >
            <h3 className={`text-${m.color}-800 font-semibold text-lg`}>
              {m.label}
            </h3>
            <p className={`text-2xl font-bold text-${m.color}-700`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* 🥧 Gráfico */}
      <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">
          Distribución de Reclamos por Estado
        </h2>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔍 Filtros */}
      {/* 🔍 FILTROS MEJORADOS */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L14 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          Filtros de búsqueda
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Filtro de Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Resuelto">Resuelto</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          {/* Filtro de Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <input
              type="text"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              placeholder="Ej: Alumbrado, Basura..."
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro de Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              placeholder="Correo o nombre"
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro de Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro de Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 🔘 Botones de acción */}
        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={applyFilters}>Aplicar filtros</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFilterStatus("");
              setFilterCategory("");
              setFilterUser("");
              setFilterDateFrom("");
              setFilterDateTo("");
              setFilteredClaims(claims);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>


      {/* 🧾 Tabla */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Título</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Categoría</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Usuario</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Fecha</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Estado</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClaims.map((claim) => (
              <tr
                key={claim.id}
                className="hover:bg-blue-50 transition-colors duration-200"
              >
                <td className="px-4 py-2 text-sm">{claim.id}</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {claim.titulo}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {claim.categoria?.nombre || "Sin categoría"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {claim.usuario?.email || claim.usuario?.nombre || "Desconocido"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {new Date(claim.fechaCreacion).toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-2 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      claim.estado?.nombre
                    )}`}
                  >
                    {claim.estado?.nombre}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm space-x-3">
                  <button
                    onClick={() => setSelectedClaim(claim.id)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Cambiar estado
                  </button>
                  <button
                    onClick={() => setHistoryClaim(claim.id)}
                    className="text-gray-600 hover:underline"
                  >
                    Ver historial
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✏️ Formulario cambio estado */}
      {selectedClaim && (
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
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
        </div>
      )}

      {/* 📜 Historial */}
      {historyClaim && (
        <ClaimHistory claimId={historyClaim} onClose={() => setHistoryClaim(null)} />
      )}
    </div>
  );
};

export default DashboardOperator;
