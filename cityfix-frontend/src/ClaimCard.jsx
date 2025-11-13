import { useState } from "react";
import api from "./axios";
import Button from "./Button";
import { useAuth } from "./AuthContext";

const ClaimCard = ({ claim }) => {
  const { token } = useAuth();
  const [likes, setLikes] = useState(claim.likes || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(claim.comentarios || 0);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    if (!token) return alert("Inicia sesión para dar like.");
    try {
      await api.post(`/api/claims/${claim.id}/like`);
      setLiked(!liked);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
    } catch (e) {
      console.error("Error al dar like:", e);
    }
  };

  const fetchComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await api.get(`/api/claims/${claim.id}/comments`);
      setComments(res.data);
      setShowComments(true);
      setCommentCount(res.data.length);
    } catch (e) {
      console.error("Error cargando comentarios:", e);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Inicia sesión para comentar.");
    if (!newComment.trim()) return;
    try {
      await api.post(`/api/claims/${claim.id}/comments`, { text: newComment });
      setNewComment("");
      fetchComments();
    } catch (e) {
      console.error("Error al comentar:", e);
    }
  };

  const estadoNombre =
    typeof claim.estado === "object"
      ? claim.estado?.nombre
      : claim.estado || "Sin estado";

  const categoriaNombre =
    typeof claim.categoria === "object"
      ? claim.categoria?.nombre
      : claim.categoria || "Sin categoría";

  const usuarioNombre =
    claim.usuario?.nombre || claim.usuarioNombre || "Anónimo";

  const avatarLetra = usuarioNombre[0]?.toUpperCase() || "?";

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
            {avatarLetra}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{claim.titulo}</h3>
            <p className="text-sm text-gray-600">
              👤 {usuarioNombre} · 📅{" "}
              {claim.fechaCreacion
                ? new Date(claim.fechaCreacion).toLocaleDateString()
                : "Sin fecha"}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            estadoNombre === "Resuelto"
              ? "bg-green-100 text-green-800"
              : estadoNombre === "Pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : estadoNombre === "En Proceso"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {estadoNombre}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-3">{claim.descripcion}</p>

      {claim.imagenUrl && (
        <img
          src={claim.imagenUrl}
          alt="Imagen del reclamo"
          className="w-full h-52 object-cover rounded-lg mb-3"
        />
      )}

      <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
        <span>📍 {claim.ubicacion || "Sin ubicación"}</span>
        <span>🏷️ {categoriaNombre}</span>
      </div>

      <div className="flex items-center gap-6 mt-4 border-t pt-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm transition transform ${
            liked ? "text-red-500 scale-110" : "text-gray-600 hover:text-red-500"
          }`}
        >
          ❤️ {likes}
        </button>
        <button
          onClick={fetchComments}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition"
        >
          💬 {commentCount} comentarios
        </button>
      </div>

      {showComments && (
        <div className="mt-3 border-t pt-3 space-y-2">
          {loadingComments ? (
            <p className="text-gray-500 text-sm">Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm">Sé el primero en comentar.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-md p-2">
                <p className="text-sm text-gray-800">
                  <strong>{c.usuarioNombre || "Anónimo"}:</strong> {c.texto}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(c.fechaCreacion).toLocaleString()}
                </p>
              </div>
            ))
          )}

          {token && (
            <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="sm" variant="primary" type="submit">
                Enviar
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ClaimCard;
