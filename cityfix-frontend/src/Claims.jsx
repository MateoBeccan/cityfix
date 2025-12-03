import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './axios';
import Button from './Button';
import ClaimCard from './ClaimCard';
import EmptyState from './EmptyState';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/api/claims/my-claims');
      setClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (claimId) => {
    try {
      await api.delete(`/api/claims/${claimId}`);
      setClaims(claims.filter(c => c.id !== claimId));
    } catch (error) {
      console.error('Error deleting claim:', error);
      alert('Error al eliminar el reclamo');
    }
  };

  // ----------------------------------------------
  // 🔥 FUNCIÓN DE NORMALIZACIÓN ULTRA SEGURA
  // ----------------------------------------------
  const normalize = (v) =>
    (v ?? "")
      .trim()
      .normalize("NFD")                 // separa letras de tildes
      .replace(/[\u0300-\u036f]/g, "") // elimina tildes
      .toLowerCase();                  // pasa a minúsculas

  // ----------------------------------------------
  // 🔥 FILTRO SEGURO
  // ----------------------------------------------
  const filteredClaims = claims.filter(claim => {
    if (filter === 'all') return true;

    const estado = normalize(claim.estado?.nombre);
    return estado === normalize(filter);
  });

  // ----------------------------------------------
  // 🔥 CONTADORES SEGUROS
  // ----------------------------------------------
  const getFilterCounts = () => ({
    all: claims.length,
    pendiente: claims.filter(c => normalize(c.estado?.nombre) === "pendiente").length,
    "en proceso": claims.filter(c => normalize(c.estado?.nombre) === "en proceso").length,
    resuelto: claims.filter(c => normalize(c.estado?.nombre) === "resuelto").length
  });

  const counts = getFilterCounts();

  // ----------------------------------------------
  // LOADING
  // ----------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mis Reclamos</h1>
            <p className="text-gray-600">Gestiona tus reportes urbanos</p>
          </div>
          <Link to="/claims/new">
            <Button className="w-full sm:w-auto">Nuevo Reclamo</Button>
          </Link>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todos', count: counts.all },
            { key: 'pendiente', label: 'Pendientes', count: counts.pendiente },
            { key: 'en proceso', label: 'En Proceso', count: counts['en proceso'] },
            { key: 'resuelto', label: 'Resueltos', count: counts.resuelto }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* CLAIMS GRID */}
      {filteredClaims.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm">
          <EmptyState
            title="No hay reclamos"
            description={
              filter === 'all'
                ? 'Aún no has creado ningún reclamo.'
                : `No tienes reclamos ${filter}.`
            }
            action={
              <Link to="/claims/new">
                <Button>Crear Reclamo</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Claims;
