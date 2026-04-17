import { useEffect, useState } from 'react';
import axios from 'axios';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Home = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/api/productos?limit=8`)
      .then((res) => setProductos(res.data.productos || []))
      .catch(console.error);
  }, []);

  return (
    <>
      <Hero />
      <ProductGrid productos={productos} titulo="Lo más nuevo" />
    </>
  );
};

export default Home;
