import { useState, useEffect } from 'react';
import api from './axios';
import Button from './Button';
import FormInput from './FormInput';
import Alert from './Alert';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    roleId: ''
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      // Intentar diferentes endpoints
      let response;
      try {
        response = await api.get('/api/users');
      } catch {
        response = await api.get('/api/user');
      }
      setUsers(response.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al cargar usuarios' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      // Roles por defecto
      setRoles([
        { id: 'ADMIN', nombre: 'ADMIN' },
        { id: 'OPERADOR', nombre: 'OPERADOR' },
        { id: 'CIUDADANO', nombre: 'CIUDADANO' }
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
          roleId: formData.roleId
        });
        setAlert({ type: 'success', message: 'Usuario actualizado correctamente' });
      } else {
        // Crear usuario con registro normal
        const registerData = {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password
        };
        
        await api.post('/api/auth/register', registerData);
        
        // Si no es ciudadano, actualizar rol
        if (formData.roleId !== 'CIUDADANO') {
          try {
            // Buscar el usuario recién creado
            const usersResponse = await api.get('/api/users');
            const newUser = usersResponse.data.find(u => u.email === formData.email);
            
            if (newUser) {
              // Actualizar rol directamente en la base de datos
              await api.put(`/api/users/${newUser.id}`, {
                ...newUser,
                role: { nombre: formData.roleId }
              });
              setAlert({ type: 'success', message: `Usuario creado como ${formData.roleId}` });
            } else {
              setAlert({ type: 'warning', message: 'Usuario creado como CIUDADANO' });
            }
          } catch (roleError) {
            setAlert({ type: 'warning', message: 'Usuario creado como CIUDADANO' });
          }
        } else {
          setAlert({ type: 'success', message: 'Usuario creado correctamente' });
        }
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error al guardar usuario' });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '',
      roleId: user.role?.id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/api/users/${userId}`);
        setAlert({ type: 'success', message: 'Usuario eliminado correctamente' });
        fetchUsers();
      } catch (error) {
        setAlert({ type: 'error', message: 'Error al eliminar usuario' });
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', email: '', password: '', roleId: '' });
    setEditingUser(null);
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
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
          </div>
          <Button onClick={() => setShowForm(true)}>Nuevo Usuario</Button>
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
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <FormInput
                label={editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!editingUser}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.nombre}</option>
                  ))}
                </select>
              </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{user.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {user.role?.nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(user)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
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
    </div>
  );
};

export default AdminUsers;