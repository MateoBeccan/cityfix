import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function RouteModal({ open, onClose, children, title = "" }) {
  const nav = useNavigate();
  const close = () => (onClose ? onClose() : nav(-1));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Fondo glassy */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Contenedor principal */}
          <motion.div
            className="
              relative w-full max-w-3xl
              bg-white/90 backdrop-blur-lg
              rounded-2xl shadow-2xl border border-blue-100
              flex flex-col
              max-h-[90vh]
            "
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header fijo */}
            <div className="flex items-start justify-between p-5 border-b border-gray-200 bg-white/90 backdrop-blur-md rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-800 truncate">
                {title}
              </h3>
              <button
                onClick={close}
                className="rounded-lg p-2 hover:bg-blue-50 active:bg-blue-100 focus:ring-2 focus:ring-blue-400 transition"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Contenido scrollable estilizado */}
            <div
              className="
                flex-1 overflow-y-auto
                p-5 sm:p-6
                scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent
              "
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
