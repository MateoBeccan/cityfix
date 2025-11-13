import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "./axios";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import { useAuth } from "./AuthContext";

export default function AdminClaims() {
  const { token } = useAuth();

  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterUser, setFilterUser] = useState("");

  // Panel lateral
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchClaims();
  }, []);

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

  // ⭐ Aplicar filtros dinámicos
  useEffect(() => {
    let data = [...claims];

    if (filterStatus !== "Todos") {
      data = data.filter(
        (c) => c.estado?.nombre?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    if (filterCategory !== "Todas") {
      data = data.filter(
        (c) =>
          c.categoria?.nombre?.toLowerCase() ===
          filterCategory.toLowerCase()
      );
    }

    if (filterUser.trim() !== "") {
      data = data.filter((c) =>
        c.usuario?.nombre?.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    setFilteredClaims(data);
  }, [filterStatus, filterCategory, filterUser, claims]);

  // ⭐ Cambiar estado
  const handleStatusUpdate = async () => {
    if (!newStatus) return alert("Selecciona un estado");

    try {
      await api.put(
        `/api/claims/${selectedClaim.id}/status`,
        {
          estadoNombre: newStatus,
          descripcion: "Actualizado por administrador",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Estado actualizado");
      fetchClaims();
      setSelectedClaim(null);
      setNewStatus("");
    } catch (error) {
      alert("Error al actualizar el estado");
    }
  };

  //  Eliminar reclamo
  const handleDelete = async () => {
    if (!window.confirm("¿Seguro de eliminar este reclamo?")) return;

    try {
      await api.delete(`/api/claims/admin/${selectedClaim.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {} //
      });

      alert("Reclamo eliminado");
      fetchClaims();
      setSelectedClaim(null);
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el reclamo ❌");
    }
  };


  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 border-b-4 border-blue-600 rounded-full"></div>
      </div>
    );

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-green-50 p-8 rounded-xl shadow-sm">

      {/* HEADER */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl shadow-lg p-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-3xl font-bold text-blue-700">Gestión de Reclamos</h1>
        <p className="text-gray-600">Administra todos los reclamos del sistema</p>
      </motion.div>

      {/* FILTROS */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow p-6 grid md:grid-cols-3 gap-6">
        <div>
          <label className="font-semibold text-gray-700">Filtrar por Estado</label>
          <select
            className="w-full mt-1 border rounded-lg p-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>Todos</option>
            <option>Pendiente</option>
            <option>En Proceso</option>
            <option>Resuelto</option>
            <option>Rechazado</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-gray-700">Filtrar por Categoría</label>
          <select
            className="w-full mt-1 border rounded-lg p-2"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option>Todas</option>
            <option>Limpieza Urbana</option>
            <option>Servicios</option>
            <option>Señalización</option>
            <option>Baches</option>
            <option>Otros</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-gray-700">Filtrar por Usuario</label>
          <input
            className="w-full mt-1 border rounded-lg p-2"
            placeholder="Nombre del usuario..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border rounded-2xl shadow-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Usuario
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-800 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredClaims.map((claim) => (
                <motion.tr
                  key={claim.id}
                  className="hover:bg-blue-50 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-4 py-3">{claim.id}</td>
                  <td className="px-4 py-3">{claim.titulo}</td>
                  <td className="px-4 py-3">{claim.categoria?.nombre}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={claim.estado?.nombre} />
                  </td>
                  <td className="px-4 py-3">{claim.usuario?.nombre}</td>
                  <td className="px-4 py-3 text-center">
                    <Button size="sm" onClick={() => setSelectedClaim(claim)}>
                      Ver
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* PANEL LATERAL DE DETALLES */}
      <AnimatePresence>
        {selectedClaim && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedClaim(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              className="w-full max-w-lg bg-white h-full shadow-xl p-6 overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-blue-700 mb-4">
                Reclamo #{selectedClaim.id}
              </h2>

              <p className="font-semibold text-gray-700">Título</p>
              <p className="mb-2">{selectedClaim.titulo}</p>

              <p className="font-semibold text-gray-700">Descripción</p>
              <p className="mb-2 whitespace-pre-wrap">
                {selectedClaim.descripcion}
              </p>

              <p className="font-semibold text-gray-700">Categoría</p>
              <p className="mb-2">{selectedClaim.categoria?.nombre}</p>

              <p className="font-semibold text-gray-700">Estado</p>
              <StatusBadge status={selectedClaim.estado?.nombre} />

              <p className="font-semibold text-gray-700 mt-4">Usuario</p>
              <p className="mb-2">{selectedClaim.usuario?.nombre}</p>

              <p className="font-semibold text-gray-700">Fecha</p>
              <p className="mb-4">{selectedClaim.fechaCreacion}</p>

              {selectedClaim.imagenUrl && (
                <>
                  <p className="font-semibold text-gray-700 mb-2">Imagen</p>
                  <img
                    src={selectedClaim.imagenUrl}
                    className="w-full rounded-lg shadow mb-4"
                  />
                </>
              )}

              {/* Cambiar estado */}
              <div className="mt-6">
                <label className="font-semibold text-gray-700">
                  Cambiar Estado
                </label>
                <select
                  className="w-full mt-2 border rounded-lg p-2"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Resuelto">Resuelto</option>
                  <option value="Rechazado">Rechazado</option>
                </select>

                <Button
                  className="w-full mt-3"
                  onClick={handleStatusUpdate}
                >
                  Actualizar Estado
                </Button>
              </div>

              {/* Eliminar */}
              <Button
                variant="danger"
                className="w-full mt-4"
                onClick={handleDelete}
              >
                Eliminar Reclamo
              </Button>

              {/* Cerrar */}
              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={() => setSelectedClaim(null)}
              >
                Cerrar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
