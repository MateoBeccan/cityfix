import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">

      {/* NAVBAR FIXA */}
      <Navbar />

      {/* CONTENIDO PRINCIPAL */}
      <main
        className="
          flex-grow
          max-w-7xl
          mx-auto
          w-full
          px-4 sm:px-6 lg:px-8
          pt-28        /* respiración debajo de navbar */
          pb-16        /* espacio antes del footer */
          animate-fadeIn
        "
      >
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Layout;
