import { useEffect, useState } from "react";
import api from "./axios";
import { useAuth } from "./AuthContext";
import Button from "./Button";
import { X } from "lucide-react"; // ✅ icono bonito para cerrar

const ClaimHistory = ({ claimId, onClose }) => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Evitar scroll del fondo al abrir modal
    document.body.style.overflow = "hidden";
    fetchHistory();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [claimId]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/api/claims/${claimId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (error) {
      console.error("Error al obtener historial:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full mb-3"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      {/* Evitamos cerrar si clickea dentro del modal */}
      <div
        className="relative bg-gradient-to-br from-white via-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-2xl w-[90%] p-6 border border-blue-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cierre flotante */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-blue-600 transition"
          title="Cerrar"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          🕓 Historial del Reclamo #{claimId}
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            No hay cambios registrados aún.
          </p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
            {history.map((item, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-600 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-700">
                    {item.status?.nombre}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.changedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Por:</span>{" "}
                  {item.changedBy?.nombre || "Desconocido"}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    📝 {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botón cerrar en el pie */}
        <div className="mt-6 text-right">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
          >
            Cerrar historial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClaimHistory;
