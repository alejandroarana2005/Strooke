import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-[#111] text-white py-32 px-6 overflow-hidden">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center gap-6 relative">
        <p className="text-xs tracking-widest uppercase text-gray-400">
          Nueva Colección 2025
        </p>
        <h1 className="text-5xl md:text-7xl font-medium tracking-widest uppercase leading-tight">
          NUEVAS
          <br />
          GORRAS
        </h1>
        <p className="text-gray-400 text-sm tracking-wider max-w-md leading-relaxed">
          Descubre nuestra colección exclusiva de gorras streetwear. Diseño,
          calidad y estilo en cada pieza.
        </p>
        <Link
          to="/catalogo"
          className="mt-4 bg-white text-black px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-gray-200 transition-colors"
        >
          Ver Colección
        </Link>

        {/* Círculos decorativos */}
        <div className="mt-16 flex items-center gap-6 opacity-20">
          <div className="w-32 h-32 rounded-full bg-gray-400" />
          <div className="w-20 h-20 rounded-full bg-gray-500" />
          <div className="w-40 h-40 rounded-full bg-gray-600" />
          <div className="w-16 h-16 rounded-full bg-gray-300" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
