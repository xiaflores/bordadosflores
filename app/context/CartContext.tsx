'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  key: string; // unique key combining product ID and options
  id: string;
  name: string;
  category: 'Chaquetas' | 'Polleras' | 'Accesorios' | 'Textiles';
  price: number;
  imageUrl: string;
  availability: 'En Stock' | 'A Pedido';
  quantity: number;
  // Selected attributes
  colorName?: string;
  colorHex?: string;
  panos?: number;
  largo?: number;
  cintura?: string | number;
  talla?: string;
  fechaEntrega?: string;
  slug?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'key'> & { quantity?: number }) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('bordados_flores_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('bordados_flores_cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to localStorage', error);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = (newItem: Omit<CartItem, 'quantity' | 'key'> & { quantity?: number }) => {
    const qty = newItem.quantity ?? 1;
    
    // Generate a unique key based on id and attributes
    const attributeParts = [
      newItem.id,
      newItem.colorName || '',
      newItem.colorHex || '',
      newItem.panos ? `${newItem.panos}panos` : '',
      newItem.largo ? `${newItem.largo}largo` : '',
      newItem.cintura ? `${newItem.cintura}cintura` : '',
      newItem.talla || '',
      newItem.fechaEntrega || ''
    ];
    const key = attributeParts.filter(Boolean).join('-');

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.key === key);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += qty;
        return updatedItems;
      } else {
        return [...prevItems, { ...newItem, key, quantity: qty }];
      }
    });
  };

  const removeFromCart = (key: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.key !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.key === key ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isLoaded
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
