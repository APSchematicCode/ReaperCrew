'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  variant: string;
  quantity: number;
}

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, variant: string) => void;
  updateQuantity: (id: string, variant: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to get the current user ID (or 'guest')
const getCartKey = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ? `cart-${user.id}` : 'cart-guest';
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartKey, setCartKey] = useState<string>('cart-guest');
  const [isLoading, setIsLoading] = useState(true);

  // Load cart when key changes
  useEffect(() => {
    const loadCart = async () => {
      const key = await getCartKey();
      setCartKey(key);
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      } else {
        setItems([]);
      }
      setIsLoading(false);
    };
    loadCart();

    // Listen to auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadCart();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, cartKey, isLoading]);

  const addItem = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === newItem.id && item.variant === newItem.variant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity || 1;
        return updated;
      } else {
        return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
      }
    });
  };

  const removeItem = (id: string, variant: string) => {
    setItems(prev => prev.filter(item => !(item.id === id && item.variant === variant)));
  };

  const updateQuantity = (id: string, variant: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, variant);
      return;
    }
    setItems(prev => 
      prev.map(item => 
        (item.id === id && item.variant === variant) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
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