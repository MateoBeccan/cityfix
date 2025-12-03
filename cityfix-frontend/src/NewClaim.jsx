import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./axios";
import Button from "./Button";
import FormInput from "./FormInput";

const NewClaim = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    categoriaId: "",
    imagenUrl: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio";
    } else if (formData.titulo.length < 5) {
      newErrors.titulo = "Debe tener al menos 5 caracteres";
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = "Debe seleccionar una categoría";
    }

    if (
      formData.imagenUrl &&
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.imagenUrl)
    ) {
      newErrors.imagenUrl = "URL de imagen inválida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/api/claims", {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        ubicacion: formData.ubicacion.trim() || null,
        imagenUrl: formData.imagenUrl.trim() || null,
        categoriaId: parseInt(formData.categoriaId),
      });

      navigate("/claims");
    } catch (error) {
      setError("Hubo un error al crear el reclamo");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10 animate-fadeIn">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-5 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Crear Nuevo Reclamo
        </h1>
        <p className="text-gray-600 mt-1">
          Ayudá a mejorar tu ciudad reportando un problema urbano
        </p>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* TÍTULO */}
          <FormInput
            label="Título del Reclamo *"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej: Farola rota frente a mi casa"
            error={errors.titulo}
          />

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              rows={5}
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe el problema de forma clara y detallada..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            ></textarea>
            {errors.descripcion && (
              <p className="text-red-600 text-sm mt-1">{errors.descripcion}</p>
            )}
          </div>

          {/* UBICACIÓN */}
          <FormInput
            label="Ubicación (opcional)"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            placeholder="Ej: Av. Pellegrini 2000"
          />

          {/* CATEGORÍA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {errors.categoriaId && (
              <p className="text-red-600 text-sm mt-1">
                {errors.categoriaId}
              </p>
            )}
          </div>

          {/* URL IMAGEN */}
          <FormInput
            label="URL de imagen (opcional)"
            name="imagenUrl"
            value={formData.imagenUrl}
            onChange={handleChange}
            placeholder="https://ejemplo.com/foto.png"
            error={errors.imagenUrl}
          />

          {/* PREVIEW */}
          {formData.imagenUrl && (
            <div className="mt-3">
              <img
                src={formData.imagenUrl}
                alt="Vista previa"
                className="w-40 h-40 rounded-xl object-cover border shadow-sm"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}

          {/* ERROR GENERAL */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* BOTONES */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/claims")}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Crear Reclamo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClaim;
