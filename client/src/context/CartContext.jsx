import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'strooke_carrito';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const agregarProducto = useCallback(({ id, nombre, precio, imagen_url, cantidad = 1, stock }) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === id);
      if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad;
        if (nuevaCantidad > stock) return prev;
        return prev.map((i) =>
          i.id === id ? { ...i, cantidad: nuevaCantidad } : i
        );
      }
      if (cantidad > stock) return prev;
      return [...prev, { id, nombre, precio, imagen_url, cantidad, stock }];
    });
    setIsOpen(true);
  }, []);

  const quitarProducto = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const modificarCantidad = useCallback((id, cantidad) => {
    if (cantidad < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i
      )
    );
  }, []);

  const vaciarCarrito = useCallback(() => setItems([]), []);

  const abrirCarrito = useCallback(() => setIsOpen(true), []);
  const cerrarCarrito = useCallback(() => setIsOpen(false), []);

  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        cantidadTotal,
        subtotal,
        total,
        agregarProducto,
        quitarProducto,
        modificarCantidad,
        vaciarCarrito,
        abrirCarrito,
        cerrarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
