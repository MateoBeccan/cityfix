import { useState } from "react";
import { motion } from "framer-motion";
import api from "../axios";
import { useAuth } from "../AuthContext";

export default function LikeButton({ claimId, initialLikes = 0, initiallyLiked = false }) {
  const { token } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initiallyLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async (e) => {
    e?.stopPropagation?.();
    if (!token) return alert("Inicia sesión para dar me gusta.");
    if (loading) return;

    setLoading(true);
    try {
      const res = await api.post(`/api/claims/${claimId}/like`);
      setLikes(res.data.likesCount);
      setLiked(res.data.likedByUser);
    } catch (err) {
      console.error("Error al dar me gusta:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 text-sm font-medium transition-all ${
        liked ? "text-red-500" : "text-gray-600 hover:text-red-500"
      }`}
    >
      <motion.span
        animate={{ scale: liked ? 1.3 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {liked ? "❤️" : "🤍"}
      </motion.span>
      <span>Me gusta</span>
      <span className="text-gray-500">({likes})</span>
    </motion.button>
  );
}
