'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Product {
  _id: string; name: string; description: string; price: number;
  originalPrice?: number; images: string[]; category: string;
  stock: number; featured: boolean; rating: number; reviews: number;
}
interface CartItem { product: Product; quantity: number; }
interface CartContextType {
  items: CartItem[]; addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void; updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void; totalItems: number; totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('eliteapps-cart');
    if (stored) { try { setItems(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => { localStorage.setItem('eliteapps-cart', JSON.stringify(items)); }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product._id === product._id);
      if (existing) return prev.map(i => i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
  };

  const removeItem = (productId: string) => setItems(prev => prev.filter(i => i.product._id !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems(prev => prev.map(i => i.product._id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => { setItems([]); localStorage.removeItem('eliteapps-cart'); };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
