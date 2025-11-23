import { useEffect, useState } from "react";
import api from "../axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Info, CheckCircle, MessageCircle, Trash2, Eye } from "lucide-react";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);

  const loadNotifications = async () => {
    const res = await api.get("/api/notifications");
    setNotifications(res.data);
  };

 useEffect(() => {
   const loadNotifications = async () => {
     try {
       const res = await api.get("/api/notifications");
       setNotifications(res.data);

       // Marcar todas como leídas
       await api.post("/api/notifications/mark-all-read");
     } catch (err) {
       console.error("Error al cargar notificaciones:", err);
     }
   };

   loadNotifications();
 }, []);


  const clearAll = async () => {
    await api.post("/api/notifications/clear");
    loadNotifications();
  };

  const markAllRead = async () => {
    await api.post("/api/notifications/mark-all-read");
    loadNotifications();
  };

  const icons = {
    estado: <CheckCircle className="text-blue-600" />,
    comentario: <MessageCircle className="text-green-600" />,
    sistema: <Info className="text-gray-600" />,
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
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-white p-5 rounded-xl shadow border border-gray-200 hover:shadow-md transition cursor-pointer"
            onClick={() => setSelected(n)}
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
              {icons[n.tipo]}
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-900">{n.titulo}</p>
              <p className="text-sm text-gray-700">{n.mensaje}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(n.fecha).toLocaleString("es-AR")}
              </p>
            </div>

            {!n.leido && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
          </motion.div>
        ))}
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
