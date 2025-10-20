const express = require('express');
const { authenticateToken } = require('./auth');
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

const getAuthenticatedUser = async (req) => {
  if (req.authUser) {
    return req.authUser;
  }
  if (req.user?.userId) {
    return User.findByPk(req.user.userId);
  }
  return null;
};

const ensureArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to parse JSON array value:', error);
      return [];
    }
  }

  if (value && typeof value === 'object') {
    return Object.values(value);
  }

  return [];
};

const resolveProductId = (item = {}) => {
  const candidates = [
    item.productId,
    item.sku,
    item.id,
    item._id,
    item.code,
    item.slug
  ];

  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null && candidate !== '') {
      return String(candidate);
    }
  }

  if (item.name) {
    return `fallback-${item.name}`.toLowerCase().replace(/\s+/g, '-');
  }

  return '';
};
const fetchProductBySku = async (productId) => {
  if (!productId) {
    return null;
  }
  return Product.findOne({ where: { sku: productId } });
};

const adjustProductStock = async (productRecord, delta) => {
  if (!productRecord) {
    return null;
  }

  const currentStock = Number(productRecord.stock ?? 0);
  const newStock = currentStock + delta;

  if (Number.isNaN(newStock) || newStock < 0) {
    throw new Error('INSUFFICIENT_STOCK');
  }

  productRecord.stock = newStock;
  await productRecord.save();
  return productRecord;
};

const enrichCartItems = async (cartItems) => {
  const items = ensureArray(cartItems);

  const enriched = await Promise.all(items.map(async (item) => {
    if (!item || !item.productId) {
      return { ...item };
    }

    const productRecord = await fetchProductBySku(item.productId);
    const availableStock = productRecord && Number.isFinite(Number(productRecord.stock))
      ? Number(productRecord.stock)
      : null;

    return {
      ...item,
      availableStock
    };
  }));

  return enriched;
};

