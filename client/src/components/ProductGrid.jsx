import ProductCard from './ProductCard';

const ProductGrid = ({ productos = [], titulo = 'Lo más nuevo' }) => {
  if (productos.length === 0) return null;

  return (
    <section className="bg-[#F5F5F3] py-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-2xl font-medium tracking-widest uppercase mb-10">
          {titulo}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
