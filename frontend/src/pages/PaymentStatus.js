import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CHECKOUT_SELECTION_STORAGE_KEY = 'ics_checkout_selection';
const resolveAuthHeaders = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  const token = window.localStorage?.getItem('token');
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`
  };
};

const StatusContainer = styled.div`
  min-height: calc(100vh - 80px);
  padding: 60px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 36px 32px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
`;

const IconWrapper = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ variant }) => {
    if (variant === 'success') return 'rgba(0, 149, 246, 0.15)';
    if (variant === 'error') return 'rgba(231, 76, 60, 0.18)';
    return 'rgba(243, 156, 18, 0.18)';
  }};
  color: ${({ variant }) => {
    if (variant === 'success') return 'var(--accent-color)';
    if (variant === 'error') return '#e74c3c';
    return '#f39c12';
  }};
`;

const StatusTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
`;

const StatusMessage = styled.p`
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 28px;
`;

const ActionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PrimaryButton = styled.button`
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  background: var(--accent-color);
  color: white;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-hover);
  }
`;

const SecondaryButton = styled.button`
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    border-color: var(--accent-color);
  }
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  margin: 0 auto 24px;
  border-radius: 50%;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [status, setStatus] = useState(() => {
    if (location.pathname.includes('/payment/success')) {
      return 'processing';
    }
    if (location.pathname.includes('/payment/cancel')) {
      return 'cancelled';
    }
    return 'unknown';
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (location.pathname.includes('/payment/cancel')) {
      window.localStorage.removeItem(CHECKOUT_SELECTION_STORAGE_KEY);
      setStatus('cancelled');
      return;
    }

    if (!location.pathname.includes('/payment/success')) {
      setStatus('unknown');
      return;
    }

    const finalizePayment = async () => {
      let storedSelection = null;

      try {
        const raw = window.localStorage.getItem(CHECKOUT_SELECTION_STORAGE_KEY);
        if (raw) {
          storedSelection = JSON.parse(raw);
        }
      } catch (error) {
        console.error('Failed to parse stored checkout selection:', error);
      }

      const params = new URLSearchParams(location.search);
      const payerId = params.get('PayerID') || params.get('payerId');
      const paymentIdParam = params.get('paymentId') || params.get('paymentID') || params.get('token');
      const paymentId = paymentIdParam || storedSelection?.paymentId;

      if (!storedSelection || !paymentId || !payerId) {
        setStatus('error');
        setErrorMessage('We could not confirm your payment details. Please try again.');
        return;
      }

      try {
        await axios.post(`${API_URL}/api/payments/execute-payment`, {
          paymentId,
          payerId,
          items: storedSelection.items || [],
          subtotal: storedSelection.subtotal || 0,
          shipping: storedSelection.shipping || 0,
          tax: storedSelection.tax || 0,
          total: storedSelection.total || 0
        }, {
          headers: resolveAuthHeaders()
        });

        window.localStorage.removeItem(CHECKOUT_SELECTION_STORAGE_KEY);
        await fetchCart();
        setStatus('success');
      } catch (error) {
        console.error('Error executing PayPal payment:', error);
        setStatus('error');
        if (error.response?.status === 401) {
          setErrorMessage('We need you to sign in again before we can finalise this payment. Please log in and try once more.');
        } else {
          setErrorMessage(error.response?.data?.message || 'Payment confirmation failed. Please contact support or try again.');
        }
      }
    };

    finalizePayment();
  }, [location, fetchCart]);

  const handleViewOrders = () => navigate('/orders');
  const handleGoToCheckout = () => navigate('/checkout');
  const handleContinueShopping = () => navigate('/products');
  const handleReturnToCart = () => navigate('/cart');

  return (
    <StatusContainer>
      <StatusCard>
        {status === 'processing' && (
          <>
            <Spinner />
            <StatusTitle>Finalizing your payment…</StatusTitle>
            <StatusMessage>
              Hold tight while we confirm your PayPal transaction. This should only take a moment.
            </StatusMessage>
          </>
        )}

        {status === 'success' && (
          <>
            <IconWrapper variant="success">
              <FiCheckCircle size={34} />
            </IconWrapper>
            <StatusTitle>Payment confirmed!</StatusTitle>
            <StatusMessage>
              Thank you for your purchase. You can review your order details anytime on the Orders page.
            </StatusMessage>
            <ActionRow>
              <PrimaryButton onClick={handleViewOrders}>View Orders</PrimaryButton>
              <SecondaryButton onClick={handleContinueShopping}>Continue Shopping</SecondaryButton>
            </ActionRow>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <IconWrapper variant="warning">
              <FiAlertTriangle size={34} />
            </IconWrapper>
            <StatusTitle>Payment cancelled</StatusTitle>
            <StatusMessage>
              Your PayPal checkout was cancelled. No charges were made. You can head back to checkout to try again.
            </StatusMessage>
            <ActionRow>
              <PrimaryButton onClick={handleGoToCheckout}>Return to Checkout</PrimaryButton>
              <SecondaryButton onClick={handleContinueShopping}>Browse Products</SecondaryButton>
            </ActionRow>
          </>
        )}

        {status === 'error' && (
          <>
            <IconWrapper variant="error">
              <FiXCircle size={34} />
            </IconWrapper>
            <StatusTitle>We couldn’t verify the payment</StatusTitle>
            <StatusMessage>
              {errorMessage || 'Something went wrong while confirming your payment. Please try again or contact support.'}
            </StatusMessage>
            <ActionRow>
              <PrimaryButton onClick={handleGoToCheckout}>Back to Checkout</PrimaryButton>
              <SecondaryButton onClick={handleReturnToCart}>Return to Cart</SecondaryButton>
            </ActionRow>
          </>
        )}

        {status === 'unknown' && (
          <>
            <IconWrapper variant="warning">
              <FiAlertTriangle size={34} />
            </IconWrapper>
            <StatusTitle>Payment status unavailable</StatusTitle>
            <StatusMessage>
              We’re not sure what happened with your last attempt. Head back to checkout to give it another try.
            </StatusMessage>
            <ActionRow>
              <PrimaryButton onClick={handleGoToCheckout}>Go to Checkout</PrimaryButton>
              <SecondaryButton onClick={handleContinueShopping}>Browse Products</SecondaryButton>
            </ActionRow>
          </>
        )}
      </StatusCard>
    </StatusContainer>
  );
};

export default PaymentStatus;
