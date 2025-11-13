import { motion } from "framer-motion";
import LikeButton from "./components/LikeButton";

const ClaimCard = ({ claim, showActions = true }) => {
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
    <motion.div
      className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-default"
      whileHover={{ scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
            {avatarLetra}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {claim.titulo}
            </h3>
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

      {/* Descripción */}
      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
        {claim.descripcion}
      </p>

      {/* Imagen */}
      {claim.imagenUrl && (
        <img
          src={claim.imagenUrl}
          alt="Imagen del reclamo"
          className="w-full h-52 object-cover rounded-lg mb-3"
        />
      )}

      {/* Info secundaria */}
      <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
        <span>📍 {claim.ubicacion || "Sin ubicación"}</span>
        <span>🏷️ {categoriaNombre}</span>
      </div>

      {/* Acciones */}
      {showActions && (
        <div className="flex items-center justify-between mt-4 border-t pt-3">
          {/* ❤️ Like sincronizado */}
          <LikeButton
            claimId={claim.id}
            initialLikes={claim.likesCount || claim.likes || 0}
            initiallyLiked={claim.likedByUser || false}
          />

          {/* 💬 Comentarios */}
          <div className="text-gray-600 text-sm flex items-center gap-1">
            💬 {claim.comentarios || 0}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ClaimCard;
