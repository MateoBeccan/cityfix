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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // 🔹 Al iniciar o recargar, decodificamos el token
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded.role?.replace("ROLE_", "") || "CIUDADANO";
        const email = decoded.email || decoded.sub;
        setUser({
          email,
          nombre: email.split("@")[0],
          role, // Ejemplo: "OPERADOR" o "ADMIN"
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  // 🔹 Login y guardado de token
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token: newToken } = res.data;
      setToken(newToken);
      localStorage.setItem("token", newToken);

      const decoded = jwtDecode(newToken);
      const role = decoded.role?.replace("ROLE_", "") || "CIUDADANO";
      const userEmail = decoded.email || decoded.sub;

      setUser({
        email: userEmail,
        nombre: userEmail.split("@")[0],
        role,
      });

      return { success: true };
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return { success: false, error: "Error al iniciar sesión" };
    }
  };

  // 🔹 Logout global
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
