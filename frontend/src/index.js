import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './index.css';

const paypalOptions = {
  'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test',
  currency: 'USD',
  intent: 'capture'
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PayPalScriptProvider options={paypalOptions}>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  fontSize: '14px'
                }
              }}
            />
          </CartProvider>
        </AuthProvider>
      </PayPalScriptProvider>
    </BrowserRouter>
  </React.StrictMode>
);