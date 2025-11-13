import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "./axios";
import Button from "./Button";

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalClaims: 0,
    totalUsers: 0,
    pendingClaims: 0,
    resolvedClaims: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [claimsResponse, usersResponse] = await Promise.all([
        api.get("/api/claims"),
        api.get("/api/users"),
      ]);

      const claims = claimsResponse.data;
      const users = usersResponse.data;

      setStats({
        totalClaims: claims.length,
        totalUsers: users.length,
        pendingClaims: claims.filter(
          (c) => c.estado?.nombre === "Pendiente"
        ).length,
        resolvedClaims: claims.filter(
          (c) => c.estado?.nombre === "Resuelto"
        ).length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      title: "Gestión de Reclamos",
      description: "Ver y administrar todos los reclamos del sistema",
      icon: "📋",
      href: "/admin/claims",
      color: "from-blue-50 to-blue-100",
    },
    {
      title: "Gestión de Usuarios",
      description: "Administrar usuarios y roles del sistema",
      icon: "👥",
      href: "/admin/users",
      color: "from-green-50 to-green-100",
    },
    {
      title: "Categorías",
      description: "Configurar categorías de reclamos",
      icon: "🏷️",
      href: "/admin/categories",
      color: "from-purple-50 to-purple-100",
    },
    {
      title: "Estados",
      description: "Gestionar estados de los reclamos",
      icon: "⚡",
      href: "/admin/statuses",
      color: "from-orange-50 to-orange-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-10 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen p-6 rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🏙️ Encabezado */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl shadow-lg p-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🛠️
          </motion.span>
          <h1 className="text-3xl font-bold text-blue-700 tracking-tight">
            Panel Administrador
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          Control total del sistema <span className="font-semibold">CityFix</span>
        </p>
      </motion.div>

      {/* 📈 Métricas principales */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          {
            icon: "📊",
            label: "Total Reclamos",
            value: stats.totalClaims,
            color: "bg-blue-100 text-blue-700",
          },
          {
            icon: "👥",
            label: "Total Usuarios",
            value: stats.totalUsers,
            color: "bg-green-100 text-green-700",
          },
          {
            icon: "⏳",
            label: "Pendientes",
            value: stats.pendingClaims,
            color: "bg-yellow-100 text-yellow-700",
          },
          {
            icon: "✅",
            label: "Resueltos",
            value: stats.resolvedClaims,
            color: "bg-emerald-100 text-emerald-700",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all p-6 flex items-center justify-between`}
            whileHover={{ scale: 1.03 }}
          >
            <div
              className={`p-3 rounded-lg text-3xl ${stat.color} shadow-sm`}
            >
              {stat.icon}
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ⚙️ Acciones de Administración */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {adminCards.map((card, i) => (
          <motion.div
            key={i}
            className={`bg-gradient-to-br ${card.color} border border-gray-200 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-8`}
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{card.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 mb-4">{card.description}</p>
                <Link to={card.href}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all"
                  >
                    Acceder
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default DashboardAdmin;
