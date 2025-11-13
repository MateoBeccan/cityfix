import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "./axios";
import Button from "./Button";
import FormInput from "./FormInput";
import Alert from "./Alert";
import StatusBadge from "./StatusBadge";

const AdminStatuses = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const res = await api.get("/api/statuses");
      setStatuses(res.data);
    } catch {
      setAlert({ type: "error", message: "Error al cargar estados" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStatus) {
        await api.put(`/api/statuses/${editingStatus.id}`, formData);
        setAlert({ type: "success", message: "Estado actualizado correctamente" });
      } else {
        await api.post("/api/statuses", formData);
        setAlert({ type: "success", message: "Estado creado correctamente" });
      }
      resetForm();
      fetchStatuses();
    } catch (err) {
      setAlert({ type: "error", message: "Error al guardar estado" });
    }
  };

  const handleEdit = (s) => {
    setEditingStatus(s);
    setFormData({ nombre: s.nombre, descripcion: s.descripcion || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este estado?")) return;
    try {
      await api.delete(`/api/statuses/${id}`);
      setAlert({ type: "success", message: "Estado eliminado" });
      fetchStatuses();
    } catch {
      setAlert({ type: "error", message: "Error al eliminar estado" });
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", descripcion: "" });
    setEditingStatus(null);
    setShowForm(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 border-b-4 border-blue-600 rounded-full"></div>
      </div>
    );

  return (
    <motion.div
      className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen p-8 rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🔹 Header */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl shadow-lg p-8 flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-1">Gestión de Estados</h1>
          <p className="text-gray-600">Administra los estados de los reclamos</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md"
        >
          Nuevo Estado
        </motion.button>
      </motion.div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* 🧾 Formulario */}
      {showForm && (
        <motion.div
          className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            {editingStatus ? "Editar Estado" : "Nuevo Estado"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              placeholder="Ej: En Revisión"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Descripción del estado..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 📋 Tabla */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Vista Previa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statuses.map((s) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">{s.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {s.descripcion || "Sin descripción"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.nombre} />
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(s)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>
                      Eliminar
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {statuses.length === 0 && (
        <motion.div
          className="bg-white/80 rounded-2xl p-12 text-center shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay estados
          </h3>
          <p className="text-gray-600 mb-4">Comienza creando el primer estado</p>
          <Button onClick={() => setShowForm(true)}>Crear Estado</Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminStatuses;
