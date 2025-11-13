import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "./axios";
import Button from "./Button";
import FormInput from "./FormInput";
import Alert from "./Alert";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      setAlert({ type: "error", message: "Error al cargar categorías" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory.id}`, formData);
        setAlert({
          type: "success",
          message: "Categoría actualizada correctamente",
        });
      } else {
        await api.post("/api/categories", formData);
        setAlert({ type: "success", message: "Categoría creada correctamente" });
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Error al guardar la categoría",
      });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    try {
      await api.delete(`/api/categories/${categoryId}`);
      setAlert({
        type: "success",
        message: "Categoría eliminada correctamente",
      });
      fetchCategories();
    } catch {
      setAlert({ type: "error", message: "Error al eliminar categoría" });
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", descripcion: "" });
    setEditingCategory(null);
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
          <h1 className="text-3xl font-bold text-blue-700 mb-1">
            Gestión de Categorías
          </h1>
          <p className="text-gray-600">
            Administra las categorías de reclamos del sistema
          </p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md"
        >
          Nueva Categoría
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
            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              required
              placeholder="Ej: Alumbrado Público"
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
                placeholder="Descripción de la categoría..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="submit">Guardar</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 🗂️ Listado de Categorías */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {categories.map((category, i) => (
          <motion.div
            key={category.id}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏷️</span>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {category.nombre}
                </h3>
              </div>
              <span className="text-xs text-gray-500">ID: {category.id}</span>
            </div>
            {category.descripcion ? (
              <p className="text-sm text-gray-600 mb-4">
                {category.descripcion}
              </p>
            ) : (
              <p className="text-sm italic text-gray-400 mb-4">
                Sin descripción
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleEdit(category)}>
                Editar
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(category.id)}>
                Eliminar
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {categories.length === 0 && (
        <motion.div
          className="bg-white/80 rounded-2xl p-12 text-center shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay categorías
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza creando la primera categoría
          </p>
          <Button onClick={() => setShowForm(true)}>Crear Categoría</Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminCategories;
