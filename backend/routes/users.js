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
    const { productId, name, price, quantity = 1, image } = req.body;

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentCart = ensureArray(user.cart);
    const existingItem = currentCart.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentCart.push({
        productId,
        name,
        price,
        quantity,
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

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentCart = ensureArray(user.cart);
    const item = currentCart.find(cartItem => cartItem.productId === productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      const updatedCart = currentCart.filter(cartItem => cartItem.productId !== productId);
      user.set('cart', updatedCart);
      await user.save();
      return res.json({ message: 'Cart updated', cart: updatedCart });
    } else {
      item.quantity = quantity;
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
