'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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

const GUEST_KEY = 'cart-guest';

const getCartKey = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ? `cart-${user.id}` : GUEST_KEY;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartKey, setCartKey] = useState<string>(GUEST_KEY);
  const [isLoading, setIsLoading] = useState(true);

  // Refs to hold the latest values for the auth listener
  const itemsRef = useRef(items);
  const cartKeyRef = useRef(cartKey);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    cartKeyRef.current = cartKey;
  }, [cartKey]);

  const loadCart = async () => {
    const key = await getCartKey();
    setCartKey(key);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart', e);
        setItems([]);
      }
    } else {
      setItems([]);
    }
    setIsLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadCart();
  }, []);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        // 1. Save current items to the user's specific key (so they persist for next login)
        const currentKey = cartKeyRef.current;
        const currentItems = itemsRef.current;
        if (currentKey !== GUEST_KEY && currentItems.length > 0) {
          localStorage.setItem(currentKey, JSON.stringify(currentItems));
        }
        // 2. Remove the guest cart entirely
        localStorage.removeItem(GUEST_KEY);
        // 3. Force the cart to be EMPTY for the guest session
        setItems([]);
        setCartKey(GUEST_KEY);
      } 
      else if (event === 'SIGNED_IN' && session?.user?.id) {
        const userKey = `cart-${session.user.id}`;
        let mergedItems: CartItem[] = [];

        // A) Load guest cart
        const guestRaw = localStorage.getItem(GUEST_KEY);
        if (guestRaw) {
          try {
            mergedItems = JSON.parse(guestRaw);
          } catch (e) { /* ignore */ }
        }

        // B) Load user cart
        const userRaw = localStorage.getItem(userKey);
        if (userRaw) {
          try {
            const userItems = JSON.parse(userRaw);
            // Merge: if id+variant exists in mergedItems, add quantity, else push
            userItems.forEach((userItem: CartItem) => {
              const existing = mergedItems.find(
                (item) => item.id === userItem.id && item.variant === userItem.variant
              );
              if (existing) {
                existing.quantity += userItem.quantity;
              } else {
                mergedItems.push(userItem);
              }
            });
          } catch (e) { /* ignore */ }
        }

        // C) Clear guest cart (we've merged it)
        localStorage.removeItem(GUEST_KEY);
        // D) Save merged to user key
        if (mergedItems.length > 0) {
          localStorage.setItem(userKey, JSON.stringify(mergedItems));
        } else {
          localStorage.removeItem(userKey);
        }

        // E) Update state
        setItems(mergedItems);
        setCartKey(userKey);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures listener is only set up once

  // Save to localStorage whenever items change (only for the current key)
  useEffect(() => {
    if (!isLoading) {
      if (items.length === 0) {
        localStorage.removeItem(cartKey);
      } else {
        localStorage.setItem(cartKey, JSON.stringify(items));
      }
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