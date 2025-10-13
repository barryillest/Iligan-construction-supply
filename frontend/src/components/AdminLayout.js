import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiBox, FiPackage } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const LayoutShell = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--primary-bg);
  color: var(--text-primary);
`;

const Sidebar = styled.aside`
  width: 260px;
  background: rgba(10, 10, 10, 0.92);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
  gap: 32px;

  @media (max-width: 960px) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SidebarTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
`;

const SidebarSubtitle = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SidebarLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: var(--accent-color);
    color: white;
    box-shadow: 0 8px 20px rgba(0, 149, 246, 0.25);
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(12, 12, 12, 0.85);
  backdrop-filter: blur(12px);

  @media (max-width: 960px) {
    padding: 20px;
  }
`;

const TopBarTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h2 {
    font-size: 22px;
    font-weight: 700;
    margin: 0;
  }

  span {
    font-size: 14px;
    color: var(--text-secondary);
  }
`;

const MobileNotice = styled.div`
  display: none;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 13px;

  @media (max-width: 960px) {
    display: block;
  }
`;

const ContentInner = styled.main`
  padding: 32px;
  flex: 1;
  background: var(--primary-bg);

  @media (max-width: 960px) {
    padding: 20px;
  }
`;

const MobileNav = styled.nav`
  display: none;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(12, 12, 12, 0.85);
  backdrop-filter: blur(12px);

  @media (max-width: 960px) {
    display: flex;
    gap: 8px;
  }
`;

const MobileNavButton = styled(NavLink)`
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  text-decoration: none;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background: var(--accent-color);
    color: white;
  }
`;

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const sectionTitle = location.pathname.startsWith('/admin/products')
    ? 'Product Catalog'
    : 'Dashboard Overview';

  return (
    <LayoutShell>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>Admin Console</SidebarTitle>
          <SidebarSubtitle>Manage products & inventory</SidebarSubtitle>
        </SidebarHeader>

        <SidebarNav>
          <SidebarLink end to="/admin">
            <FiBox size={18} />
            Dashboard
          </SidebarLink>
          <SidebarLink to="/admin/products">
            <FiPackage size={18} />
            Products & Stock
          </SidebarLink>
        </SidebarNav>
      </Sidebar>

      <ContentWrapper>
        <TopBar>
          <TopBarTitle>
            <h2>{sectionTitle}</h2>
            <span>Signed in as {user.name}</span>
          </TopBarTitle>
        </TopBar>

        <MobileNotice>
          You are in the admin console. Use the buttons below to manage products or update stock.
        </MobileNotice>

        <MobileNav>
          <MobileNavButton end to="/admin">
            Dashboard
          </MobileNavButton>
          <MobileNavButton to="/admin/products">
            Products
          </MobileNavButton>
        </MobileNav>

        <ContentInner>
          <Outlet />
        </ContentInner>
      </ContentWrapper>
    </LayoutShell>
  );
};

export default AdminLayout;
