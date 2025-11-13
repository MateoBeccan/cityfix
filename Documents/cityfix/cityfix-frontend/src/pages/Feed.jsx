import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import api from "../axios";
import ClaimCard from "../ClaimCard";
import { useAuth } from "../AuthContext";
import Button from "../Button";
import logo from "../assets/logo_reclamo.png";
import PageTransition from "../PageTransition";
import SkeletonClaimCard from "../SkeletonClaimCard.jsx";
import RouteModal from "../RouteModal";
import QuickViewClaim from "../components/QuickViewClaim.jsx";
import LikeButton from "../components/LikeButton.jsx"; // ✅ nuevo import

export default function Feed() {
  const { user, token } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const categoria = searchParams.get("categoria") || "all";
  const page = Number(searchParams.get("page") || 0);

  const nav = useNavigate();
  const { id: modalId } = useParams();

  const filters = useMemo(
    () => [
      { key: "all", label: "Todas" },
      { key: "ALUMBRADO", label: "Alumbrado" },
      { key: "BACHES", label: "Baches" },
      { key: "LIMPIEZA", label: "Limpieza" },
    ],
    []
  );

  const applyParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val === undefined || val === null || val === "") next.delete(key);
    else next.set(key, val);
    next.set("page", "0");
    setSearchParams(next);
  };

  const fetchClaims = async (opts = { reset: true }) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", "9");
    if (q) params.set("q", q);
    if (categoria !== "all") params.set("categoria", categoria);

    try {
      opts.reset ? setLoading(true) : setPageLoading(true);
      const res = await api.get(`/api/claims/feed?${params.toString()}`);
      const content = res.data?.content ?? [];
      setTotalPages(res.data?.totalPages ?? 1);
      setClaims((prev) => (opts.reset ? content : [...prev, ...content]));
    } catch (err) {
      console.error("Error cargando feed:", err);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoria, page]);

  const loadMore = () => {
    if (page + 1 >= totalPages) return;
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page + 1));
    setSearchParams(next);
  };

  const openQuickView = (claimId) => {
    nav(`/feed/${claimId}?${searchParams.toString()}&modal=1`);
  };

  const closeQuickView = () => {
    nav(`/feed?${searchParams.toString()}`, { replace: true });
  };

  const showModal = searchParams.get("modal") === "1" && modalId;

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400">
                  Crear Cuenta
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <section className="max-w-5xl mx-auto px-6 pt-8">
        <div className="bg-white/80 border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => {
              const active = categoria === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => applyParam("categoria", f.key)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition
                    ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  aria-pressed={active}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="search"
              value={q}
              onChange={(e) => applyParam("q", e.target.value)}
              placeholder="Buscar por título o descripción…"
              className="w-full md:w-72 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              aria-label="Buscar reclamos"
            />
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main
        className="max-w-5xl mx-auto px-6 py-8 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent"
      >
        {loading ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-blue-200 pb-2">
              Cargando reclamos…
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonClaimCard key={i} />
              ))}
            </div>
          </>
        ) : claims.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md p-10 text-center border border-blue-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-blue-500">📭</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay resultados
            </h3>
            <p className="text-gray-500 mb-6">
              Probá cambiando filtros o términos de búsqueda.
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
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-blue-100 p-5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <button
                    onClick={() => openQuickView(claim.id)}
                    className="w-full text-left"
                  >
                    <ClaimCard claim={claim} showActions={false} />
                  </button>

                  {/* ❤️ Botón profesional de me gusta */}
                  <div className="mt-3 flex justify-start">
                    <LikeButton
                      claimId={claim.id}
                      initialLikes={claim.likesCount || 0}
                      initiallyLiked={claim.likedByUser || false}
                    />
                  </div>
                </div>
              ))}
            </div>

            {page + 1 < totalPages && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={loadMore}
                  disabled={pageLoading}
                  className="bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 px-5 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                >
                  {pageLoading ? "Cargando…" : "Cargar más"}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Quick View */}
      <RouteModal open={!!showModal} onClose={closeQuickView} title="Detalle del reclamo">
        <QuickViewClaim id={modalId} />
      </RouteModal>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-sm text-gray-500 border-t border-blue-100">
        <p>🏙️ CityFix © 2025 — Conectando ciudadanos con soluciones urbanas.</p>
      </footer>
    </PageTransition>
  );
}
