import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiCreditCard, FiShield, FiCheck, FiShoppingCart } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CHECKOUT_SELECTION_STORAGE_KEY = 'ics_checkout_selection';

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

const HeaderActions = styled.div`
  margin: 0 auto 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const AddMoreProductsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid var(--accent-color);
  background: transparent;
  color: var(--accent-color);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 149, 246, 0.08);
  }
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

const PayPalActionButton = styled.button`
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  border: none;
  background: var(--accent-color);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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
  margin: 0;
  color: var(--text-primary);
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const SummaryControls = styled.div`
  display: flex;
  gap: 8px;
`;

const SummaryControlButton = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--tertiary-bg);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OrderItem = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  align-items: center;

  &:last-of-type {
    border-bottom: none;
    margin-bottom: 20px;
  }
`;

const ItemSelection = styled.div`
  display: flex;
  align-items: center;
`;

const ItemSelect = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-color);
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

const EmptySelectionMessage = styled.div`
  font-size: 14px;
  color: var(--text-muted);
  text-align: center;
  margin: 12px 0 16px;
`;

const Checkout = () => {
  const [selectedPayment, setSelectedPayment] = useState('paypal');
  const [processing, setProcessing] = useState(false);
  const { cart, loading, initialized } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const selectionInitializedRef = useRef(false);

  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    if (cart.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [initialized, loading, cart.length, navigate]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!cart.length) {
      setSelectedProductIds([]);
      selectionInitializedRef.current = false;
      return;
    }

    const fromState = location.state?.selectedProductIds;
    if (fromState?.length) {
      const matches = cart
        .filter((item) => fromState.includes(item.productId))
        .map((item) => item.productId);

      if (matches.length) {
        setSelectedProductIds(matches);
        selectionInitializedRef.current = true;
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }
    }

    if (!selectionInitializedRef.current) {
      setSelectedProductIds(cart.map((item) => item.productId));
      selectionInitializedRef.current = true;
      return;
    }

    setSelectedProductIds((prev) =>
      prev.filter((id) => cart.some((item) => item.productId === id))
    );
  }, [cart, initialized, location.state, location.pathname, navigate]);

  const selectedItems = useMemo(
    () => cart.filter((item) => selectedProductIds.includes(item.productId)),
    [cart, selectedProductIds]
  );

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + (item.price * Number(item.quantity || 0)),
        0
      ),
    [selectedItems]
  );

  const shipping = selectedItems.length === 0 ? 0 : (subtotal > 5000 ? 0 : 250); // Free shipping over ₱5,000, otherwise ₱250
  const tax = subtotal * 0.12; // 12% VAT in Philippines
  const total = subtotal + shipping + tax;

  const allProductIds = useMemo(() => cart.map((item) => item.productId), [cart]);
  const allSelected = allProductIds.length > 0 && selectedProductIds.length === allProductIds.length;
  const hasSelection = selectedItems.length > 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const handleSelectAll = () => {
    setSelectedProductIds([...allProductIds]);
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  const handleToggleItem = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddMoreProducts = () => {
    navigate('/products');
  };

  const handlePayPalCheckout = async () => {
    if (!hasSelection) {
      toast.error('Select at least one item to checkout');
      return;
    }

    try {
      setProcessing(true);
      const orderItems = selectedItems.map((item) => ({
        name: item.name,
        sku: item.productId,
        productId: item.productId,
        price: item.price,
        quantity: Math.max(1, Math.round(Number(item.quantity || 0)))
      }));

      const response = await axios.post(`${API_URL}/api/payments/create-payment`, {
        items: orderItems,
        subtotal,
        shipping,
        tax,
        total,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      });

      const { paymentId, approvalUrl } = response.data || {};
      if (!approvalUrl) {
        throw new Error('Missing PayPal approval URL');
      }

      try {
        window.localStorage.setItem(
          CHECKOUT_SELECTION_STORAGE_KEY,
          JSON.stringify({
            paymentId,
            items: orderItems,
            subtotal,
            shipping,
            tax,
            total,
            selectedProductIds
          })
        );
      } catch (storageError) {
        console.error('Failed to persist checkout selection:', storageError);
        toast.error('Unable to start PayPal checkout. Please try again.');
        setProcessing(false);
        return;
      }

      window.location.href = approvalUrl;
    } catch (error) {
      console.error('Error redirecting to PayPal:', error);
      toast.error(error.response?.data?.message || 'Failed to redirect to PayPal');
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <CheckoutContainer>
      <Header>
        <Title>Checkout</Title>
        <Subtitle>Review your order and complete your purchase</Subtitle>
      </Header>

      <HeaderActions>
        <AddMoreProductsButton onClick={handleAddMoreProducts}>
          <FiShoppingCart size={16} />
          Add More Products
        </AddMoreProductsButton>
      </HeaderActions>

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
    You will be redirected to PayPal Sandbox to sign in and approve this order securely.
  </PaymentMethodDescription>
            </PaymentOption>
          </PaymentOptions>

          {selectedPayment === 'paypal' && (
            <PayPalContainer>
              <PayPalActionButton
                onClick={handlePayPalCheckout}
                disabled={processing || !hasSelection}
              >
                Complete Order in PayPal Sandbox
              </PayPalActionButton>
            </PayPalContainer>
          )}

          <SecurityBadge>
            <FiShield size={16} />
            Your payment information is secure and encrypted
          </SecurityBadge>
        </PaymentSection>

        <OrderSummary>
          <SummaryHeader>
            <SummaryTitle>Order Summary</SummaryTitle>
            <SummaryControls>
              <SummaryControlButton
                onClick={handleSelectAll}
                disabled={allSelected || cart.length === 0}
              >
                Select all
              </SummaryControlButton>
              <SummaryControlButton
                onClick={handleClearSelection}
                disabled={!hasSelection}
              >
                Clear
              </SummaryControlButton>
            </SummaryControls>
          </SummaryHeader>

          {cart.map((item) => (
            <OrderItem key={item.productId}>
              <ItemSelection>
                <ItemSelect
                  type="checkbox"
                  checked={selectedProductIds.includes(item.productId)}
                  onChange={() => handleToggleItem(item.productId)}
                />
              </ItemSelection>
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
                  Quantity: {item.quantity} x {formatPrice(item.price)}
                </ItemDetails>
              </ItemInfo>
            </OrderItem>
          ))}

          {!hasSelection && (
            <EmptySelectionMessage>
              Select the items you want to include in this checkout.
            </EmptySelectionMessage>
          )}

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
