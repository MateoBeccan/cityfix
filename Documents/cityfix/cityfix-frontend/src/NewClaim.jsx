import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axios';
import Button from './Button';
import FormInput from './FormInput';

const NewClaim = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    categoriaId: '',
    imagenUrl: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (formData.titulo.length < 5 || formData.titulo.length > 150) {
      newErrors.titulo = 'El título debe tener entre 5 y 150 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 10 || formData.descripcion.length > 2000) {
      newErrors.descripcion = 'La descripción debe tener entre 10 y 2000 caracteres';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Debe seleccionar una categoría';
    }

    if (
      formData.imagenUrl &&
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.imagenUrl)
    ) {
      newErrors.imagenUrl = 'URL de imagen inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const claimData = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        ubicacion: formData.ubicacion?.trim() || null,
        imagenUrl: formData.imagenUrl?.trim() || null,
        categoriaId: parseInt(formData.categoriaId) // ✅ corregido: el backend espera categoriaId, no objeto categoria
      };

      await api.post('/api/claims', claimData);
      navigate('/claims');
    } catch (error) {
      console.error('Error creando reclamo:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setError(error.response?.data?.error || 'Error al crear el reclamo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Crear Nuevo Reclamo
        </h1>
        <p className="text-gray-600">Reporta un problema urbano</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Título del Reclamo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej: Bache en la calle principal"
            error={errors.titulo}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe el problema detalladamente..."
              required
            />
            {errors.descripcion && (
              <p className="text-red-600 text-sm mt-1">{errors.descripcion}</p>
            )}
          </div>

          <FormInput
            label="Ubicación"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            placeholder="Ej: Av. San Martín 1234"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
            {errors.categoriaId && (
              <p className="text-red-600 text-sm mt-1">{errors.categoriaId}</p>
            )}
          </div>

          <FormInput
            label="URL de Imagen (opcional)"
            name="imagenUrl"
            type="url"
            value={formData.imagenUrl}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            error={errors.imagenUrl}
          />

          {formData.imagenUrl && (
            <img
              src={formData.imagenUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg"
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/claims')}
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
