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

  // 🔹 Sincroniza el usuario luego de editar perfil
  const updateUserData = (newData) => {
    setUser(newData);
    localStorage.setItem("user", JSON.stringify(newData));
  };

  // 🔹 Decodificar token y restaurar sesión
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
          id: decoded.id || decoded.userId || null, // si tu token lo incluye
          email,
          nombre: email.split("@")[0],
          role,
        };

        setUser(restoredUser);
        localStorage.setItem("user", JSON.stringify(restoredUser));

        // Setear token en axios
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  // 🔹 Iniciar sesión
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const newToken = res.data.token;

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
      console.error("Error al iniciar sesión:", error);
      return {
        success: false,
        error: "Credenciales incorrectas o servidor no disponible",
      };
    }
  };

  // 🔹 Cerrar sesión
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
        updateUserData, // 🔥 IMPORTANTE PARA EDITAR PERFIL
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
