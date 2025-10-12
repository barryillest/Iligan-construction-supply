import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiEdit3, FiLogOut, FiShield } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ProfileContainer = styled.div`
  padding: 40px 20px;
  max-width: 800px;
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

const ProfileCard = styled(motion.div)`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--accent-color);
`;

const AvatarPlaceholder = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: 700;
  border: 3px solid var(--accent-color);
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const UserEmail = styled.div`
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const UserRole = styled.div`
  padding: 6px 12px;
  background: var(--accent-color);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const InfoCard = styled.div`
  background: var(--tertiary-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const InfoIcon = styled.div`
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

const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-color);
`;

const ActionsSection = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--tertiary-bg);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--secondary-bg);
    border-color: var(--accent-color);
  }

  &.logout {
    border-color: var(--error-color);
    color: var(--error-color);

    &:hover {
      background: var(--error-color);
      color: white;
    }
  }
`;

const SecuritySection = styled(motion.div)`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SecurityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
`;

const SecurityInfo = styled.div``;

const SecurityLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const SecurityDescription = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(0, 214, 143, 0.2);
  color: var(--success-color);
  border: 1px solid var(--success-color);
`;

const Profile = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return null;
  }

  return (
    <ProfileContainer>
      <Header>
        <Title>My Profile</Title>
        <Subtitle>Manage your account settings and preferences</Subtitle>
      </Header>

      <ProfileCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <UserSection>
          <AvatarContainer>
            {user.avatar ? (
              <Avatar src={user.avatar} alt={user.name} />
            ) : (
              <AvatarPlaceholder>
                {getInitials(user.name)}
              </AvatarPlaceholder>
            )}
          </AvatarContainer>
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserEmail>
              <FiMail size={16} />
              {user.email}
            </UserEmail>
            <UserRole>{user.role}</UserRole>
          </UserInfo>
        </UserSection>

        <InfoGrid>
          <InfoCard>
            <InfoIcon>
              <FiCalendar size={24} />
            </InfoIcon>
            <InfoTitle>Member Since</InfoTitle>
            <InfoValue>{formatDate(user.createdAt || new Date())}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoIcon>
              <FiUser size={24} />
            </InfoIcon>
            <InfoTitle>Cart Items</InfoTitle>
            <InfoValue>{getCartItemCount()}</InfoValue>
          </InfoCard>
        </InfoGrid>

        <ActionsSection>
          <ActionButton>
            <FiEdit3 size={16} />
            Edit Profile
          </ActionButton>
          <ActionButton className="logout" onClick={handleLogout}>
            <FiLogOut size={16} />
            Logout
          </ActionButton>
        </ActionsSection>
      </ProfileCard>

      <SecuritySection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <SectionTitle>
          <FiShield size={24} />
          Security & Privacy
        </SectionTitle>

        <SecurityItem>
          <SecurityInfo>
            <SecurityLabel>Google Account</SecurityLabel>
            <SecurityDescription>
              Your account is secured with Google Sign-In
            </SecurityDescription>
          </SecurityInfo>
          <StatusBadge>Verified</StatusBadge>
        </SecurityItem>

        <SecurityItem>
          <SecurityInfo>
            <SecurityLabel>Account Status</SecurityLabel>
            <SecurityDescription>
              Your account is active and in good standing
            </SecurityDescription>
          </SecurityInfo>
          <StatusBadge>Active</StatusBadge>
        </SecurityItem>

        <SecurityItem>
          <SecurityInfo>
            <SecurityLabel>Payment Security</SecurityLabel>
            <SecurityDescription>
              All payments are processed securely through PayPal
            </SecurityDescription>
          </SecurityInfo>
          <StatusBadge>Secure</StatusBadge>
        </SecurityItem>
      </SecuritySection>
    </ProfileContainer>
  );
};

export default Profile;