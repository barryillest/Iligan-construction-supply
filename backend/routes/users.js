const express = require('express');
const { authenticateToken } = require('./auth');
const User = require('../models/User');

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

const ensureArray = (value) => (Array.isArray(value) ? value : []);

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

// Get user cart
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ cart: ensureArray(user.cart) });
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
    res.json({ message: 'Item added to cart', cart: currentCart });
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

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!resolvedProductId) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }

    const currentCart = ensureArray(user.cart);
    const item = currentCart.find(cartItem => cartItem.productId === resolvedProductId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (safeQuantity <= 0) {
      const updatedCart = currentCart.filter(cartItem => cartItem.productId !== resolvedProductId);
      user.set('cart', updatedCart);
      await user.save();
      return res.json({ message: 'Cart updated', cart: updatedCart });
    } else {
      item.quantity = safeQuantity;
    }

    user.set('cart', currentCart);
    await user.save();
    res.json({ message: 'Cart updated', cart: currentCart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/cart/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedCart = ensureArray(user.cart).filter(item => item.productId !== productId);
    user.set('cart', updatedCart);
    await user.save();

    res.json({ message: 'Item removed from cart', cart: updatedCart });
  } catch (error) {
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

    user.set('cart', []);
    await user.save();

    res.json({ message: 'Cart cleared', cart: [] });
  } catch (error) {
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
        const quantity = Number(item.quantity ?? 0);
        const productId = resolveProductId(item);
        const price = Number(item.price ?? 0);

        if (!productId || quantity <= 0) {
          return null;
        }

        return {
          productId,
          name: item.name || '',
          price: isNaN(price) ? 0 : price,
          quantity: Math.max(1, Math.round(isNaN(quantity) ? 0 : quantity)),
          image: item.image || ''
        };
      })
      .filter(Boolean);

    user.set('cart', sanitizedItems);
    await user.save();

    res.json({ message: 'Cart synced', cart: sanitizedItems });
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
