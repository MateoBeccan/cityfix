import { useState, useEffect } from 'react';
import api from './axios';
import Button from './Button';
import FormInput from './FormInput';
import Alert from './Alert';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al cargar categorías' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory.id}`, formData);
        setAlert({ type: 'success', message: 'Categoría actualizada correctamente' });
      } else {
        await api.post('/api/categories', formData);
        setAlert({ type: 'success', message: 'Categoría creada correctamente' });
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error al guardar categoría' });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await api.delete(`/api/categories/${categoryId}`);
        setAlert({ type: 'success', message: 'Categoría eliminada correctamente' });
        fetchCategories();
      } catch (error) {
        setAlert({ type: 'error', message: 'Error al eliminar categoría' });
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Categorías</h1>
            <p className="text-gray-600 mt-1">Administra las categorías de reclamos</p>
          </div>
          <Button onClick={() => setShowForm(true)}>Nueva Categoría</Button>
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
              placeholder="Ej: Alumbrado Público"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción de la categoría..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{category.nombre}</h3>
              <span className="text-xs text-gray-500">ID: {category.id}</span>
            </div>
            {category.descripcion && (
              <p className="text-sm text-gray-600 mb-4">{category.descripcion}</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleEdit(category)}>
                Editar
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(category.id)}>
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
          <p className="text-gray-600 mb-4">Comienza creando la primera categoría</p>
          <Button onClick={() => setShowForm(true)}>Crear Categoría</Button>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;