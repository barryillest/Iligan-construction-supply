import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTool, FiShield, FiTruck, FiStar } from 'react-icons/fi';

const HomeContainer = styled.div`
  min-height: calc(100vh - 70px);
`;

const HeroSection = styled.section`
  padding: 80px 20px 120px;
  text-align: center;
  background: linear-gradient(135deg, rgba(0, 149, 246, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%);
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
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
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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

const StatsSection = styled.section`
  padding: 40px 20px;
  background: var(--secondary-bg);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
`;

const StatsContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
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
        </HeroContent>
      </HeroSection>

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