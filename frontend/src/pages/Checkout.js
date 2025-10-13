import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { FiCreditCard, FiShield, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';

const CheckoutContainer = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const PaymentSection = styled.div`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PaymentOptions = styled.div`
  margin-bottom: 32px;
`;

const PaymentOption = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
  }

  &.selected {
    border-color: var(--accent-color);
    background: rgba(0, 149, 246, 0.05);
  }
`;

const PaymentMethodTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PaymentMethodDescription = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const PayPalContainer = styled.div`
  margin-top: 20px;
`;

const OrderSummary = styled.div`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 100px;
`;

const SummaryTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
`;

const OrderItem = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);

  &:last-of-type {
    border-bottom: none;
    margin-bottom: 20px;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--tertiary-bg);
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-primary);
  line-height: 1.4;
`;

const ItemDetails = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--text-secondary);

  &.total {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px;
  background: var(--tertiary-bg);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Checkout = () => {
  const [selectedPayment, setSelectedPayment] = useState('paypal');
  const [processing, setProcessing] = useState(false);
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 250; // Free shipping over ₱5,000, otherwise ₱250
  const tax = subtotal * 0.12; // 12% VAT in Philippines
  const total = subtotal + shipping + tax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const createPayPalOrder = async () => {
    try {
      setProcessing(true);
      const orderItems = cart.map(item => ({
        name: item.name,
        sku: item.productId,
        price: item.price,
        quantity: item.quantity
      }));

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/create-payment`,
        {
          items: orderItems,
          total: total,
          returnUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`
        }
      );

      return response.data.paymentId;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      toast.error('Failed to create payment order');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const onPayPalApprove = async (data) => {
    try {
      setProcessing(true);
      const orderItems = cart.map(item => ({
        name: item.name,
        sku: item.productId,
        price: item.price,
        quantity: item.quantity
      }));

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/execute-payment`,
        {
          paymentId: data.orderID,
          payerId: data.payerID,
          items: orderItems,
          total: total
        }
      );

      if (response.data.paymentId) {
        toast.success('Payment successful! Order confirmed.');
        clearCart();
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error executing PayPal payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const onPayPalError = (error) => {
    console.error('PayPal error:', error);
    toast.error('Payment failed. Please try again.');
    setProcessing(false);
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <CheckoutContainer>
      <Header>
        <Title>Checkout</Title>
        <Subtitle>Review your order and complete your purchase</Subtitle>
      </Header>

      <CheckoutContent>
        <PaymentSection style={{ position: 'relative' }}>
          {processing && (
            <LoadingOverlay>
              <LoadingSpinner />
            </LoadingOverlay>
          )}

          <SectionTitle>
            <FiCreditCard size={24} />
            Payment Method
          </SectionTitle>

          <PaymentOptions>
            <PaymentOption
              className={selectedPayment === 'paypal' ? 'selected' : ''}
              onClick={() => setSelectedPayment('paypal')}
            >
              <PaymentMethodTitle>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selectedPayment === 'paypal' ? 'var(--accent-color)' : 'transparent'
                }}>
                  {selectedPayment === 'paypal' && <FiCheck size={12} color="white" />}
                </div>
                PayPal
              </PaymentMethodTitle>
              <PaymentMethodDescription>
                Secure payment with PayPal. Pay with your PayPal account or credit card.
              </PaymentMethodDescription>
            </PaymentOption>
          </PaymentOptions>

          {selectedPayment === 'paypal' && (
            <PayPalContainer>
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  color: 'blue',
                  shape: 'rect',
                  label: 'pay'
                }}
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                onError={onPayPalError}
                disabled={processing}
              />
            </PayPalContainer>
          )}

          <SecurityBadge>
            <FiShield size={16} />
            Your payment information is secure and encrypted
          </SecurityBadge>
        </PaymentSection>

        <OrderSummary>
          <SummaryTitle>Order Summary</SummaryTitle>

          {cart.map((item) => (
            <OrderItem key={item.productId}>
              <ItemImage
                src={item.image || '/placeholder-image.jpg'}
                alt={item.name}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <ItemInfo>
                <ItemName>{item.name}</ItemName>
                <ItemDetails>
                  Quantity: {item.quantity} × {formatPrice(item.price)}
                </ItemDetails>
              </ItemInfo>
            </OrderItem>
          ))}

          <SummaryRow>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </SummaryRow>
          <SummaryRow className="total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </SummaryRow>

          {shipping > 0 && (
            <div style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginTop: '12px',
              textAlign: 'center'
            }}>
              Free shipping on orders over $100
            </div>
          )}
        </OrderSummary>
      </CheckoutContent>
    </CheckoutContainer>
  );
};

export default Checkout;
