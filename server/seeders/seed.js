require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize, Categoria, Producto } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });

    const [deportivas] = await Categoria.findOrCreate({
      where: { nombre: 'Deportivas' },
      defaults: { descripcion: 'Gorras técnicas para actividades físicas' },
    });
    const [urbanas] = await Categoria.findOrCreate({
      where: { nombre: 'Urbanas' },
      defaults: { descripcion: 'Gorras urbanas streetwear para el día a día' },
    });
    const [personalizadas] = await Categoria.findOrCreate({
      where: { nombre: 'Personalizadas' },
      defaults: { descripcion: 'Gorras con diseños y bordados exclusivos' },
    });

    const productos = [
      {
        nombre: 'Classic Black Cap',
        descripcion: 'Gorra clásica negra con logo Strooke bordado. Ajuste snapback para mayor comodidad.',
        precio: 65000,
        stock: 20,
        imagen_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format',
        categoria_id: urbanas.id,
      },
      {
        nombre: 'Snapback White',
        descripcion: 'Snapback blanco premium con visera plana y cierre ajustable.',
        precio: 72000,
        stock: 15,
        imagen_url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&auto=format',
        categoria_id: urbanas.id,
      },
      {
        nombre: 'Dad Hat Beige',
        descripcion: 'Dad hat beige estilo vintage con cierre metálico. Ideal para looks casuales.',
        precio: 58000,
        stock: 25,
        imagen_url: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=500&auto=format',
        categoria_id: urbanas.id,
      },
      {
        nombre: 'Running Cap Pro',
        descripcion: 'Gorra técnica ultraligera para running con paneles de ventilación y protección UV.',
        precio: 85000,
        stock: 18,
        imagen_url: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=500&auto=format',
        categoria_id: deportivas.id,
      },
      {
        nombre: 'Trail Flex Cap',
        descripcion: 'Gorra flexible para trail y montaña. Material resistente al agua.',
        precio: 90000,
        stock: 12,
        imagen_url: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=500&auto=format',
        categoria_id: deportivas.id,
      },
      {
        nombre: 'Strooke Signature',
        descripcion: 'Gorra exclusiva con bordado Strooke en relieve. Pieza icónica de la colección.',
        precio: 95000,
        stock: 10,
        imagen_url: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&auto=format',
        categoria_id: personalizadas.id,
      },
      {
        nombre: 'Urban Camo',
        descripcion: 'Gorra camuflaje urbano edición limitada. Diseño exclusivo streetwear.',
        precio: 78000,
        stock: 8,
        imagen_url: 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=500&auto=format',
        categoria_id: urbanas.id,
      },
      {
        nombre: '5-Panel Navy',
        descripcion: 'Gorra 5 paneles azul marino minimal. Estilo limpio y versátil.',
        precio: 62000,
        stock: 22,
        imagen_url: 'https://images.unsplash.com/photo-1578762560042-46ad127c95ea?w=500&auto=format',
        categoria_id: urbanas.id,
      },
      {
        nombre: 'Sport Flex Gray',
        descripcion: 'Gorra deportiva gris con tecnología Flex-Fit. Ajuste perfecto sin regulador.',
        precio: 82000,
        stock: 14,
        imagen_url: 'https://images.unsplash.com/photo-1523314240657-e4ac8b7b3c88?w=500&auto=format',
        categoria_id: deportivas.id,
      },
      {
        nombre: 'Custom Embroidery Vol.1',
        descripcion: 'Gorra con bordado personalizado colección vol.1. Arte urbano en cada detalle.',
        precio: 110000,
        stock: 5,
        imagen_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format',
        categoria_id: personalizadas.id,
      },
      {
        nombre: 'Bucket Hat Black',
        descripcion: 'Bucket hat negro reversible. Doble lado, doble estilo.',
        precio: 68000,
        stock: 16,
        imagen_url: 'https://images.unsplash.com/photo-1576473582563-fc7a9042e3b2?w=500&auto=format',
        categoria_id: urbanas.id,
      },
      {
        nombre: 'Trucker Mesh',
        descripcion: 'Trucker con malla trasera respirante. Clásico americano con toque streetwear.',
        precio: 55000,
        stock: 30,
        imagen_url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&auto=format',
        categoria_id: urbanas.id,
      },
      {
        nombre: 'Marathon Cap',
        descripcion: 'Gorra ultra-ligera para maratón y running de alto rendimiento.',
        precio: 88000,
        stock: 9,
        imagen_url: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=500&auto=format',
        categoria_id: deportivas.id,
      },
      {
        nombre: 'Neon Patch Cap',
        descripcion: 'Gorra con parche neón edición especial. Destaca en cada look.',
        precio: 105000,
        stock: 6,
        imagen_url: 'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=500&auto=format',
        categoria_id: personalizadas.id,
      },
      {
        nombre: 'Retro Brown',
        descripcion: 'Gorra retro café estilo 90s. Nostalgia con actitud urbana.',
        precio: 70000,
        stock: 19,
        imagen_url: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=500&auto=format',
        categoria_id: urbanas.id,
      },
    ];

    for (const p of productos) {
      await Producto.findOrCreate({ where: { nombre: p.nombre }, defaults: p });
    }

    console.log('✅ Seed completado: 3 categorías y 15 productos creados');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  }
};

seed();
