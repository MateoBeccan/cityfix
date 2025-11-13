import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './axios';
import Button from './Button';

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalClaims: 0,
    totalUsers: 0,
    pendingClaims: 0,
    resolvedClaims: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [claimsResponse, usersResponse] = await Promise.all([
        api.get('/api/claims'),
        api.get('/api/users')
      ]);
      
      const claims = claimsResponse.data;
      const users = usersResponse.data;
      
      setStats({
        totalClaims: claims.length,
        totalUsers: users.length,
        pendingClaims: claims.filter(c => c.estado?.nombre === 'Pendiente').length,
        resolvedClaims: claims.filter(c => c.estado?.nombre === 'Resuelto').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      title: 'Gestión de Reclamos',
      description: 'Ver y administrar todos los reclamos del sistema',
      icon: '📋',
      href: '/admin/claims',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios y roles del sistema',
      icon: '👥',
      href: '/admin/users',
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Categorías',
      description: 'Configurar categorías de reclamos',
      icon: '🏷️',
      href: '/admin/categories',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Estados',
      description: 'Gestionar estados de los reclamos',
      icon: '⚡',
      href: '/admin/statuses',
      color: 'bg-orange-50 border-orange-200'
    }
  ];

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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Panel Administrador</h1>
        <p className="text-gray-600">Control total del sistema CityFix</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reclamos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resueltos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.resolvedClaims}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminCards.map((card) => (
          <div key={card.title} className={`bg-white rounded-xl shadow-sm p-6 border-2 ${card.color}`}>
            <div className="flex items-start">
              <div className="text-3xl mr-4">{card.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 mb-4">{card.description}</p>
                <Link to={card.href}>
                  <Button size="sm">Acceder</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardAdmin;