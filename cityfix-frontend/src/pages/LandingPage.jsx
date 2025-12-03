import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import Button from "../Button";
import heroImage from "../assets/logo_reclamo.png";
import logo from "../assets/logo_cityfix.png";

const LandingPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-white to-green-100">

      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* LOGO */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={logo}
              alt="CityFix"
              className="w-11 h-11 rounded-full shadow-lg border-2 border-blue-500"
            />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
              CityFix
            </h1>
          </motion.div>

          {/* BUTTONS */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {user ? (
              <>
                <span className="text-gray-700 font-semibold hidden sm:block">
                  Hola, {user.nombre}
                </span>

                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:scale-[1.03] transition">
                    Panel
                  </Button>
                </Link>

                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.03] transition"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:scale-[1.03] transition">
                    Iniciar Sesión
                  </Button>
                </Link>

                <Link to="/register">
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:scale-[1.03] transition">
                    Crear Cuenta
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </header>

      {/* ---------------- HERO ---------------- */}
      <main className="flex flex-col lg:flex-row items-center justify-between flex-grow max-w-7xl mx-auto px-6 py-20 gap-16">

        {/* LEFT TEXT */}
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl sm:text-6xl font-extrabold leading-tight text-gray-900 drop-shadow-sm mb-6">
            <span className="bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
              Una ciudad conectada
            </span>
            <br />
            empieza por tu voz.
          </h2>

          <p className="text-gray-700 text-lg leading-relaxed mb-10">
            Reportá fácilmente problemas urbanos como alumbrado, baches, limpieza
            y más. CityFix impulsa la participación ciudadana con tecnología moderna,
            transparente y accesible.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/feed">
              <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white px-7 py-3 rounded-xl shadow-lg hover:scale-[1.04] transition text-lg">
                Ver Reclamos Públicos
              </Button>
            </Link>

            {user ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-green-500 to-green-700 text-white px-7 py-3 rounded-xl shadow-lg hover:scale-[1.04] transition text-lg">
                  Ir al Panel
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button className="bg-gradient-to-r from-green-500 to-green-700 text-white px-7 py-3 rounded-xl shadow-lg hover:scale-[1.04] transition text-lg">
                  Reportar un Reclamo
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          className="flex justify-center lg:justify-end w-full"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div className="shadow-2xl rounded-3xl bg-white/60 p-6 backdrop-blur-xl border border-blue-200 hover:shadow-3xl transition">
            <img
              src={heroImage}
              alt="Ciudad"
              className="w-[350px] sm:w-[400px] lg:w-[480px] rounded-2xl drop-shadow-xl hover:scale-[1.05] transition duration-500"
            />
          </div>
        </motion.div>
      </main>

      {/* ---------------- FEATURES SECTION ---------------- */}
      <section className="w-full py-20 bg-gradient-to-r from-white to-blue-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-12">

          <FeatureCard
            title="🧭 Reportes Inteligentes"
            delay={0.1}
            description="Envía reclamos en minutos con una interfaz intuitiva y moderna."
          />

          <FeatureCard
            title="🔔 Notificaciones en Tiempo Real"
            delay={0.25}
            description="Recibí alertas instantáneas cuando tu reclamo cambie de estado."
          />

          <FeatureCard
            title="🌍 Comunidad Activa"
            delay={0.4}
            description="Apoyá, comentá y seguí los reclamos de otros ciudadanos."
          />
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <motion.footer
        className="bg-white/90 backdrop-blur-lg border-t border-gray-300 py-6 text-center text-sm text-gray-600 shadow-inner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        © {new Date().getFullYear()} CityFix — Innovación Urbana Ciudadana
      </motion.footer>
    </div>
  );
};

const FeatureCard = ({ title, description, delay }) => (
  <motion.div
    className="p-7 rounded-2xl bg-white shadow-lg border border-gray-200 hover:shadow-2xl transition"
    initial={{ opacity: 0, y: 25 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <h3 className="text-xl font-bold text-blue-700 mb-3">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </motion.div>
);

export default LandingPage;
