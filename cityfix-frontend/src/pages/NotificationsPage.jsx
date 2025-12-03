import { useEffect, useState } from "react";
import api from "../axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Info,
  CheckCircle,
  MessageCircle,
  Trash2,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 🔹 Cargar notificaciones paginadas
  const loadNotifications = async (pageNum = 0) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/notifications/paged?page=${pageNum}&size=10`);
      
      if (pageNum === 0) {
        setNotifications(res.data.content);
      } else {
        setNotifications(prev => [...prev, ...res.data.content]);
      }
      
      setTotalPages(res.data.totalPages);
      setHasMore(!res.data.last);
      setPage(pageNum);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Al abrir una notificación → marcar como leída + abrir modal
  const openNotification = async (n) => {
    setSelected(n);
    try {
      await api.post(`/api/notifications/${n.id}/read`);
      loadNotifications();
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  // 🔹 Al cargar la página → cargar notificaciones
  useEffect(() => {
    loadNotifications(0);
  }, []);

  // 🔹 Limpiar todas las notificaciones
  const clearAll = async () => {
    try {
      await api.post("/api/notifications/clear");
      setNotifications([]);
      setPage(0);
      setHasMore(false);
    } catch (err) {
      console.error("Error al limpiar notificaciones:", err);
    }
  };

  // 🔹 Marcar todas como leídas
  const markAllRead = async () => {
    try {
      await api.post("/api/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
    } catch (err) {
      console.error("Error al marcar como leídas:", err);
    }
  };

  // 🔹 Íconos según tipo (Enum en backend)
  const icons = {
    ESTADO: <CheckCircle className="text-blue-600" />,
    COMENTARIO: <MessageCircle className="text-green-600" />,
    SISTEMA: <Heart className="text-red-500" />,
  };
  
  // Cargar más notificaciones
  const loadMore = () => {
    if (hasMore && !loading) {
      loadNotifications(page + 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Bell className="w-9 h-9 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Marcar todas como leídas
          </button>

          <button
            onClick={clearAll}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1"
          >
            <Trash2 size={18} /> Limpiar
          </button>
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {loading && notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay notificaciones</h3>
            <p className="text-gray-500">Cuando tengas nuevas notificaciones aparecerán aquí.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-4 bg-white p-5 rounded-xl shadow border transition cursor-pointer hover:shadow-md ${
                n.leido ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
              }`}
              onClick={() => openNotification(n)}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                {icons[n.tipo]}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900">{n.titulo}</p>
                <p className="text-sm text-gray-700 line-clamp-2">{n.mensaje}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {new Date(n.fecha).toLocaleString("es-AR")}
                  </p>
                  {n.reclamoTitulo && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {n.reclamoTitulo}
                    </span>
                  )}
                </div>
              </div>

              {!n.leido && (
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </motion.div>
          ))
        )}
        
        {/* Botón Cargar Más */}
        {hasMore && notifications.length > 0 && (
          <div className="text-center py-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>

      {/* MODAL DETALLE */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg w-[450px]"
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex gap-2 items-center">
                <Eye /> Detalle de Notificación
              </h2>

              <p className="text-lg font-semibold text-gray-800 mb-2">
                {selected.titulo}
              </p>

              <p className="text-gray-700">{selected.mensaje}</p>

              <p className="text-sm text-gray-500 mt-4">
                {new Date(selected.fecha).toLocaleString("es-AR")}
              </p>

              <button
                onClick={() => setSelected(null)}
                className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
