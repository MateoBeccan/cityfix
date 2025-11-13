import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../axios";
import ClaimCard from "../ClaimCard";
import { useAuth } from "../AuthContext";
import Button from "../Button";
import logo from "../assets/logo_reclamo.png";

const Feed = () => {
  const { user, token } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get("/api/claims/feed");
        setClaims(res.data.content || []);
      } catch (error) {
        console.error("Error al cargar el feed público:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando reclamos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header principal */}
      <div className="bg-white/80 backdrop-blur-md shadow-md border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-6 py-10 text-center">
          <div className="flex flex-col items-center mb-4">
            <img
              src={logo}
              alt="CityFix Reclamos"
              className="w-20 h-20 mb-3 rounded-full border-4 border-blue-500 shadow-md object-contain"
            />
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
              Reclamos Públicos
            </h1>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explorá los reportes y problemas urbanos compartidos por la comunidad.
          </p>

          {user ? (
            <p className="mt-3 text-sm text-gray-500">
              Conectado como{" "}
              <span className="font-semibold text-blue-700">{user.nombre}</span>
            </p>
          ) : (
            <div className="mt-6 flex justify-center gap-4">
              <Link to="/login">
                <Button
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="secondary"
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg shadow-sm"
                >
                  Crear Cuenta
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Contenido del feed */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {claims.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md p-10 text-center border border-blue-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-blue-500">📭</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay reclamos aún
            </h3>
            <p className="text-gray-500 mb-6">
              Sé el primero en reportar un problema en tu zona.
            </p>
            {token ? (
              <Link to="/claims/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow">
                  Crear Reclamo
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-blue-200 pb-2">
              Últimos reclamos
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-xl shadow-soft hover:shadow-lg transition-all border border-blue-100 p-5 flex flex-col justify-between"
                >
                  <ClaimCard claim={claim} showActions={true} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-sm text-gray-500 border-t border-blue-100">
        <p>🏙️ CityFix © 2025 — Conectando ciudadanos con soluciones urbanas.</p>
      </footer>
    </div>
  );
};

export default Feed;
