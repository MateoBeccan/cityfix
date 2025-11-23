import { createContext, useContext, useState, useEffect } from "react";
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

  // 🔹 Actualizar datos del usuario (editar perfil)
  const updateUserData = (newData) => {
    setUser(newData);
    localStorage.setItem("user", JSON.stringify(newData));
  };

  // 🔹 Restaurar sesión desde token
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        const role =
          decoded.role?.replace("ROLE_", "") ||
          decoded.authorities?.[0]?.replace("ROLE_", "") ||
          "CIUDADANO";

        const email = decoded.email || decoded.sub;

        const restoredUser = {
          id: decoded.id || decoded.userId || null,
          email,
          nombre: email.split("@")[0],
          role,
        };

        setUser(restoredUser);
        localStorage.setItem("user", JSON.stringify(restoredUser));

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      } catch (error) {
        console.warn("Error decoding token:", error);
        logout();
      }
    }

    setLoading(false);
  }, [token]);

  // 🔹 LOGIN actualizado
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const newToken = res.data.token;

      // Guardar token
      setToken(newToken);
      localStorage.setItem("token", newToken);

      const decoded = jwtDecode(newToken);

      const role =
        decoded.role?.replace("ROLE_", "") ||
        decoded.authorities?.[0]?.replace("ROLE_", "") ||
        "CIUDADANO";

      const userEmail = decoded.email || decoded.sub;

      const newUser = {
        id: decoded.id || decoded.userId || null,
        email: userEmail,
        nombre: userEmail.split("@")[0],
        role,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return { success: true };

    } catch (error) {

      // 🔥 ERROR 401 → credenciales incorrectas, usuario no existe, desactivado, etc.
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

      // 🔥 Error genérico de backend
      if (error.response?.data?.error) {
        return {
          success: false,
          error: error.response.data.error,
        };
      }

      // 🔥 Error de red
      return {
        success: false,
        error: "network_error",
      };
    }
  };

  // 🔹 LOGOUT
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
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
