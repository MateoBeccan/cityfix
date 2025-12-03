import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import Button from "../Button";
import heroImage from "../assets/logo_reclamo.png";
import logo from "../assets/logo_cityfix.png";
import { ArrowRight, CheckCircle, Users, MessageSquare, TrendingUp, Star, Shield, Zap } from "lucide-react";

const LandingPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* LOGO */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <img
                  src={logo}
                  alt="CityFix"
                  className="w-10 h-10 rounded-full shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  CityFix
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Plataforma Ciudadana</p>
              </div>
            </motion.div>

            {/* NAVIGATION */}
            <motion.nav
              className="hidden md:flex items-center gap-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link to="/feed" className="text-gray-600 hover:text-blue-600 transition font-medium">
                Explorar
              </Link>
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition font-medium">
                Características
              </a>
              <a href="#stats" className="text-gray-600 hover:text-blue-600 transition font-medium">
                Impacto
              </a>
            </motion.nav>

            {/* BUTTONS */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.nombre?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.nombre}</span>
                  </div>
                  <Link to="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                      Panel <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <button
                    onClick={() => logout("/")}
                    className="text-gray-600 hover:text-red-600 px-4 py-2 transition text-sm"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button className="text-gray-600 hover:text-gray-900 px-4 py-2 transition">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                      Comenzar
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* LEFT CONTENT */}
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Zap className="w-4 h-4" />
                Plataforma #1 en Gestión Urbana
              </motion.div>

              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transforma tu ciudad
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  una voz a la vez
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Conecta con tu comunidad, reporta problemas urbanos y sé parte del cambio. 
                Una plataforma moderna para ciudadanos que quieren hacer la diferencia.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link to={user ? "/dashboard" : "/register"}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group">
                    {user ? "Ir al Panel" : "Comenzar Ahora"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/feed">
                  <Button className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all">
                    Explorar Feed
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <motion.div
                className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>100% Gratuito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Datos Seguros</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Comunidad Activa</span>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT IMAGE */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-2xl border border-gray-200">
                  <img
                    src={heroImage}
                    alt="CityFix Platform"
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                  
                  {/* Floating Stats Cards */}
                  <motion.div
                    className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Reclamos Resueltos</p>
                        <p className="font-bold text-green-600">+85%</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Participación</p>
                        <p className="font-bold text-blue-600">Activa</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Background Decoration */}
                <div className="absolute -z-10 top-8 left-8 w-full h-full bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl opacity-20"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- STATS SECTION ---------------- */}
      <section id="stats" className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Impacto Real en la Comunidad</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Números que demuestran cómo CityFix está transformando la gestión urbana</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard number="1,250+" label="Reclamos Procesados" delay={0.1} />
            <StatCard number="89%" label="Tasa de Resolución" delay={0.2} />
            <StatCard number="500+" label="Ciudadanos Activos" delay={0.3} />
            <StatCard number="24h" label="Tiempo Promedio" delay={0.4} />
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES SECTION ---------------- */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Características que Marcan la Diferencia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas modernas diseñadas para empoderar a los ciudadanos y mejorar la gestión urbana
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Reportes Instantáneos"
              description="Crea y envía reclamos en segundos con nuestra interfaz intuitiva y formularios inteligentes."
              delay={0.1}
            />
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="Comunicación Directa"
              description="Mantente conectado con actualizaciones en tiempo real y comunicación bidireccional."
              delay={0.2}
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Comunidad Colaborativa"
              description="Únete a una red de ciudadanos comprometidos trabajando juntos por el cambio."
              delay={0.3}
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Seguimiento Transparente"
              description="Monitorea el progreso de tus reclamos con actualizaciones detalladas y transparentes."
              delay={0.4}
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Datos Protegidos"
              description="Tu información está segura con nuestros protocolos de seguridad de nivel empresarial."
              delay={0.5}
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Experiencia Premium"
              description="Disfruta de una plataforma moderna, rápida y diseñada pensando en el usuario."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* ---------------- CTA SECTION ---------------- */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              ¿Listo para Transformar tu Ciudad?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de ciudadanos que ya están haciendo la diferencia en sus comunidades
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={user ? "/dashboard" : "/register"}>
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all">
                  {user ? "Acceder al Panel" : "Comenzar Gratis"}
                </Button>
              </Link>
              <Link to="/feed">
                <Button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all">
                  Ver Reclamos Públicos
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="CityFix" className="w-8 h-8 rounded-full" />
                <span className="text-xl font-bold">CityFix</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Transformando la gestión urbana a través de la participación ciudadana y la tecnología moderna.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/feed" className="hover:text-white transition">Explorar Feed</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Crear Cuenta</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Iniciar Sesión</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition">Términos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CityFix. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Hecho con ❤️ para mejorar nuestras ciudades
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    className="group p-8 rounded-2xl bg-white shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-100 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
      {title}
    </h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const StatCard = ({ number, label, delay }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">{number}</div>
    <div className="text-gray-600 font-medium">{label}</div>
  </motion.div>
);

export default LandingPage;
