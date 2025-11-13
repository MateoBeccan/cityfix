import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import FormInput from './FormInput';
import logo from './assets/logo_cityfix.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  // 🔹 Validación de formato de email
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- Validaciones locales antes del envío ---
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (password.trim().length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        // --- Validaciones basadas en mensajes del backend ---
        if (result.error?.toLowerCase().includes('bad credentials')) {
          setError('Contraseña incorrecta. Verifica tus datos.');
        } else if (result.error?.toLowerCase().includes('user not found')) {
          setError('Usuario no encontrado. Regístrate para crear una cuenta.');
        } else if (result.error?.toLowerCase().includes('disabled')) {
          setError('Tu cuenta está desactivada. Contacta al soporte.');
        } else {
          setError(result.error || 'Error al iniciar sesión. Intenta nuevamente.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor. Verifica tu red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Encabezado */}
          <div className="text-center p-8 border-b border-gray-100">
            <div className="flex justify-center mb-4">
              <img
                src={logo}
                alt="CityFix logo"
                className="w-16 h-16 rounded-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CityFix</h1>
            <p className="text-gray-600 mt-2">Sistema de Gestión de Reclamos Urbanos</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <FormInput
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@correo.com"
            />

            <FormInput
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Iniciar Sesión
            </Button>
          </form>

          {/* Pie del formulario */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔒 Conexión segura | 🏢 Portal oficial | 📞 Soporte 24/7</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
