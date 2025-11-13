import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../axios";
import Button from "../Button";
import { useAuth } from "../AuthContext";
import LikeButton from "./LikeButton";

export default function QuickViewClaim({ id }) {
  const { token } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  // ✅ Cargar reclamo público
  const fetchClaim = async () => {
    try {
      const res = await api.get(`/api/claims/public/${id}`);
      setClaim(res.data);
    } catch (err) {
      console.error("Error al cargar reclamo:", err);
      setError("No se pudo cargar el reclamo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id]);

  // ✅ Cargar comentarios
  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/claims/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  // 💬 Enviar comentario
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Inicia sesión para comentar.");
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await api.post(`/api/claims/${id}/comments`, { text: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error al comentar:", err);
    } finally {
      setPosting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
        Cargando reclamo...
      </div>
    );

  if (error)
    return <p className="text-center text-red-600 font-medium">{error}</p>;

  if (!claim) return null;

  const estado =
    typeof claim.estado === "object" ? claim.estado?.nombre : claim.estado;
  const categoria =
    typeof claim.categoria === "object"
      ? claim.categoria?.nombre
      : claim.categoria;
  const usuario = claim.usuario?.nombre || "Anónimo";
  const fecha = claim.fechaCreacion
    ? new Date(claim.fechaCreacion).toLocaleDateString()
    : "Sin fecha";

  return (
    <motion.div
      className="relative flex flex-col gap-4 bg-white/90 backdrop-blur-lg rounded-2xl p-5 sm:p-6 shadow-lg border border-blue-100"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-3 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
            {usuario[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 break-words">
              {claim.titulo}
            </h3>
            <p className="text-sm text-gray-500">
              👤 {usuario} · 📅 {fecha}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full self-start sm:self-auto ${
            estado === "Resuelto"
              ? "bg-green-100 text-green-800"
              : estado === "Pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : estado === "En Proceso"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {estado}
        </span>
      </div>

      {/* IMAGEN */}
      {claim.imagenUrl ? (
        <img
          src={claim.imagenUrl}
          alt="Imagen del reclamo"
          className="w-full h-auto max-h-[300px] object-contain rounded-lg border border-gray-200"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
          Sin imagen disponible
        </div>
      )}

      {/* DESCRIPCIÓN */}
      <p className="text-gray-700 text-sm sm:text-base leading-relaxed break-words">
        {claim.descripcion}
      </p>

      {/* INFO ADICIONAL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        <div className="bg-blue-50 rounded-lg p-2 text-sm text-blue-700 border border-blue-100 text-center truncate">
          🏷️ {categoria || "Sin categoría"}
        </div>
        <div
          className={`rounded-lg p-2 text-sm text-center font-medium border truncate ${
            estado === "Resuelto"
              ? "bg-green-50 text-green-700 border-green-200"
              : estado === "En Proceso"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }`}
        >
          🔹 {estado || "Sin estado"}
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-sm text-gray-700 border border-gray-200 text-center truncate">
          📍 {claim.ubicacion || "Ubicación no especificada"}
        </div>
      </div>

      {/* ❤️ BOTÓN DE LIKE */}
      <div className="flex items-center gap-2 mt-3">
        <LikeButton
          claimId={id}
          initialLikes={claim.likesCount || 0}
          initiallyLiked={claim.likedByUser || false}
        />
      </div>

      {/* COMENTARIOS */}
      <div className="mt-4 border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">
          Comentarios ({comments.length})
        </h4>

        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Aún no hay comentarios. Sé el primero en opinar.
          </p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-sm"
              >
                <p className="text-gray-800 break-words">
                  <strong>{c.usuarioNombre || "Anónimo"}:</strong> {c.texto}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(c.fechaCreacion).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {token && (
          <form
            onSubmit={handleCommentSubmit}
            className="mt-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={posting}
              className="px-4 py-2 sm:py-0"
            >
              {posting ? "..." : "Enviar"}
            </Button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
