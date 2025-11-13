import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ToastProvider } from "./ToastProvider";
import Layout from "./Layout";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

import DashboardCitizen from "./DashboardCitizen";
import DashboardOperator from "./DashboardOperator";
import DashboardAdmin from "./DashboardAdmin";

import AdminUsers from "./AdminUsers";
import AdminCategories from "./AdminCategories";
import AdminStatuses from "./AdminStatuses";
import AdminClaims from "./AdminClaims";

import Claims from "./Claims";
import NewClaim from "./NewClaim";
import Feed from "./pages/Feed";

import ProfileEdit from "./ProfileEdit";

function App() {
  const { user, loading } = useAuth();

  // ⏳ Mientras se valida la sesión
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Selecciona dashboard según rol
  const getDashboardComponent = () => {
    switch (user?.role) {
      case "OPERADOR":
        return <DashboardOperator />;
      case "ADMIN":
        return <DashboardAdmin />;
      default:
        return <DashboardCitizen />;
    }
  };

  return (
    <ToastProvider>
      <Routes>
        {/* 🌐 PÚBLICAS */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🌇 Rutas con Layout (navbar + contenido) */}
        <Route element={<Layout />}>
          {/* Feed público */}
          <Route path="/feed" element={<Feed />} />

          {/* 🔒 Rutas privadas */}
          {user ? (
            <>
              {/* Dashboard principal */}
              <Route path="/dashboard" element={getDashboardComponent()} />

              {/* Perfil */}
              <Route path="/profile" element={<ProfileEdit />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />


              {/* Reclamos */}
              <Route path="/claims" element={<Claims />} />
              <Route path="/claims/new" element={<NewClaim />} />

              {/* Panel de administración */}
              <Route path="/admin/claims" element={<AdminClaims />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/statuses" element={<AdminStatuses />} />

              {/* Si está logueado e intenta ir a "/" → dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </>
          ) : (
            // 🔒 Si no está logueado → redirigir a login
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
