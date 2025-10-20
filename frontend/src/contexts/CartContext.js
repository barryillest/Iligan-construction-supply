import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const BASE_STORAGE_KEY = 'ics_cart';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const isBrowser = typeof window !== 'undefined';

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const getAuthHeaders = () => {
  if (!isBrowser) {
    return {};
  }
  const token = window.localStorage?.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildStorageKey = (userId) => {
  if (!userId) {
    return `${BASE_STORAGE_KEY}_guest`;
  }
  return `${BASE_STORAGE_KEY}_${userId}`;
};

export const resolveCartProductId = (item) => {
  if (!item) {
    return '';
  }

  const candidateKeys = [
    'productId',
    'sku',
    'id',
    '_id',
    'code',
    'slug'
  ];

  for (const key of candidateKeys) {
    const value = item[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }

  if (item.name) {
    return `fallback-${item.name}`.toLowerCase().replace(/\s+/g, '-');
  }

  return '';
};

const normalizeCartItems = (items) => {
  return ensureArray(items)
    .map((item) => {
      const productId = resolveCartProductId(item);
      if (!productId) {
        return null;
      }

      const parsedQuantity = Number(item?.quantity);
      let quantity;

      if (Number.isFinite(parsedQuantity)) {
        quantity = parsedQuantity;
      } else if (
        item?.quantity === undefined ||
        item?.quantity === null ||
        item?.quantity === ''
      ) {
        quantity = 1;
      } else {
        quantity = 0;
      }

      if (quantity <= 0) {
        return null;
      }

      const normalizedQuantity = Math.max(1, Math.round(quantity));
      const parsedPrice = Number(item?.price);

      const normalized = {
        productId,
        name: item?.name ?? '',
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        quantity: normalizedQuantity,
        image: item?.image ?? ''
      };

      if (Object.prototype.hasOwnProperty.call(item || {}, 'availableStock')) {
        if (item?.availableStock === null) {
          normalized.availableStock = null;
        } else {
          const parsedStock = Number(item.availableStock);
          if (Number.isFinite(parsedStock)) {
            normalized.availableStock = parsedStock;
          }
        }
      }

      return normalized;
    })
    .filter(Boolean);
};

const readStoredCart = (storageKey) => {
  if (!isBrowser || !storageKey) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return normalizeCartItems(parsed);
  } catch (error) {
    console.error('Failed to read stored cart:', error);
    return [];
  }
};

const writeStoredCart = (storageKey, cart) => {
  if (!isBrowser || !storageKey) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(normalizeCartItems(cart)));
  } catch (error) {
    console.error('Failed to persist cart:', error);
  }
};

