# Deployment Guide - Iligan Construction Supply

This guide will help you deploy your application for your thesis defense.

## Prerequisites

- GitHub account
- Render.com account (free tier is fine)
- Google Cloud Console account
- PayPal Developer account

---

## Step 1: Prepare Your Repository

1. **Ensure your code is pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify .env files are NOT in git:**
   ```bash
   git status
   # Should NOT show backend/.env or frontend/.env
   ```

---

## Step 2: Deploy to Render.com

### Option A: Using render.yaml (Recommended)

1. Go to [Render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click **"Apply"** to create both services

### Option B: Manual Deployment

**Backend Service:**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Configure:
   - **Name:** iligan-construction-backend
   - **Region:** Oregon (or closest)
   - **Branch:** main
   - **Root Directory:** Leave empty
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node server.js`
   - **Plan:** Free
4. Click **"Create Web Service"**

**Frontend Service:**
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repo
3. Configure:
   - **Name:** iligan-construction-frontend
   - **Branch:** main
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`
4. Click **"Create Static Site"**

---

## Step 3: Configure Environment Variables

### Backend Environment Variables

Go to your backend service → **Environment** tab → Add:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=<copy from your local backend/.env>
GOOGLE_CLIENT_ID=<your Google client ID>
GOOGLE_CLIENT_SECRET=<your Google client secret>
PAYPAL_CLIENT_ID=<your PayPal sandbox client ID>
PAYPAL_CLIENT_SECRET=<your PayPal sandbox secret>
PAYPAL_MODE=sandbox
FRONTEND_URL=<your frontend Render URL, e.g., https://iligan-construction-frontend.onrender.com>
ALLOWED_ORIGINS=<your frontend Render URL>
```

**Important URLs to note:**
- Your backend URL will be: `https://iligan-construction-backend.onrender.com`
- Your frontend URL will be: `https://iligan-construction-frontend.onrender.com`

### Frontend Environment Variables

Go to your frontend service → **Environment** tab → Add:

```
REACT_APP_API_URL=<your backend Render URL, e.g., https://iligan-construction-backend.onrender.com>
REACT_APP_GOOGLE_CLIENT_ID=<same as backend Google client ID>
REACT_APP_PAYPAL_CLIENT_ID=<same as backend PayPal client ID>
```

**Save and trigger a redeploy** after adding environment variables.

---

## Step 4: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one if needed)
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add Authorized JavaScript origins:
   - `https://iligan-construction-frontend.onrender.com` (your frontend URL)
   - `http://localhost:3000` (keep for local testing)
6. Add Authorized redirect URIs:
   - `https://iligan-construction-frontend.onrender.com` (your frontend URL)
   - `http://localhost:3000` (keep for local testing)
7. Click **Save**

---

## Step 5: Test Your Deployment

1. **Visit your frontend URL:** `https://iligan-construction-frontend.onrender.com`
2. **Test basic functionality:**
   - ✅ Can you see the homepage?
   - ✅ Can you register a new account?
   - ✅ Can you login with Google?
   - ✅ Can you browse products?
   - ✅ Can you add items to cart?
   - ✅ Can you access admin panel? (admin@gmail.com / admin123)

3. **Test PayPal checkout:**
   - Create a PayPal sandbox test account:
     - Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
     - Click **Sandbox** → **Accounts**
     - Use the test buyer account email/password
   - Add products to cart
   - Proceed to checkout
   - Login with sandbox buyer account
   - Complete test payment

---

## Step 6: Prepare for Defense

### Create Demo Accounts

1. **Admin Account:** admin@gmail.com / admin123
2. **Test Customer:** Create via registration or Google Sign-In
3. **PayPal Sandbox Buyer:** Use PayPal developer sandbox account

### Have Backup Plan

1. **Take screenshots** of key features working:
   - Login page
   - Product catalog
   - Shopping cart
   - Checkout flow
   - Admin dashboard
   - Order history

2. **Prepare talking points:**
   - Explain use of PayPal Sandbox for safe testing
   - Explain Google OAuth for secure authentication
   - Mention API integrations (Google, PayPal, product import)
   - Discuss database structure (SQLite for demo, can scale to PostgreSQL)

3. **Know your URLs:**
   - Frontend: https://your-app-name-frontend.onrender.com
   - Backend API: https://your-app-name-backend.onrender.com
   - API Health Check: https://your-app-name-backend.onrender.com/api/health

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Check JWT_SECRET is not empty

### CORS errors
- Verify ALLOWED_ORIGINS matches your frontend URL exactly
- Ensure no trailing slash in URLs

### Google Sign-In not working
- Check authorized origins in Google Console
- Verify GOOGLE_CLIENT_ID matches in both backend and frontend
- Check browser console for specific errors

### PayPal checkout fails
- Verify PAYPAL_MODE=sandbox
- Check FRONTEND_URL is set correctly for redirect URLs
- Ensure PayPal credentials are correct

### Database issues
- SQLite database is created automatically on first run
- Check backend logs for any migration errors
- Default admin should be created automatically

---

## Production Notes

**For Student Defense (Current Setup):**
- ✅ Using PayPal Sandbox (correct for demo)
- ✅ Using SQLite (fine for demo traffic)
- ✅ Free tier hosting (perfect for academic project)

**For Real Production (Future):**
- Switch PAYPAL_MODE to 'live' with production credentials
- Migrate from SQLite to PostgreSQL (Render offers free PostgreSQL)
- Implement proper logging and monitoring
- Add SSL/HTTPS (Render provides this automatically)
- Set up custom domain (optional)

---

## Quick Reference

### Important Files
- `backend/.env` - Backend environment config (local only)
- `frontend/.env` - Frontend environment config (local only)
- `backend/.env.example` - Template for backend env vars
- `frontend/.env.example` - Template for frontend env vars
- `render.yaml` - Render deployment configuration
- `DEPLOYMENT_GUIDE.md` - This file

### Admin Credentials (Default)
- Email: admin@gmail.com
- Password: admin123
- **Change this after deployment!**

### API Endpoints
- Health Check: `GET /api/health`
- Google Config: `GET /api/auth/google/config`
- Products: `GET /api/products`
- Login: `POST /api/auth/login`

---

## Support

If you encounter issues during deployment:

1. Check Render service logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test API health endpoint: `https://your-backend.onrender.com/api/health`
4. Check browser console for frontend errors
5. Ensure Google and PayPal credentials are valid

Good luck with your defense! 🎓
