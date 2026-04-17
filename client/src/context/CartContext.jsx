import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (producto) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === producto.id && i.talla === producto.talla
      );
      if (existing) {
        return prev.map((i) =>
          i.id === producto.id && i.talla === producto.talla
            ? { ...i, cantidad: i.cantidad + producto.cantidad }
            : i
        );
      }
      return [...prev, producto];
    });
    setIsOpen(true);
  };

  const removeItem = (id, talla) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.talla === talla)));
  };

  const updateQuantity = (id, talla, cantidad) => {
    if (cantidad <= 0) return removeItem(id, talla);
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.talla === talla ? { ...i, cantidad } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const getItemCount = () => items.reduce((sum, i) => sum + i.cantidad, 0);
  const getSubtotal = () => items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const getShipping = () => (getSubtotal() >= 150000 ? 0 : 8000);
  const getTotal = () => getSubtotal() + getShipping();

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        getShipping,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
