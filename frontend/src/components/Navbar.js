import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiPackage, FiLogOut, FiTool } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const NavContainer = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  height: 70px;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const LogoImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent-color);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-hover);
    box-shadow: 0 4px 12px rgba(0, 149, 246, 0.3);
  }
`;

const LogoText = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  transition: color 0.3s ease;

  ${Logo}:hover & {
    color: var(--accent-color);
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: var(--text-secondary);
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 8px 12px;
  border-radius: 8px;

  &:hover, &.active {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  &.active::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const CartButton = styled(Link)`
  position: relative;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    background: var(--secondary-bg);
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--accent-color);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: var(--text-primary);
    background: var(--secondary-bg);
  }
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s ease;
  font-size: 14px;

  &:hover {
    background: var(--tertiary-bg);
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: var(--text-primary);
  background: none;
  border: none;
  border-radius: 8px;
  transition: background 0.2s ease;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  text-align: left;

  &:hover {
    background: var(--tertiary-bg);
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SignInButton = styled(Link)`
  color: var(--text-secondary);
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SignUpButton = styled(Link)`
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 149, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, var(--accent-hover), #0074cc);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 149, 246, 0.3);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    background: var(--secondary-bg);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const cartItemCount = getCartItemCount();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const isActiveLink = (path, matchPrefix = false) => {
    if (matchPrefix) {
      return location.pathname.startsWith(path) ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  return (
    <NavContainer
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <NavContent>
        <Logo to="/">
          <LogoImage src="/logo.png" alt="Iligan Construction Supply Logo" />
          <LogoText>Iligan Construction</LogoText>
        </Logo>

        <div style={{ flex: 1 }}></div>

        <NavActions>
          <NavLinks>
            <NavLink to="/" className={isActiveLink('/')}>
              Home
            </NavLink>
            <NavLink to="/products" className={isActiveLink('/products')}>
              Products
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={isActiveLink('/admin', true)}>
                Admin Panel
              </NavLink>
            )}
            <NavLink to="/about" className={isActiveLink('/about')}>
              About Us
            </NavLink>
          </NavLinks>
          {user && user.role !== 'admin' && (
            <CartButton to="/cart">
              <FiShoppingCart size={20} />
              {cartItemCount > 0 && (
                <CartBadge>{cartItemCount}</CartBadge>
              )}
            </CartButton>
          )}

          {user ? (
            <UserMenu>
              <UserButton
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatar ? (
                  <UserAvatar src={user.avatar} alt={user.name} />
                ) : (
                  <FiUser size={20} />
                )}
              </UserButton>

              {showUserMenu && (
                <DropdownMenu
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  <DropdownItem
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiUser size={16} />
                    Profile
                  </DropdownItem>
                  {user.role === 'admin' && (
                    <DropdownItem
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiTool size={16} />
                      Admin Panel
                    </DropdownItem>
                  )}
                  <DropdownItem
                    to="/orders"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiPackage size={16} />
                    Orders
                  </DropdownItem>
                  <DropdownButton onClick={handleLogout}>
                    <FiLogOut size={16} />
                    Logout
                  </DropdownButton>
                </DropdownMenu>
              )}
            </UserMenu>
          ) : (
            <AuthButtons>
              <SignInButton to="/login">Sign In</SignInButton>
              <SignUpButton to="/register">Sign Up</SignUpButton>
            </AuthButtons>
          )}

          <MobileMenuButton
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <FiX size={20} /> : <FiMenu size={20} />}
          </MobileMenuButton>
        </NavActions>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar;
