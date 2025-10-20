import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPackage, FiCalendar, FiDollarSign, FiShoppingBag, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const OrdersContainer = styled.div`
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

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const OrderCard = styled(motion.div)`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderId = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const OrderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--text-secondary);
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => {
    switch (props.status) {
      case 'pending':
        return `
          background: rgba(255, 204, 2, 0.2);
          color: var(--warning-color);
          border: 1px solid var(--warning-color);
        `;
      case 'processing':
        return `
          background: rgba(0, 149, 246, 0.2);
          color: var(--accent-color);
          border: 1px solid var(--accent-color);
        `;
      case 'shipped':
        return `
          background: rgba(0, 214, 143, 0.2);
          color: var(--success-color);
          border: 1px solid var(--success-color);
        `;
      case 'delivered':
        return `
          background: rgba(0, 214, 143, 0.2);
          color: var(--success-color);
          border: 1px solid var(--success-color);
        `;
      case 'cancelled':
        return `
          background: rgba(237, 73, 86, 0.2);
          color: var(--error-color);
          border: 1px solid var(--error-color);
        `;
      default:
        return `
          background: var(--tertiary-bg);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        `;
    }
  }}
`;

const OrderItems = styled.div`
  margin-bottom: 20px;
`;

const ItemsHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OrderItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--tertiary-bg);
  border-radius: 8px;
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--secondary-bg);
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
`;

const ItemDetails = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const OrderTotal = styled.div`
  text-align: right;
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-color);
`;

const EmptyOrders = styled.div`
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
  gap: 8px;
  background: var(--accent-color);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-hover);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
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

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const scopeParam = isAdmin ? '?scope=all' : '';
      const response = await axios.get(`${API_URL}/api/users/orders${scopeParam}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    fetchOrders();
  }, [authLoading, fetchOrders]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <OrdersContainer>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </OrdersContainer>
    );
  }

  if (orders.length === 0) {
    return (
      <OrdersContainer>
        <Header>
          <Title>Orders History</Title>
          <Subtitle>
            {isAdmin
              ? 'All customer orders will appear here once purchases are completed.'
              : 'Orders history where it stores all the orders the users purchased.'}
          </Subtitle>
        </Header>

        <EmptyOrders>
          <EmptyIcon>📦</EmptyIcon>
          <EmptyTitle>No orders recorded yet</EmptyTitle>
          <EmptyMessage>
            Once customers complete a purchase, the order history will appear in this list.
          </EmptyMessage>
          {!isAdmin && (
            <ShopButton to="/products">
              <FiShoppingBag size={20} />
              Start Shopping
            </ShopButton>
          )}
        </EmptyOrders>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer>
      <Header>
        <Title>Orders History</Title>
        <Subtitle>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} recorded
          {isAdmin ? ' across all customers' : ''}
        </Subtitle>
      </Header>

      <OrdersList>
        {orders.map((order, index) => (
          <OrderCard
            key={order.orderId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <OrderHeader>
              <OrderInfo>
                <OrderId>Order #{order.orderId.slice(-8).toUpperCase()}</OrderId>
                <OrderMeta>
                <MetaItem>
                  <FiCalendar size={14} />
                  {formatDate(order.createdAt)}
                </MetaItem>
                {isAdmin && order.customer && (
                  <MetaItem>
                    <FiUser size={14} />
                    <span>
                      {order.customer.name}
                      {order.customer.email ? ` • ${order.customer.email}` : ''}
                    </span>
                  </MetaItem>
                )}
                <MetaItem>
                  <FiPackage size={14} />
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </MetaItem>
                  <MetaItem>
                    <FiDollarSign size={14} />
                    {formatPrice(order.total)}
                  </MetaItem>
                </OrderMeta>
              </OrderInfo>
              <StatusBadge status={order.status}>
                {order.status}
              </StatusBadge>
            </OrderHeader>

            <OrderItems>
              <ItemsHeader>Order Items</ItemsHeader>
              <ItemsList>
                {order.items.map((item, itemIndex) => (
                  <OrderItem key={itemIndex}>
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
              </ItemsList>
            </OrderItems>

            <OrderTotal>
              Total: {formatPrice(order.total)}
            </OrderTotal>
          </OrderCard>
        ))}
      </OrdersList>
    </OrdersContainer>
  );
};

export default Orders;
