import { useState } from "react";
import api from "./axios";
import Button from "./Button";
import { useAuth } from "./AuthContext";

const ClaimCard = ({ claim }) => {
  const { token } = useAuth();

  // Estados locales
  const [likes, setLikes] = useState(claim.likes || 0);
  const [liked, setLiked] = useState(claim.likedByUser || false);

  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(claim.comentarios || 0);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // --------------------------------------------
  // ❤️ LIKE (con animación suave y estable)
  // --------------------------------------------
  const handleLike = async () => {
    if (!token) return alert("Inicia sesión para dar like.");

    try {
      await api.post(`/api/claims/${claim.id}/like`);
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
    } catch (e) {
      console.error("Error al dar like:", e);
    }
  };

  // --------------------------------------------
  // 💬 Cargar comentarios
  // --------------------------------------------
  const fetchComments = async () => {
    if (loadingComments) return;

    setLoadingComments(true);

    try {
      const res = await api.get(`/api/claims/${claim.id}/comments`);
      setComments(res.data);
      setCommentCount(res.data.length);
      setShowComments(true);
    } catch (e) {
      console.error("Error cargando comentarios:", e);
    } finally {
      setLoadingComments(false);
    }
  };

  // --------------------------------------------
  // ✏️ Enviar comentario
  // --------------------------------------------
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

  // --------------------------------------------
  // Datos visuales
  // --------------------------------------------
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

  const avatarLetra = usuarioNombre?.[0]?.toUpperCase() || "?";

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 sm:p-5 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg shadow-sm">
            {avatarLetra}
          </div>

          <div className="max-w-[65%] sm:max-w-none">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight">
              {claim.titulo}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              👤 {usuarioNombre} ·{" "}
              {claim.fechaCreacion
                ? new Date(claim.fechaCreacion).toLocaleDateString()
                : "Sin fecha"}
            </p>
          </div>
        </div>

        <span
          className={`px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full shadow-sm whitespace-nowrap
            ${
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

      {/* DESCRIPCIÓN */}
      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
        {claim.descripcion}
      </p>

      {/* IMAGEN */}
      {claim.imagenUrl && (
        <img
          src={claim.imagenUrl}
          alt="Imagen del reclamo"
          className="w-full h-44 sm:h-52 object-cover rounded-lg mb-3 shadow-sm"
        />
      )}

      {/* UBICACIÓN + CATEGORÍA */}
      <div className="flex justify-between text-xs sm:text-sm text-gray-600 border-t pt-2 sm:pt-3">
        <span className="truncate">📍 {claim.ubicacion || "Sin ubicación"}</span>
        <span className="truncate text-right">🏷️ {categoriaNombre}</span>
      </div>

      {/* ACCIONES */}
      <div className="flex items-center gap-6 mt-3 sm:mt-4 border-t pt-2 sm:pt-3">

        {/* ❤️ LIKE */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm font-semibold transition-all duration-150
            ${
              liked
                ? "text-red-500 scale-110"
                : "text-gray-600 hover:text-red-500 hover:scale-105"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={liked ? "red" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke={liked ? "red" : "currentColor"}
            className="w-5 h-5 sm:w-6 sm:h-6 transition-all"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.948 0-3.622
              1.263-4.312 3.044C11.31 5.013 9.636 3.75 7.688 3.75
              5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78
              9-12z"
            />
          </svg>
          {likes}
        </button>

        {/* 💬 COMENTARIOS */}
        <button
          onClick={fetchComments}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 hover:scale-105 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.7}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75c0 1.59 1.41 3
              3 3H6v4.5l4.5-4.5h7.5c1.59
              0 3-1.41 3-3v-6c0-1.59-1.41-3-3-3h-12c-1.59
              0-3 1.41-3 3v6z"
            />
          </svg>
          {commentCount}
        </button>
      </div>

      {/* LISTA DE COMENTARIOS */}
      {showComments && (
        <div className="mt-3 sm:mt-4 border-t pt-3 space-y-2 animate-fadeIn">
          {loadingComments ? (
            <p className="text-gray-500 text-sm">Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm">Sé el primero en comentar.</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="bg-gray-50 rounded-md p-2 sm:p-3 shadow-sm animate-slideUp"
              >
                <p className="text-sm text-gray-800">
                  <strong>{c.usuarioNombre || "Anónimo"}:</strong> {c.texto}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(c.fechaCreacion).toLocaleString()}
                </p>
              </div>
            ))
          )}

          {/* FORMULARIO COMENTAR */}
          {token && (
            <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="sm" type="submit">
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
