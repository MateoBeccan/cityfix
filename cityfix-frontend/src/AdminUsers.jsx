import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "./axios";
import Button from "./Button";
import FormInput from "./FormInput";
import Alert from "./Alert";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      setAlert({ type: "error", message: "Error al cargar usuarios" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/api/roles");
      setRoles(response.data);
    } catch {
      setRoles([
        { id: "ADMIN", nombre: "ADMIN" },
        { id: "OPERADOR", nombre: "OPERADOR" },
        { id: "CIUDADANO", nombre: "CIUDADANO" },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password || null,
          roleId: formData.roleId,
        });
        setAlert({ type: "success", message: "Usuario actualizado correctamente" });
      } else {
        const registerData = {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
        };
        await api.post("/api/auth/register", registerData);
        setAlert({ type: "success", message: "Usuario creado correctamente" });
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Error al guardar usuario",
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: "",
      roleId: user.role?.id || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await api.delete(`/api/users/${userId}`);
      setAlert({ type: "success", message: "Usuario eliminado correctamente" });
      fetchUsers();
    } catch {
      setAlert({ type: "error", message: "Error al eliminar usuario" });
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", email: "", password: "", roleId: "" });
    setEditingUser(null);
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
          <h1 className="text-3xl font-bold text-blue-700 mb-1">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md"
        >
          Nuevo Usuario
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
            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <FormInput
                label={editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) =>
                    setFormData({ ...formData, roleId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </div>
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
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">{u.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      {u.role?.nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(u)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>
                      Eliminar
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {users.length === 0 && (
        <motion.div
          className="bg-white/80 rounded-2xl p-12 text-center shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay usuarios
          </h3>
          <p className="text-gray-600 mb-4">Comienza creando el primer usuario</p>
          <Button onClick={() => setShowForm(true)}>Crear Usuario</Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminUsers;
