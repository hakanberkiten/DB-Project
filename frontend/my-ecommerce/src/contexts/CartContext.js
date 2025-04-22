// src/contexts/CartContext.js
import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find(item => item.product_item_id === product.product_item_id);
      if (existing) {
        return prevItems.map(item =>
          item.product_item_id === product.product_item_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, {
        product_item_id: product.product_item_id,
        name: product.name,
        Price: product.Price,
        image: product.image ?? '',
        quantity: 1
      }];
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
