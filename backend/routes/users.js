const express = require('express');
const { authenticateToken } = require('./auth');
const User = require('../models/User');

const router = express.Router();

// Get user cart
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/cart/add', authenticateToken, async (req, res) => {
  try {
    const { productId, name, price, quantity = 1, image } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingItem = user.cart.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({
        productId,
        name,
        price,
        quantity,
        image
      });
    }

    await user.save();
    res.json({ message: 'Item added to cart', cart: user.cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/cart/update', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const item = user.cart.find(item => item.productId === productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      user.cart = user.cart.filter(item => item.productId !== productId);
    } else {
      item.quantity = quantity;
    }

    await user.save();
    res.json({ message: 'Cart updated', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/cart/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(item => item.productId !== productId);
    await user.save();

    res.json({ message: 'Item removed from cart', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/cart/clear', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    res.json({ message: 'Cart cleared', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = user.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific order
router.get('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = user.orders.find(order => order.orderId === orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;