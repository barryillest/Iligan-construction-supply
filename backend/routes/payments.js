const express = require('express');
const paypal = require('paypal-rest-sdk');
const { authenticateToken } = require('./auth');
const User = require('../models/User');

const router = express.Router();

const getAuthenticatedUser = async (req) => {
  if (req.authUser) {
    return req.authUser.reload();
  }
  if (req.user?.userId) {
    return User.findByPk(req.user.userId);
  }
  return null;
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// Create PayPal payment
router.post('/create-payment', authenticateToken, async (req, res) => {
  try {
    const { items, total, returnUrl, cancelUrl } = req.body;

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: returnUrl || 'http://localhost:3000/payment/success',
        cancel_url: cancelUrl || 'http://localhost:3000/payment/cancel'
      },
      transactions: [{
        item_list: {
          items: items.map(item => ({
            name: item.name,
            sku: item.sku || item.productId,
            price: item.price.toFixed(2),
            currency: 'USD',
            quantity: item.quantity
          }))
        },
        amount: {
          currency: 'USD',
          total: total.toFixed(2)
        },
        description: 'Iligan Construction Supply - Order Payment'
      }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        console.error('PayPal payment creation error:', error);
        res.status(500).json({ message: 'Error creating payment', error: error.message });
      } else {
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
        res.json({
          paymentId: payment.id,
          approvalUrl: approvalUrl.href
        });
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Execute PayPal payment
router.post('/execute-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentId, payerId, items, total } = req.body;

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [{
        amount: {
          currency: 'USD',
          total: total.toFixed(2)
        }
      }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error('PayPal payment execution error:', error);
        res.status(500).json({ message: 'Error executing payment', error: error.message });
      } else {
        try {
          // Save order to user's orders
          const user = await getAuthenticatedUser(req);
          if (user) {
            const newOrder = {
              orderId: payment.id,
              items: items,
              total: total,
              status: 'processing',
              paymentId: payment.id,
              createdAt: new Date()
            };

            const updatedOrders = [...ensureArray(user.orders), newOrder];
            user.set('orders', updatedOrders);
            user.set('cart', []); // Clear cart after successful payment
            await user.save();
          }

          res.json({
            message: 'Payment successful',
            paymentId: payment.id,
            status: payment.state,
            orderId: payment.id
          });
        } catch (dbError) {
          console.error('Database error after payment:', dbError);
          res.json({
            message: 'Payment successful but order recording failed',
            paymentId: payment.id,
            status: payment.state
          });
        }
      }
    });
  } catch (error) {
    console.error('Payment execution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment details
router.get('/payment/:paymentId', authenticateToken, (req, res) => {
  const { paymentId } = req.params;

  paypal.payment.get(paymentId, (error, payment) => {
    if (error) {
      console.error('PayPal get payment error:', error);
      res.status(500).json({ message: 'Error fetching payment details' });
    } else {
      res.json(payment);
    }
  });
});

module.exports = router;
