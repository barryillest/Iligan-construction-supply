import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShoppingCart, FiStar, FiTruck, FiShield, FiEdit3, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductContainer = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 32px;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const ImageSection = styled.div``;

const ProductImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 16px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
`;

const ProductInfo = styled.div``;

const ProductName = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
  line-height: 1.3;
`;

const PriceSection = styled.div`
  margin-bottom: 24px;
`;

const CurrentPrice = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 8px;
`;

const OriginalPrice = styled.div`
  font-size: 18px;
  color: var(--text-muted);
  text-decoration: line-through;
`;

const Savings = styled.div`
  font-size: 14px;
  color: var(--success-color);
  font-weight: 600;
`;

const Description = styled.div`
  margin-bottom: 32px;
`;

const DescriptionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
`;

const DescriptionText = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 16px;
`;

const Features = styled.div`
  margin-bottom: 32px;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
`;

const FeatureItem = styled.li`
  padding: 8px 0;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;

  &:before {
    content: '✓';
    color: var(--success-color);
    font-weight: bold;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
`;

const AddToCartButton = styled.button`
  flex: 1;
  padding: 16px 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BuyNowButton = styled.button`
  flex: 1;
  padding: 16px 24px;
  background: var(--secondary-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--tertiary-bg);
  }
`;

const AdminActions = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

const AdminButton = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid ${({ danger }) => (danger ? 'rgba(237, 73, 86, 0.4)' : 'var(--border-color)')};
  background: ${({ danger }) => (danger ? 'rgba(237, 73, 86, 0.15)' : 'rgba(255, 255, 255, 0.05)')};
  color: ${({ danger }) => (danger ? 'rgba(255, 205, 207, 0.9)' : 'var(--text-primary)')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ danger }) => (danger ? 'rgba(237, 73, 86, 0.25)' : 'rgba(255, 255, 255, 0.12)')};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const ProductMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const MetaCard = styled.div`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const MetaIcon = styled.div`
  width: 48px;
  height: 48px;
  background: var(--accent-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
`;

const MetaTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
`;

const MetaDescription = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--error-color);
  font-size: 16px;
`;

const ProductDetail = () => {
  const { sku } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${sku}`
      );
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Product not found or failed to load');
    } finally {
      setLoading(false);
    }
  }, [sku]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    if (product) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase');
      return;
    }

    handleAddToCart();
    navigate('/checkout');
  };

  const handleAdminEdit = () => {
    if (!product) return;
    navigate('/admin/products', { state: { focusSku: product.sku } });
  };

  const handleAdminDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(`Delete ${product.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${encodeURIComponent(product.sku)}`
      );
      toast.success('Product removed.');
      navigate('/admin/products', { replace: true });
    } catch (error) {
      console.error('Failed to delete product', error);
      toast.error(error.response?.data?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const calculateSavings = (regular, sale) => {
    if (!regular || !sale || regular <= sale) return null;
    const savings = regular - sale;
    const percentage = Math.round((savings / regular) * 100);
    return { amount: savings, percentage };
  };

  if (loading) {
    return (
      <ProductContainer>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </ProductContainer>
    );
  }

  if (error || !product) {
    return (
      <ProductContainer>
        <BackButton onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} />
          Back
        </BackButton>
        <ErrorMessage>{error || 'Product not found'}</ErrorMessage>
      </ProductContainer>
    );
  }

  const savings = calculateSavings(product.regularPrice, product.salePrice);

  return (
    <ProductContainer>
      <BackButton onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} />
        Back to Products
      </BackButton>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ProductGrid>
          <ImageSection>
            <ProductImage
              src={product.image || '/placeholder-image.jpg'}
              alt={product.name}
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </ImageSection>

          <ProductInfo>
            <ProductName>{product.name}</ProductName>

            <PriceSection>
              <CurrentPrice>{formatPrice(product.salePrice)}</CurrentPrice>
              {product.regularPrice && product.regularPrice > product.salePrice && (
                <>
                  <OriginalPrice>{formatPrice(product.regularPrice)}</OriginalPrice>
                  {savings && (
                    <Savings>
                      Save {formatPrice(savings.amount)} ({savings.percentage}% off)
                    </Savings>
                  )}
                </>
              )}
            </PriceSection>

            {product.shortDescription && (
              <Description>
                <DescriptionTitle>Product Overview</DescriptionTitle>
                <DescriptionText>{product.shortDescription}</DescriptionText>
              </Description>
            )}

            {product.features && product.features.length > 0 && (
              <Features>
                <DescriptionTitle>Key Features</DescriptionTitle>
                <FeaturesList>
                  {product.features.slice(0, 5).map((feature, index) => (
                    <FeatureItem key={index}>{feature}</FeatureItem>
                  ))}
                </FeaturesList>
              </Features>
            )}

            {isAdmin ? (
              <AdminActions>
                <AdminButton onClick={handleAdminEdit}>
                  <FiEdit3 size={18} />
                  Edit Product
                </AdminButton>
                <AdminButton
                  danger
                  onClick={handleAdminDelete}
                  disabled={isDeleting}
                >
                  <FiTrash2 size={18} />
                  {isDeleting ? 'Removing...' : 'Delete Product'}
                </AdminButton>
              </AdminActions>
            ) : (
              <>
                <Actions>
                  <AddToCartButton
                    onClick={handleAddToCart}
                    disabled={!isAuthenticated}
                  >
                    <FiShoppingCart size={20} />
                    Add to Cart
                  </AddToCartButton>
                  <BuyNowButton
                    onClick={handleBuyNow}
                    disabled={!isAuthenticated}
                  >
                    Buy Now
                  </BuyNowButton>
                </Actions>

                {!isAuthenticated && (
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    Please sign in to purchase this item
                  </div>
                )}
              </>
            )}
          </ProductInfo>
        </ProductGrid>

        <ProductMeta>
          <MetaCard>
            <MetaIcon>
              <FiTruck size={24} />
            </MetaIcon>
            <MetaTitle>Fast Delivery</MetaTitle>
            <MetaDescription>Quick shipping to your location</MetaDescription>
          </MetaCard>
          <MetaCard>
            <MetaIcon>
              <FiShield size={24} />
            </MetaIcon>
            <MetaTitle>Quality Guarantee</MetaTitle>
            <MetaDescription>100% authentic products</MetaDescription>
          </MetaCard>
          <MetaCard>
            <MetaIcon>
              <FiStar size={24} />
            </MetaIcon>
            <MetaTitle>Expert Support</MetaTitle>
            <MetaDescription>Professional customer service</MetaDescription>
          </MetaCard>
        </ProductMeta>

        {product.longDescription && (
          <Description>
            <DescriptionTitle>Detailed Description</DescriptionTitle>
            <DescriptionText>{product.longDescription}</DescriptionText>
          </Description>
        )}
      </motion.div>
    </ProductContainer>
  );
};

export default ProductDetail;
