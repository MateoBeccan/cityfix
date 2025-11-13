import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthContext";
import { ToastProvider } from "./ToastProvider";
import Layout from "./Layout";

// Páginas
import LandingPage from "./pages/LandingPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import Feed from "./pages/Feed";
import DashboardCitizen from "./DashboardCitizen";
import DashboardOperator from "./DashboardOperator";
import DashboardAdmin from "./DashboardAdmin";
import AdminUsers from "./AdminUsers";
import AdminCategories from "./AdminCategories";
import AdminStatuses from "./AdminStatuses";
import Claims from "./Claims";
import NewClaim from "./NewClaim";
import PageTransition from "./PageTransition";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">Cargando CityFix...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  // 🔹 Retorna dashboard según rol
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
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname + location.search}>
          {/* 🔓 Rutas públicas */}
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            }
          />

          {/* 🌇 Layout general */}
          <Route element={<Layout />}>
            {/* Feed público con modal */}
            <Route
              path="/feed"
              element={
                <PageTransition>
                  <Feed />
                </PageTransition>
              }
            />
            <Route
              path="/feed/:id"
              element={
                <PageTransition>
                  <Feed />
                </PageTransition>
              }
            />

            {/* 🔐 Rutas protegidas */}
            {user ? (
              <>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route
                  path="/dashboard"
                  element={
                    <PageTransition>{getDashboardComponent()}</PageTransition>
                  }
                />

                {/* Reclamos */}
                <Route
                  path="/claims"
                  element={
                    <PageTransition>
                      <Claims />
                    </PageTransition>
                  }
                />
                <Route
                  path="/claims/new"
                  element={
                    <PageTransition>
                      <NewClaim />
                    </PageTransition>
                  }
                />

                {/* Administración */}
                <Route
                  path="/admin/claims"
                  element={
                    <PageTransition>
                      <DashboardOperator />
                    </PageTransition>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <PageTransition>
                      <AdminUsers />
                    </PageTransition>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <PageTransition>
                      <AdminCategories />
                    </PageTransition>
                  }
                />
                <Route
                  path="/admin/statuses"
                  element={
                    <PageTransition>
                      <AdminStatuses />
                    </PageTransition>
                  }
                />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Route>
        </Routes>
      </AnimatePresence>
    </ToastProvider>
  );
}

export default App;
