import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./AuthContext";
import api from "./axios";
import { useNavigate } from "react-router-dom";

const ProfileEdit = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    email: user?.email || "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  // ---------------------------
  // VALIDACIONES
  // ---------------------------
  const validate = () => {
    const newErrors = {};

    // Nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "Debe tener al menos 2 caracteres.";
    } else if (formData.nombre.length > 40) {
      newErrors.nombre = "Máximo permitido: 40 caracteres.";
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(formData.nombre)) {
      newErrors.nombre = "Sólo se permiten letras y espacios.";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Formato de email inválido.";
    }

    // Contraseña (solo si se quiere cambiar)
    if (formData.password.trim() !== "") {
      if (formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener mínimo 6 caracteres.";
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Debe incluir al menos un número.";
      } else if (!/[A-Za-z]/.test(formData.password)) {
        newErrors.password = "Debe incluir al menos una letra.";
      }
    }

    setErrors(newErrors);

    // Si no hay errores → true
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return; // ⛔ NO enviar si hay errores

    try {
      const res = await api.put(`/api/users/update-profile`, formData);

      updateUserData({
        ...user,
        nombre: res.data.nombre,
        email: res.data.email,
      });

      setAlert({
        type: "success",
        message: "Perfil actualizado correctamente 🎉",
      });

      setTimeout(() => navigate("/dashboard"), 1200);

    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message ||
          "No se pudo actualizar el perfil ❌",
      });
    }
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <motion.div
      className="max-w-xl mx-auto p-8 bg-white/80 rounded-2xl shadow-md mt-24 border border-blue-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-3xl font-bold text-blue-700 mb-6">
        Editar Perfil
      </h2>

      {alert && (
        <div
          className={`p-3 mb-4 rounded-lg ${
            alert.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Nombre */}
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded-xl border ${
              errors.nombre ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
          {errors.nombre && (
            <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className={`w-full px-3 py-2 rounded-xl border ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label className="text-sm font-medium">
            Nueva Contraseña (opcional)
          </label>
          <input
            type="password"
            className={`w-full px-3 py-2 rounded-xl border ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold shadow-md"
        >
          Guardar Cambios
        </button>
      </form>
    </motion.div>
  );
};

export default ProfileEdit;
