import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTool, FiShield, FiTruck, FiStar } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const HomeContainer = styled.div`
  min-height: calc(100vh - 70px);
  width: 100%;
`;

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 70px);
  width: 100%;
  padding: 140px 24px 120px;
  text-align: center;
  background: linear-gradient(135deg, rgba(0, 149, 246, 0.12) 0%, rgba(0, 0, 0, 0.92) 100%);

  @media (max-width: 1024px) {
    padding: 120px 20px 100px;
  }

  @media (max-width: 768px) {
    padding: 120px 16px 80px;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary);
  line-height: 1.2;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
`;

const CTAButton = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  padding: 20px 36px;
  border-radius: 16px;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 600;
  min-height: 60px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 149, 246, 0.3);

  &:hover {
    background: linear-gradient(135deg, var(--accent-hover), #0074cc);
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(0, 149, 246, 0.4);
  }
`;

const FeaturesSection = styled.section`
  padding: 80px 20px;
  background: var(--primary-bg);
  width: 100%;

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 64px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
`;

const FeatureCard = styled(motion.div)`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-color);
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  background: var(--accent-color);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
`;

const FeatureDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
`;

const ProductsSection = styled.section`
  padding: 80px 20px;
  background: var(--primary-bg);
  width: 100%;

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const ProductsWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

const ProductCard = styled(motion(Link))`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  text-decoration: none;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-color);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  background: var(--tertiary-bg);
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const ProductName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-color);
`;

const ProductDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductsLoading = styled.div`
  margin-top: 40px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
`;

const ProductsMessage = styled.div`
  margin-top: 40px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
`;

const StatsSection = styled.section`
  padding: 40px 20px;
  background: var(--primary-bg);
  border-top: 1px solid #000000;
  border-bottom: 1px solid #000000;
  width: 100%;

  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

const StatsContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  text-align: center;
`;

const StatItem = styled(motion.div)`
  padding: 10px;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchAllProducts = async () => {
      setLoadingProducts(true);
      setProductError('');

      try {
        let page = 1;
        const pageSize = 100;
        let shouldContinue = true;
        const aggregated = [];
        const maxPages = 50;
        let iterations = 0;

        while (shouldContinue && iterations < maxPages) {
          const response = await axios.get(`${API_URL}/api/products`, {
            params: { page, limit: pageSize, sort: 'name' }
          });

          iterations += 1;

          const fetched = response?.data?.products ?? [];
          const pagination = response?.data?.pagination ?? {};

          aggregated.push(...fetched);

          if (pagination?.hasMore && fetched.length > 0) {
            page += 1;
          } else {
            shouldContinue = false;
          }
        }

        if (isMounted) {
          const uniqueProducts = Array.from(
            new Map(
              aggregated.map((item, index) => [
                item.sku || `${item.name || 'product'}-${index}`,
                item
              ])
            ).values()
          );
          uniqueProducts.sort((a, b) =>
            (a.name || '').localeCompare(b.name || '')
          );
          setProducts(uniqueProducts);
        }
      } catch (error) {
        console.error('Failed to load products for home page', error);
        if (isMounted) {
          setProductError('Unable to load products right now. Please try again shortly.');
        }
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    };

    fetchAllProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (value) => {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const features = [
    {
      icon: <FiTool size={28} />,
      title: 'Quality Tools & Equipment',
      description: 'Professional-grade construction tools and equipment from trusted brands, sourced through BestBuy\'s extensive catalog.'
    },
    {
      icon: <FiShield size={28} />,
      title: 'Secure Payments',
      description: 'Safe and secure transactions with PayPal integration, protecting your payment information with industry-standard security.'
    },
    {
      icon: <FiTruck size={28} />,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your construction site, ensuring your projects stay on schedule.'
    },
    {
      icon: <FiStar size={28} />,
      title: 'Expert Support',
      description: 'Dedicated customer support team ready to help you find the right materials for your construction needs.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Products Available' },
    { number: '500+', label: 'Happy Customers' },
    { number: '24/7', label: 'Customer Support' },
    { number: '100%', label: 'Secure Payments' }
  ];

  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Build Better with Iligan Construction Supply
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your trusted partner for quality construction materials, tools, and equipment.
            From small repairs to major projects, we have everything you need.
          </HeroSubtitle>
          {(!user || user.role !== 'admin') && (
            <CTAButton
              to="/products"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiTool size={20} />
              Shop Now
            </CTAButton>
          )}
        </HeroContent>
      </HeroSection>

      <ProductsSection>
        <ProductsWrapper>
          <SectionTitle>All Products</SectionTitle>
          <SectionSubtitle>
            Explore every item we offer without leaving the home page.
          </SectionSubtitle>

          {loadingProducts && (
            <ProductsLoading>Loading products...</ProductsLoading>
          )}

          {!loadingProducts && productError && (
            <ProductsMessage>{productError}</ProductsMessage>
          )}

          {!loadingProducts && !productError && products.length === 0 && (
            <ProductsMessage>No products available right now. Please check back soon.</ProductsMessage>
          )}

          {!loadingProducts && !productError && products.length > 0 && (
            <ProductsGrid>
              {products.map((product, index) => (
                <ProductCard
                  key={product.sku || product.id || `${product.name}-${index}`}
                  to={product.sku ? `/products/${product.sku}` : '/products'}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.02, 0.4) }}
                >
                  <ProductImage
                    src={product.image || '/placeholder-image.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductPrice>{formatPrice(product.salePrice)}</ProductPrice>
                    {product.shortDescription && (
                      <ProductDescription>{product.shortDescription}</ProductDescription>
                    )}
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          )}
        </ProductsWrapper>
      </ProductsSection>

      <FeaturesSection>
        <FeaturesContainer>
          <SectionTitle>Why Choose Iligan Construction?</SectionTitle>
          <SectionSubtitle>
            We provide comprehensive construction solutions with quality products,
            competitive prices, and exceptional service.
          </SectionSubtitle>

          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>

      <StatsSection>
        <StatsContainer>
          <SectionTitle>Trusted by Professionals</SectionTitle>
          <StatsGrid>
            {stats.map((stat, index) => (
              <StatItem
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StatNumber>{stat.number}</StatNumber>
                <StatLabel>{stat.label}</StatLabel>
              </StatItem>
            ))}
          </StatsGrid>
        </StatsContainer>
      </StatsSection>
    </HomeContainer>
  );
};

export default Home;
