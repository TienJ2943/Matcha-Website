import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from './api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function refreshCart() {
    if (!user) {
      setCart([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/api/cart');
      setCart(data.cart.items || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshCart();
  }, [user?.id]);

  async function addToCart(product) {
    if (!user) throw new Error('Please login before adding products to cart');
    const data = await apiFetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId: product._id, quantity: 1 }),
    });
    setCart(data.cart.items || []);
    setTotal(data.total || 0);
  }

  async function updateQuantity(productId, quantity) {
    const data = await apiFetch(`/api/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    setCart(data.cart.items || []);
    setTotal(data.total || 0);
  }

  async function removeFromCart(productId) {
    const data = await apiFetch(`/api/cart/items/${productId}`, { method: 'DELETE' });
    setCart(data.cart.items || []);
    setTotal(data.total || 0);
  }

  async function clearCart() {
    const data = await apiFetch('/api/cart', { method: 'DELETE' });
    setCart(data.cart.items || []);
    setTotal(data.total || 0);
  }

  async function checkout() {
    const order = await apiFetch('/api/orders', { method: 'POST' });
    setCart([]);
    setTotal(0);
    return order;
  }

  return (
    <CartContext.Provider value={{ cart, total, loading, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