// Get user cart
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cartItems = ensureArray(user.cart);
    const enrichedCart = await enrichCartItems(cartItems);
    res.json({ cart: enrichedCart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/cart/add', authenticateToken, async (req, res) => {
  try {
    let { productId, name, price, quantity = 1, image } = req.body;
    const resolvedProductId = productId || resolveProductId(req.body);
    const parsedQuantity = Number(quantity ?? 1);
    const safeQuantity = Math.max(1, Math.round(Number.isFinite(parsedQuantity) ? parsedQuantity : 1));
    const parsedPrice = Number(price);
    const hasValidPrice = price !== undefined && price !== null && price !== '' && !Number.isNaN(parsedPrice);

    if (!resolvedProductId) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const productRecord = await fetchProductBySku(resolvedProductId);

    if (productRecord) {
      try {
        await adjustProductStock(productRecord, -safeQuantity);
      } catch (stockError) {
        return res.status(400).json({ message: 'Insufficient stock available' });
      }
    }

    const currentCart = ensureArray(user.cart);
    const existingItem = currentCart.find(item => item.productId === resolvedProductId);

    if (existingItem) {
      existingItem.quantity += safeQuantity;
      existingItem.name = name ?? existingItem.name;
      if (hasValidPrice) {
        existingItem.price = parsedPrice;
      }
      existingItem.image = image ?? existingItem.image;
    } else {
      currentCart.push({
        productId: resolvedProductId,
        name,
        price: hasValidPrice ? parsedPrice : 0,
        quantity: safeQuantity,
        image
      });
    }

    user.set('cart', currentCart);
    await user.save();

    const enrichedCart = await enrichCartItems(currentCart);
    res.json({ message: 'Item added to cart', cart: enrichedCart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/cart/update', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const resolvedProductId = productId || resolveProductId(req.body);
    const parsedQuantity = Number(quantity);
    const safeQuantity = Number.isFinite(parsedQuantity) ? Math.round(parsedQuantity) : 0;

    if (!resolvedProductId) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }

    if (safeQuantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentCart = ensureArray(user.cart);
    const existingItem = currentCart.find(cartItem => cartItem.productId === resolvedProductId);
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const productRecord = await fetchProductBySku(resolvedProductId);
    const delta = safeQuantity - existingItem.quantity;

    if (delta > 0 && productRecord) {
      try {
        await adjustProductStock(productRecord, -delta);
      } catch (stockError) {
        return res.status(400).json({ message: 'Insufficient stock available' });
      }
    } else if (delta < 0 && productRecord) {
      await adjustProductStock(productRecord, Math.abs(delta));
    }

    existingItem.quantity = safeQuantity;

    user.set('cart', currentCart);
    await user.save();

    const enrichedCart = await enrichCartItems(currentCart);
    res.json({ message: 'Cart updated', cart: enrichedCart });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/cart/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const resolvedProductId = productId ? String(productId) : '';

    if (!resolvedProductId) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentCart = ensureArray(user.cart);
    const item = currentCart.find(cartItem => cartItem.productId === resolvedProductId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const productRecord = await fetchProductBySku(resolvedProductId);
    if (productRecord) {
      await adjustProductStock(productRecord, item.quantity);
    }

    const updatedCart = currentCart.filter(cartItem => cartItem.productId !== resolvedProductId);
    user.set('cart', updatedCart);
    await user.save();

    const enrichedCart = await enrichCartItems(updatedCart);
    res.json({ message: 'Item removed from cart', cart: enrichedCart });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/cart/clear', authenticateToken, async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentCart = ensureArray(user.cart);
    await Promise.all(currentCart.map(async (item) => {
      if (!item || !item.productId) {
        return;
      }
      const productRecord = await fetchProductBySku(item.productId);
      if (productRecord) {
        await adjustProductStock(productRecord, item.quantity);
      }
    }));

    user.set('cart', []);
    await user.save();

    res.json({ message: 'Cart cleared', cart: [] });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Replace cart with provided items (used for sync)
router.post('/cart/sync', authenticateToken, async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const incomingItems = ensureArray(req.body?.items);

    const sanitizedItems = incomingItems
      .map(item => {
        const quantity = Number(item?.quantity ?? 0);
        const productId = resolveProductId(item);
        const price = Number(item?.price ?? 0);

        if (!productId || quantity <= 0) {
          return null;
        }

        return {
          productId,
          name: item?.name || '',
          price: Number.isNaN(price) ? 0 : price,
          quantity: Math.max(1, Math.round(Number.isNaN(quantity) ? 0 : quantity)),
          image: item?.image || ''
        };
      })
      .filter(Boolean);

    const mergedIncomingMap = new Map();
    sanitizedItems.forEach((item) => {
      if (mergedIncomingMap.has(item.productId)) {
        const existing = mergedIncomingMap.get(item.productId);
        existing.quantity += item.quantity;
        existing.name = item.name || existing.name;
        existing.price = item.price || existing.price;
        existing.image = item.image || existing.image;
      } else {
        mergedIncomingMap.set(item.productId, { ...item });
      }
    });

    const mergedIncomingItems = Array.from(mergedIncomingMap.values());
    const currentCart = ensureArray(user.cart);

    const currentMap = new Map(currentCart.map(item => [item.productId, item.quantity]));
    const incomingMap = new Map(mergedIncomingItems.map(item => [item.productId, item.quantity]));

    const allProductIds = new Set([...currentMap.keys(), ...incomingMap.keys()]);
    for (const sku of allProductIds) {
      if (!sku) {
        continue;
      }
      const productRecord = await fetchProductBySku(sku);
      if (!productRecord) {
        continue;
      }
      const delta = (incomingMap.get(sku) || 0) - (currentMap.get(sku) || 0);
      if (delta > 0) {
        try {
          await adjustProductStock(productRecord, -delta);
        } catch (stockError) {
          return res.status(400).json({ message: 'Insufficient stock available' });
        }
      } else if (delta < 0) {
        await adjustProductStock(productRecord, Math.abs(delta));
      }
    }

    user.set('cart', mergedIncomingItems);
    await user.save();

    const enrichedCart = await enrichCartItems(mergedIncomingItems);
    res.json({ message: 'Cart synced', cart: enrichedCart });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = ensureArray(user.orders)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific order
router.get('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = ensureArray(user.orders).find(order => order.orderId === orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