const mergeCartItem = (items, newItem) => {
  const normalizedItems = normalizeCartItems(items);
  const productId = resolveCartProductId(newItem);
  const incomingQuantity = Math.max(1, Number(newItem?.quantity ?? 1));

  if (!productId) {
    return normalizedItems;
  }

  const nextItems = [...normalizedItems];
  const existingIndex = nextItems.findIndex(
    (item) => item.productId === productId
  );

  if (existingIndex >= 0) {
    const existing = nextItems[existingIndex];
    nextItems[existingIndex] = {
      ...existing,
      ...newItem,
      productId,
      quantity: Math.max(1, Number(existing.quantity ?? 1)) + incomingQuantity
    };
  } else {
    nextItems.push({
      productId,
      name: newItem.name ?? '',
      price: Number.isFinite(Number(newItem.price)) ? Number(newItem.price) : 0,
      quantity: incomingQuantity,
      image: newItem.image ?? ''
    });
  }

  return normalizeCartItems(nextItems);
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const storageKey = useMemo(() => buildStorageKey(user?.id), [user?.id]);
  const [cart, setCartState] = useState(() => readStoredCart(storageKey));
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const hasSyncedRef = useRef(false);

  // Rehydrate when the active storage key changes (e.g., user login/logout)
  useEffect(() => {
    const storedCart = readStoredCart(storageKey);
    setCartState(storedCart);
    hasSyncedRef.current = false;
  }, [storageKey]);

  useEffect(() => {
    if (authLoading) {
      setInitialized(false);
      return;
    }

    if (isAuthenticated) {
      setInitialized(false);
    } else {
      setInitialized(true);
    }
  }, [authLoading, isAuthenticated]);

  // Persist the cart whenever it changes
  useEffect(() => {
    writeStoredCart(storageKey, cart);
  }, [storageKey, cart]);

  const updateCartState = useCallback((updater) => {
    setCartState((prev) => {
      const updatedValue =
        typeof updater === 'function' ? updater(prev) : updater;
      return normalizeCartItems(updatedValue);
    });
  }, []);

  const syncCartToServer = useCallback(
    async (items) => {
      const normalizedItems = normalizeCartItems(items);

      if (!isAuthenticated || authLoading || normalizedItems.length === 0) {
        updateCartState(normalizedItems);
        hasSyncedRef.current = true;
        return normalizedItems;
      }

      try {
        const response = await axios.post(
          `${API_URL}/api/users/cart/sync`,
          {
            items: normalizedItems
          },
          {
            headers: getAuthHeaders()
          }
        );

        const syncedCart = normalizeCartItems(response.data?.cart || normalizedItems);
        updateCartState(syncedCart);
        hasSyncedRef.current = true;
        return syncedCart;
      } catch (error) {
        console.error('Error syncing cart:', error);
        updateCartState(normalizedItems);
        hasSyncedRef.current = true;
        return normalizedItems;
      }
    },
    [authLoading, isAuthenticated, updateCartState]
  );

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/users/cart`, {
        headers: getAuthHeaders()
      });
      const serverCart = normalizeCartItems(response.data?.cart);

      if (serverCart.length === 0) {
        const storedCart = readStoredCart(storageKey);
        if (storedCart.length > 0 && !hasSyncedRef.current) {
          await syncCartToServer(storedCart);
        } else {
          updateCartState(serverCart);
          hasSyncedRef.current = true;
        }
      } else {
        updateCartState(serverCart);
        hasSyncedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [authLoading, isAuthenticated, storageKey, syncCartToServer, updateCartState]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return false;
    }

    const productId = resolveCartProductId(product);
    if (!productId) {
      toast.error('Unable to add this product to cart right now.');
      return false;
    }

    const cartItem = {
      productId,
      name: product.name,
      price: product.salePrice,
      quantity,
      image: product.image
    };

    try {
      const response = await axios.post(
        `${API_URL}/api/users/cart/add`,
        cartItem,
        {
          headers: getAuthHeaders()
        }
      );

      const updatedCart = normalizeCartItems(response.data?.cart);
      if (updatedCart.length > 0) {
        updateCartState(updatedCart);
      } else {
        updateCartState((prev) => mergeCartItem(prev, cartItem));
      }

      toast.success('Item added to cart');
      hasSyncedRef.current = true;
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/users/cart/update`,
        { productId, quantity },
        {
          headers: getAuthHeaders()
        }
      );

      const updatedCart = normalizeCartItems(response.data?.cart);
      if (updatedCart.length > 0 || quantity <= 0) {
        updateCartState(updatedCart);
      } else {
        updateCartState((prev) =>
          normalizeCartItems(
            prev.map((item) =>
              item.productId === productId
                ? { ...item, quantity: Math.max(1, Number(quantity)) }
                : item
            )
          )
        );
      }
      hasSyncedRef.current = true;
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/users/cart/remove/${productId}`,
        {
          headers: getAuthHeaders()
        }
      );

      const updatedCart = normalizeCartItems(response.data?.cart);
      if (updatedCart.length >= 0) {
        updateCartState(updatedCart);
      }
      hasSyncedRef.current = true;
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/api/users/cart/clear`, {
        headers: getAuthHeaders()
      });
      updateCartState([]);
      hasSyncedRef.current = true;
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + (Number(item.price) || 0) * Number(item.quantity || 0),
      0
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + Number(item.quantity || 0), 0);
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
    fetchCart,
    initialized,
    syncCartToServer
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
