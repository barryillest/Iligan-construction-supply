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

const sanitizePaypalItems = (items = []) => {
  return ensureArray(items).map((item, index) => {
    const quantity = Math.max(1, Math.round(Number(item?.quantity || 0)));
    const price = Number(item?.price || 0);

    return {
      paypal: {
        name: (item?.name || `Item ${index + 1}`).toString().slice(0, 127),
        sku: (item?.sku || item?.productId || `SKU-${index + 1}`).toString().slice(0, 127),
        price: price.toFixed(2),
        currency: 'USD',
        quantity
      },
      raw: {
        productId: item?.productId || item?.sku || `item-${index + 1}`,
        name: item?.name || `Item ${index + 1}`,
        price,
        quantity,
        image: item?.image || null
      }
    };
  });
};

const computePaymentTotals = (items = [], shipping = 0, tax = 0, total = 0) => {
  const sanitized = sanitizePaypalItems(items);
  const subtotal = sanitized.reduce(
    (sum, item) => sum + item.raw.price * item.raw.quantity,
    0
  );

  const normalizedShipping = Math.max(0, Number(shipping) || 0);
  const normalizedTax = Math.max(0, Number(tax) || 0);
  const normalizedTotal = subtotal + normalizedShipping + normalizedTax;

  return {
    paypalItems: sanitized.map(item => item.paypal),
    rawItems: sanitized.map(item => item.raw),
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(normalizedShipping.toFixed(2)),
    tax: parseFloat(normalizedTax.toFixed(2)),
    total: parseFloat(normalizedTotal.toFixed(2))
  };
};

// Create PayPal payment
router.post('/create-payment', authenticateToken, async (req, res) => {
  try {
    const {
      items = [],
      subtotal = 0,
      shipping = 0,
      tax = 0,
      total = 0,
      returnUrl,
      cancelUrl
    } = req.body;

    const {
      paypalItems,
      subtotal: normalizedSubtotal,
      shipping: normalizedShipping,
      tax: normalizedTax,
      total: normalizedTotal
    } = computePaymentTotals(items, shipping, tax, total);

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`
      },
      transactions: [{
        item_list: {
          items: paypalItems
        },
        amount: {
          currency: 'USD',
          total: normalizedTotal.toFixed(2),
          details: {
            subtotal: normalizedSubtotal.toFixed(2),
            shipping: normalizedShipping.toFixed(2),
            tax: normalizedTax.toFixed(2)
          }
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
    const {
      paymentId,
      payerId,
      items = [],
      subtotal = 0,
      shipping = 0,
      tax = 0,
      total = 0
    } = req.body;

    const {
      paypalItems,
      rawItems,
      subtotal: normalizedSubtotal,
      shipping: normalizedShipping,
      tax: normalizedTax,
      total: normalizedTotal
    } = computePaymentTotals(items, shipping, tax, total);

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [{
        amount: {
          currency: 'USD',
          total: normalizedTotal.toFixed(2),
          details: {
            subtotal: normalizedSubtotal.toFixed(2),
            shipping: normalizedShipping.toFixed(2),
            tax: normalizedTax.toFixed(2)
          }
        },
        item_list: {
          items: paypalItems
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
            const paymentState = payment?.state || 'approved';

            const newOrder = {
              orderId: payment.id,
              items: rawItems,
              subtotal: normalizedSubtotal,
              shipping: normalizedShipping,
              tax: normalizedTax,
              total: normalizedTotal,
              status: paymentState === 'approved' ? 'completed' : paymentState,
              paymentId: payment.id,
              createdAt: new Date()
            };

            const updatedOrders = [...ensureArray(user.orders), newOrder];
            const purchasedIds = rawItems
              .map(item => item.productId || item.sku)
              .filter(Boolean);
            const remainingCart = purchasedIds.length
              ? ensureArray(user.cart).filter(cartItem => !purchasedIds.includes(cartItem.productId))
              : [];

            user.set('orders', updatedOrders);
            user.set('cart', remainingCart); // Remove purchased items from cart
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
