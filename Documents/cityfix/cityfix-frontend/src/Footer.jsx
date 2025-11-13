const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10 py-6">
      <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
        © {new Date().getFullYear()} CityFix — Plataforma de Reclamos Urbanos <br />
        Desarrollado por <span className="text-blue-600 font-semibold">Mateo Beccan</span>
      </div>
    </footer>
  );
};

export default Footer;
