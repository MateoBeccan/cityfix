import { useState, useEffect } from 'react';
import api from './axios';
import Button from './Button';
import FormInput from './FormInput';
import Alert from './Alert';
import StatusBadge from './StatusBadge';

const AdminStatuses = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/api/statuses');
      setStatuses(response.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al cargar estados' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStatus) {
        await api.put(`/api/statuses/${editingStatus.id}`, formData);
        setAlert({ type: 'success', message: 'Estado actualizado correctamente' });
      } else {
        await api.post('/api/statuses', formData);
        setAlert({ type: 'success', message: 'Estado creado correctamente' });
      }
      resetForm();
      fetchStatuses();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error al guardar estado' });
    }
  };

  const handleEdit = (status) => {
    setEditingStatus(status);
    setFormData({
      nombre: status.nombre,
      descripcion: status.descripcion || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (statusId) => {
    if (window.confirm('¿Estás seguro de eliminar este estado?')) {
      try {
        await api.delete(`/api/statuses/${statusId}`);
        setAlert({ type: 'success', message: 'Estado eliminado correctamente' });
        fetchStatuses();
      } catch (error) {
        setAlert({ type: 'error', message: 'Error al eliminar estado' });
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditingStatus(null);
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
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Estados</h1>
            <p className="text-gray-600 mt-1">Administra los estados de los reclamos</p>
          </div>
          <Button onClick={() => setShowForm(true)}>Nuevo Estado</Button>
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
            {editingStatus ? 'Editar Estado' : 'Nuevo Estado'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
              placeholder="Ej: En Revisión"
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
                placeholder="Descripción del estado..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vista Previa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statuses.map(status => (
                <tr key={status.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{status.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {status.descripcion || 'Sin descripción'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={status.nombre} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(status)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(status.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {statuses.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estados</h3>
          <p className="text-gray-600 mb-4">Comienza creando el primer estado</p>
          <Button onClick={() => setShowForm(true)}>Crear Estado</Button>
        </div>
      )}
    </div>
  );
};

export default AdminStatuses;