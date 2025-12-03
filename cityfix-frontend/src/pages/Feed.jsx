import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../axios";
import { useAuth } from "../AuthContext";
import Button from "../Button";
import ClaimCard from "../ClaimCard";
import FeedSkeleton from "../components/FeedSkeleton";
import QuickFilters from "../components/QuickFilters";
import FloatingActionButton from "../components/FloatingActionButton";
import { motion, AnimatePresence } from "framer-motion";

const Feed = () => {
  const { user } = useAuth();

  const [claims, setClaims] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    estado: "",
    categoria: "",
    orden: "recientes",
  });

  const [categories, setCategories] = useState([]);

  const loaderRef = useRef(null);

  // =====================================================
  // FETCH DEL FEED
  // =====================================================
  const fetchClaims = useCallback(async () => {
    try {
      const res = await api.get("/api/claims/feed", {
        params: {
          page,
          estado: filters.estado,
          categoria: filters.categoria,
          orden: filters.orden,
        },
      });

      const newClaims = res.data?.content || [];

      setClaims((prev) => (page === 0 ? newClaims : [...prev, ...newClaims]));
      setHasMore(!res.data?.last);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando reclamos:", error);
      setLoading(false);
    }
  }, [page, filters]);

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };
  


  // Primera carga
  useEffect(() => {
    fetchClaims();
    fetchCategories();
  }, [fetchClaims]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setPage(0);
  }, [filters]);

  // Scroll infinito
  useEffect(() => {
    if (!hasMore) return;

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPage((curr) => curr + 1);
    });

    if (loaderRef.current) obs.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) obs.unobserve(loaderRef.current);
    };
  }, [hasMore]);

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HERO SECTION */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Feed de Reclamos
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre y participa en los problemas urbanos reportados por la comunidad
            </p>
          </motion.div>
        </div>
      </div>

      {/* QUICK FILTERS */}
      <QuickFilters
        filters={filters}
        setFilters={setFilters}
        categories={categories}
      />

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* LOADING STATE */}
        {loading && page === 0 && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && claims.length === 0 && (
          <motion.div
            className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay reclamos que mostrar
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Sé el primero en reportar un problema en tu comunidad y ayuda a mejorar tu ciudad.
            </p>
            <Link to={user ? "/claims/new" : "/login"}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                {user ? "📝 Crear Reclamo" : "🔑 Iniciar Sesión"}
              </Button>
            </Link>
          </motion.div>
        )}

        {/* CLAIMS FEED */}
        <div className="space-y-6">
          <AnimatePresence>
            {claims.map((claim, i) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.1 }}
              >
                <ClaimCard claim={claim} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* INFINITE SCROLL LOADER */}
        <div ref={loaderRef} className="py-8 flex items-center justify-center">
          {hasMore && !loading && (
            <motion.div 
              className="flex items-center gap-3 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
              <span className="text-sm font-medium">Cargando más reclamos...</span>
            </motion.div>
          )}
          {!hasMore && claims.length > 0 && (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Has visto todos los reclamos</p>
              <p className="text-sm text-gray-500 mt-1">Vuelve más tarde para ver nuevos reportes</p>
            </motion.div>
          )}
        </div>
      </main>
      
      {/* FLOATING ACTION BUTTON */}
      <FloatingActionButton />
    </div>
  );
};

export default Feed;
