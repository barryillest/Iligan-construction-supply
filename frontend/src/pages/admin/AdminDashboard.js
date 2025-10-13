import React from 'react';
import styled from 'styled-components';
import { FiPackage, FiTrendingUp, FiLayers } from 'react-icons/fi';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const HeroCard = styled.div`
  padding: 32px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(0, 149, 246, 0.16), rgba(0, 149, 246, 0.05));
  border: 1px solid rgba(0, 149, 246, 0.35);
  box-shadow: 0 20px 40px rgba(0, 149, 246, 0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HeroTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const HeroSubtitle = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background: var(--secondary-bg);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  color: var(--accent-color);
  font-size: 20px;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.span`
  font-size: 26px;
  font-weight: 700;
`;

const QuickActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuickActionCard = styled.div`
  border-radius: 16px;
  border: 1px dashed var(--border-color);
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const QuickActionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const QuickActionDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
`;

const AdminDashboard = () => (
  <DashboardContainer>
    <HeroCard>
      <HeroTitle>Welcome to the Iligan Construction admin console</HeroTitle>
      <HeroSubtitle>
        Manage your product catalog, keep stock levels accurate, and publish updated pricing for customers in real time.
        Use the products workspace to add new items, adjust inventory counts, and upload refreshed product imagery.
      </HeroSubtitle>
    </HeroCard>

    <DashboardGrid>
      <StatCard>
        <StatIcon>
          <FiPackage />
        </StatIcon>
        <StatLabel>Product management</StatLabel>
        <StatValue>Catalog tools</StatValue>
        <HeroSubtitle>View every item currently available in the store and keep descriptions current.</HeroSubtitle>
      </StatCard>
      <StatCard>
        <StatIcon>
          <FiLayers />
        </StatIcon>
        <StatLabel>Inventory</StatLabel>
        <StatValue>Stock control</StatValue>
        <HeroSubtitle>Adjust on-hand quantities instantly so shoppers always see up-to-date availability.</HeroSubtitle>
      </StatCard>
      <StatCard>
        <StatIcon>
          <FiTrendingUp />
        </StatIcon>
        <StatLabel>Pricing</StatLabel>
        <StatValue>Flexible rates</StatValue>
        <HeroSubtitle>Respond to supplier changes quickly by editing sale and regular prices per SKU.</HeroSubtitle>
      </StatCard>
    </DashboardGrid>

    <QuickActions>
      <QuickActionCard>
        <QuickActionTitle>Ready to add or update products?</QuickActionTitle>
        <QuickActionDescription>
          Head over to the <strong>Products & Stock</strong> section to create new catalog entries, upload product images,
          or adjust existing pricing and quantities. All updates apply immediately to the customer storefront.
        </QuickActionDescription>
      </QuickActionCard>
    </QuickActions>
  </DashboardContainer>
);

export default AdminDashboard;
