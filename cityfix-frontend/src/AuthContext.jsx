import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // 🔹 Guardar usuario actualizado
  const updateUserData = (newData) => {
    setUser(newData);
    localStorage.setItem("user", JSON.stringify(newData));
  };

  // ============================================================
  // 🔥 RESTAURAR SESIÓN DESDE JWT COMPLETO
  // ============================================================
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Los datos ya vienen directamente del backend
        const newUser = {
          id: decoded.id,
          email: decoded.email || decoded.sub,
          nombre: decoded.nombre || decoded.email?.split("@")[0],
          role: decoded.role?.replace("ROLE_", "") ?? "CIUDADANO",
        };

        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.warn("Error decoding token:", error);
        logout();
      }
    }

    setLoading(false);
  }, [token]);

  // ============================================================
  // 🔹 LOGIN
  // ============================================================
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const newToken = res.data.token;

      setToken(newToken);
      localStorage.setItem("token", newToken);

      const decoded = jwtDecode(newToken);

      const newUser = {
        id: decoded.id,
        email: decoded.email || decoded.sub,
        nombre: decoded.nombre || decoded.email?.split("@")[0],
        role: decoded.role?.replace("ROLE_", "") ?? "CIUDADANO",
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        const backendError = error.response.data?.error?.toLowerCase() || "";

        if (backendError.includes("bad credentials"))
          return { success: false, error: "invalid_credentials" };

        if (backendError.includes("user not found"))
          return { success: false, error: "user_not_found" };

        if (backendError.includes("user disabled"))
          return { success: false, error: "user_disabled" };

        return { success: false, error: "invalid_credentials" };
      }

      return { success: false, error: "network_error" };
    }
  };

  // ============================================================
  // 🔹 LOGOUT
  // ============================================================
  const logout = (redirectTo = "/") => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    
    // Redirigir después de limpiar el estado
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 100);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUserData,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
