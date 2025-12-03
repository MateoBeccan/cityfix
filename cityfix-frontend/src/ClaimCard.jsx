import { useState } from "react";
import api from "./axios";
import Button from "./Button";
import { useAuth } from "./AuthContext";
import Toast from "./components/Toast";
import { Heart, MessageCircle, MapPin, Calendar, User, MoreHorizontal, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ClaimCard = ({ claim }) => {
  const { token, user } = useAuth();

  // Estados
  const [likes, setLikes] = useState(claim.likes || 0);
  const [liked, setLiked] = useState(claim.likedByUser || false);

  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(claim.comentarios || 0);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error");

  const showToast = (msg, type = "error") => {
    setToastMessage(msg);
    setToastType(type);
  };

  // ❤️ LIKE
  const handleLike = async () => {
    if (!token) return showToast("Inicia sesión para dar like", "warning");

    try {
      await api.post(`/api/claims/${claim.id}/like`);
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
    } catch {
      showToast("Error al dar like");
    }
  };

  // 💬 Cargar comentarios
  const fetchComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);

    try {
      const res = await api.get(`/api/claims/${claim.id}/comments`);
      setComments(res.data);
      setCommentCount(res.data.length);
      setShowComments(true);
    } catch {
      showToast("No se pudieron cargar los comentarios");
    } finally {
      setLoadingComments(false);
    }
  };

  // ✏ Enviar comentario
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!token) return showToast("Debes iniciar sesión", "warning");
    if (!newComment.trim()) return showToast("El comentario está vacío", "warning");

    try {
      await api.post(`/api/claims/${claim.id}/comments`, { texto: newComment });
      setNewComment("");
      fetchComments();
      showToast("Comentario publicado", "success");
    } catch {
      showToast("Error al enviar comentario");
    }
  };

  // ✏ Guardar edición
  const saveEditedComment = async () => {
    if (!editingText.trim()) return showToast("No puede estar vacío");

    try {
      await api.put(`/api/comments/${editingCommentId}`, { texto: editingText });
      setEditingCommentId(null);
      setEditingText("");
      fetchComments();
      showToast("Comentario editado", "success");
    } catch {
      showToast("Error al editar comentario");
    }
  };

  // 🗑 Eliminar comentario
  const deleteComment = async () => {
    try {
      await api.delete(`/api/comments/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      fetchComments();
      showToast("Comentario eliminado", "success");
    } catch {
      showToast("No se pudo eliminar el comentario");
    }
  };

  // Datos seguros
  const estado = claim.estado?.nombre || claim.estado || "Sin estado";
  const categoria = claim.categoria?.nombre || claim.categoria || "Sin categoría";
  const usuario = claim.usuario?.nombre || claim.usuarioNombre || "Anónimo";
  const avatar = usuario[0]?.toUpperCase();

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* HEADER */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* AVATAR */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-lg">
                {avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            {/* USER INFO */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition">
                  {usuario}
                </h4>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  estado === 'Resuelto' ? 'bg-green-100 text-green-700' :
                  estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-700' :
                  estado === 'Rechazado' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {estado}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(claim.fechaCreacion).toLocaleDateString('es-ES', { 
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                })}</span>
                <span>•</span>
                <span className="text-blue-600 font-medium">{categoria}</span>
              </div>
            </div>
          </div>

          {/* MORE OPTIONS */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 pb-3">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 leading-tight">
          {claim.titulo}
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {claim.descripcion}
        </p>
        
        {/* LOCATION */}
        {claim.ubicacion && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="w-3 h-3" />
            <span>{claim.ubicacion}</span>
          </div>
        )}
      </div>

      {/* IMAGE */}
      {claim.imagenUrl && (
        <div className="relative">
          <img
            src={claim.imagenUrl}
            alt={claim.titulo}
            className="w-full h-64 object-cover cursor-pointer hover:opacity-95 transition"
            onClick={() => window.open(claim.imagenUrl, '_blank')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
      )}

      {/* ACTIONS BAR */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* LIKE BUTTON */}
            <motion.button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                liked 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likes}</span>
            </motion.button>

            {/* COMMENT BUTTON */}
            <motion.button
              onClick={fetchComments}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{commentCount}</span>
            </motion.button>
          </div>

          {/* ENGAGEMENT STATS */}
          <div className="text-xs text-gray-500">
            {likes > 0 && commentCount > 0 && (
              <span>{likes + commentCount} interacciones</span>
            )}
          </div>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            className="border-t border-gray-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* COMMENTS LIST */}
            <div className="px-4 py-3 max-h-96 overflow-y-auto">
              {loadingComments ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Cargando comentarios...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6">
                  <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sé el primero en comentar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <motion.div
                      key={c.id}
                      className="flex gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {/* COMMENT AVATAR */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {c.usuarioNombre?.[0]?.toUpperCase()}
                      </div>

                      {/* COMMENT CONTENT */}
                      <div className="flex-1 min-w-0">
                        {editingCommentId === c.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={saveEditedComment}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingText("");
                                }}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 transition"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900">{c.usuarioNombre}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(c.fechaCreacion).toLocaleDateString('es-ES', {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{c.texto}</p>
                            
                            {(user?.id === c.usuarioId || user?.role === "ADMIN") && (
                              <div className="flex gap-3 mt-2">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(c.id);
                                    setEditingText(c.texto);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(c.id)}
                                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* ADD COMMENT */}
            {token && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <form onSubmit={handleCommentSubmit} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user?.nombre?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <motion.button
                      type="submit"
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50"
                      disabled={!newComment.trim()}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Eliminar comentario
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Esta acción no se puede deshacer. ¿Estás seguro?
              </p>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  onClick={deleteComment}
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage("")}
        />
      )}
    </motion.div>
  );
};

export default ClaimCard;
