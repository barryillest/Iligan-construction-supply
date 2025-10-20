import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

const CartContainer = styled.div`
  padding: 40px 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const ItemCount = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
`;

const CartContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CartItem = styled(motion.div)`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  background: var(--tertiary-bg);
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
  line-height: 1.4;
`;

const ItemPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-color);
`;

const ItemStock = styled.div`
  font-size: 13px;
  color: ${props => props.$out ? 'var(--danger-color, #ff4d4f)' : 'var(--text-secondary)'};
  margin-top: 6px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 16px;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background: var(--tertiary-bg);
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background: var(--border-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const QuantityDisplay = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 24px;
  text-align: center;
`;

const RemoveButton = styled.button`
  width: 40px;
  height: 40px;
  border: 2px solid var(--error-color);
  background: transparent;
  color: var(--error-color);
  font-family: 'Poppins', sans-serif;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(237, 73, 86, 0.1);

  &:hover {
    background: var(--error-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(237, 73, 86, 0.3);
  }
`;

const CartSummary = styled.div`
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

const CheckoutButton = styled(Link)`
  width: 100%;
  padding: 18px 24px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
  min-height: 56px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 149, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, var(--accent-hover), #0074cc);
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 149, 246, 0.3);
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
`;

const EmptyMessage = styled.p`
  font-size: 16px;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  padding: 18px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  min-height: 56px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 149, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, var(--accent-hover), #0074cc);
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 149, 246, 0.3);
  }
`;

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, getCartTotal, getCartItemCount, loading } = useCart();
  const itemCount = getCartItemCount();
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateCartItem(productId, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 250; // Free shipping over ₱5,000, otherwise ₱250
  const tax = subtotal * 0.12; // 12% VAT in Philippines
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <CartContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </CartContainer>
    );
  }

  if (cart.length === 0) {
    return (
      <CartContainer>
        <EmptyCart>
          <EmptyIcon>🛒</EmptyIcon>
          <EmptyTitle>Your cart is empty</EmptyTitle>
          <EmptyMessage>
            Looks like you haven't added any construction supplies to your cart yet.
            Start shopping to build your project!
          </EmptyMessage>
          <ShopButton to="/products">
            <FiShoppingBag size={20} />
            Start Shopping
          </ShopButton>
        </EmptyCart>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <Header>
        <Title>Shopping Cart</Title>
        <ItemCount>
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
        </ItemCount>
      </Header>

      <CartContent>
        <CartItems>
          {cart.map((item, index) => {
            const availableStock = typeof item.availableStock === 'number' ? item.availableStock : null;
            const cannotIncrease = availableStock !== null && availableStock <= 0;

            return (
              <CartItem
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ItemImage
                  src={item.image || '/placeholder-image.jpg'}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <ItemInfo>
                  <ItemName>{item.name}</ItemName>
                  <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                  {availableStock !== null && (
                    <ItemStock $out={cannotIncrease}>
                      {cannotIncrease ? 'No additional stock available' : `${availableStock} remaining`}
                    </ItemStock>
                  )}
                </ItemInfo>
                <QuantityControls>
                  <QuantityButton
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <FiMinus size={14} />
                  </QuantityButton>
                  <QuantityDisplay>{item.quantity}</QuantityDisplay>
                  <QuantityButton
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    disabled={cannotIncrease}
                  >
                    <FiPlus size={14} />
                  </QuantityButton>
                </QuantityControls>
                <RemoveButton
                  onClick={() => removeFromCart(item.productId)}
                >
                  <FiTrash2 size={16} />
                </RemoveButton>
              </CartItem>
            );
          })}
        </CartItems>

        <CartSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
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
          <CheckoutButton to="/checkout">
            Proceed to Checkout
            <FiArrowRight size={16} />
          </CheckoutButton>
        </CartSummary>
      </CartContent>
    </CartContainer>
  );
};

export default Cart;
