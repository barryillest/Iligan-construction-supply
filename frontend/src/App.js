import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './contexts/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--primary-bg);
  color: var(--text-primary);
`;

const MainContent = styled(motion.main)`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
`;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

function App() {
  const { user } = useAuth();

  return (
    <AppContainer>
      <Navbar />
      <MainContent
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:sku" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={user ? <Cart /> : <Login />} />
          <Route path="/checkout" element={user ? <Checkout /> : <Login />} />
          <Route path="/orders" element={user ? <Orders /> : <Login />} />
          <Route path="/profile" element={user ? <Profile /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;
