# Iligan Construction Supply

A modern web application for construction supply management featuring a minimalist, Threads-inspired design. Built with React.js frontend and Node.js backend, integrating BestBuy API for product catalog, PayPal for payments, and Google Sign-In for authentication.

## Features

- 🏗️ **Construction Supply Catalog** - Browse products through BestBuy API integration
- 🔐 **Google Sign-In Authentication** - Secure user authentication
- 💳 **PayPal Payment Integration** - Secure sandbox payment processing
- 🛒 **Shopping Cart Management** - Add, remove, and manage cart items
- 📱 **Responsive Design** - Optimized for all device sizes
- 🎨 **Threads-Inspired UI** - Clean, minimalist design language
- 📦 **Order Management** - Track and view order history
- 👤 **User Profile Management** - Manage account settings

## Tech Stack

### Frontend
- React.js 18
- React Router DOM
- Styled Components
- Framer Motion (animations)
- Axios (HTTP client)
- React Hot Toast (notifications)
- PayPal React SDK

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Google OAuth 2.0
- PayPal REST SDK
- Helmet (security)
- CORS
- Rate Limiting

## API Integrations

1. **BestBuy API** - Product catalog and search functionality
2. **PayPal Sandbox API** - Payment processing
3. **Google Sign-In API** - User authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Developer Account (for OAuth)
- PayPal Developer Account (for payments)
- BestBuy Developer Account (for product API)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iligan-construction-supply
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   **Backend (.env)**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Fill in the required API keys and configuration:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - JWT secret key
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
   - `BESTBUY_API_KEY` - BestBuy API key
   - `PAYPAL_CLIENT_ID` - PayPal sandbox client ID
   - `PAYPAL_CLIENT_SECRET` - PayPal sandbox client secret

   **Frontend (.env)**
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   Fill in the required client-side configuration:
   - `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `REACT_APP_PAYPAL_CLIENT_ID` - PayPal sandbox client ID
   - `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

## API Setup Guide

### 1. Google Sign-In API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized domains: `localhost:3000` for development

### 2. PayPal Sandbox API
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create a sandbox application
3. Get client ID and secret from the app credentials
4. Use sandbox accounts for testing

### 3. BestBuy API
1. Go to [BestBuy Developer Portal](https://developer.bestbuy.com/)
2. Register for an API key
3. Use the key for product catalog access

## Project Structure

```
iligan-construction-supply/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Express server setup
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   └── App.js       # Main app component
└── README.md
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend server
- `npm run install-all` - Install dependencies for both frontend and backend

## Features Overview

### Authentication
- Google Sign-In integration
- JWT token-based authentication
- Secure user sessions

### Product Catalog
- Integration with BestBuy API
- Category filtering
- Search functionality
- Product details view

### Shopping Cart
- Add/remove items
- Quantity management
- Persistent cart (stored in database)

### Payment Processing
- PayPal sandbox integration
- Secure payment flow
- Order confirmation

### Order Management
- Order history
- Order status tracking
- Order details view

## Design Philosophy

The application follows a Threads-inspired design language featuring:
- Minimalist black and white color scheme
- Clean typography with Inter font family
- Subtle animations and transitions
- Mobile-first responsive design
- Intuitive navigation patterns

## Security Features

- Helmet.js for security headers
- Rate limiting on API endpoints
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Secure password handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.