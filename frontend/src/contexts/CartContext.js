import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/cart`);
      setCart(response.data.cart || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      const cartItem = {
        productId: product.sku,
        name: product.name,
        price: product.salePrice,
        quantity,
        image: product.image
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/cart/add`,
        cartItem
      );

      setCart(response.data.cart);
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/cart/update`,
        { productId, quantity }
      );

      setCart(response.data.cart);
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/cart/remove/${productId}`
      );

      setCart(response.data.cart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/cart/clear`
      );

      setCart([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
