# Deployment Guide: Vercel + Render

Complete guide to deploy Campus Water Monitor to production.

---

## 🚀 Architecture

```
ESP32 → Backend (Render) → Frontend (Vercel)
```

- **Frontend (Vercel)**: Next.js dashboard - Free tier
- **Backend (Render)**: Express API + SQLite - Free tier
- **Database**: SQLite (persistent disk on Render)

---

## 📦 Part 1: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository: `water-usage-tracker-for-university`
3. Configure:
   - **Name**: `water-monitor-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=3001
DATABASE_PATH=/var/data/water_monitor.db
CORS_ORIGIN=https://your-frontend.vercel.app

# Tank configurations
TANK_CONFIG_HOSTEL_A=200:150
TANK_CONFIG_HOSTEL_B=200:150
TANK_CONFIG_ACADEMIC_BLOCK=300:200
TANK_CONFIG_ADMIN_BLOCK=150:100
TANK_CONFIG_CANTEEN=180:120
```

**Important**: Update `CORS_ORIGIN` after deploying frontend (Step 2)

### Step 4: Add Persistent Disk (for Database)

1. In your service, go to **Disks** tab
2. Click **Add Disk**
3. Configure:
   - **Name**: `water-monitor-data`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB` (free tier)
4. Click **Create**

### Step 5: Deploy

1. Click **Create Web Service**
2. Wait for deployment (2-3 minutes)
3. Your backend will be at: `https://water-monitor-backend.onrender.com`

### Step 6: Test Backend

```bash
# Health check
curl https://water-monitor-backend.onrender.com/health

# Test sensor endpoint
curl -X POST https://water-monitor-backend.onrender.com/api/water \
  -H "Content-Type: application/json" \
  -d '{"distance": 45.5, "percentage": 77.25, "volume": 386.25}'
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### Step 2: Import Project

1. Click **Add New** → **Project**
2. Import `water-usage-tracker-for-university`
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

### Step 3: Add Environment Variables

Click **Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://water-monitor-backend.onrender.com
```

**Important**: Use your actual Render backend URL from Step 1

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build (1-2 minutes)
3. Your frontend will be at: `https://water-usage-tracker-xxx.vercel.app`

### Step 5: Update Backend CORS

1. Go back to Render dashboard
2. Update `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://water-usage-tracker-xxx.vercel.app
   ```
3. Click **Save Changes**
4. Backend will auto-redeploy

---

## 🔧 Part 3: Update ESP32

Update your ESP32 firmware to use production backend:

```cpp
// Change this line:
const char* serverUrl = "https://water-monitor-backend.onrender.com/api/water";
```

Flash ESP32 and it will send data to production!

---

## ✅ Verification

### Test Complete Flow

1. **Backend Health**:
   ```bash
   curl https://water-monitor-backend.onrender.com/health
   ```

2. **Frontend Access**:
   - Open `https://your-frontend.vercel.app`
   - Should see dashboard

3. **ESP32 → Backend**:
   - Check ESP32 Serial Monitor
   - Should see successful POST responses

4. **Backend → Frontend**:
   - Dashboard should show real-time data
   - Check sensor status cards

---

## 🎯 Custom Domain (Optional)

### For Frontend (Vercel)

1. In Vercel project settings → **Domains**
2. Add your domain: `water-monitor.yourdomain.com`
3. Update DNS records as instructed
4. Update backend CORS_ORIGIN

### For Backend (Render)

1. In Render service → **Settings** → **Custom Domain**
2. Add: `api.yourdomain.com`
3. Update DNS records
4. Update frontend API_URL

---

## 📊 Monitoring

### Vercel Dashboard

- **Analytics**: View page visits
- **Logs**: Check build and runtime logs
- **Deployments**: See deployment history

### Render Dashboard

- **Metrics**: CPU, Memory usage
- **Logs**: View API requests
- **Events**: Deployment history

---

## 💰 Free Tier Limits

### Vercel (Free)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN

### Render (Free)
- ✅ 750 hours/month (enough for 1 service)
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start: 30-60 seconds
- ✅ 1 GB persistent disk

**Note**: Free tier backend sleeps after inactivity. First request after sleep takes 30-60s.

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel: Auto-deploys frontend
# Render: Auto-deploys backend
```

---

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

**Check**:
1. `NEXT_PUBLIC_API_URL` is correct
2. Backend CORS_ORIGIN includes frontend URL
3. Backend is running (not sleeping)

**Fix**:
```bash
# Wake up backend
curl https://water-monitor-backend.onrender.com/health
```

### ESP32 Can't Connect

**Check**:
1. ESP32 `serverUrl` uses HTTPS
2. Backend is deployed and running
3. WiFi credentials are correct

**Test**:
```bash
curl -X POST https://water-monitor-backend.onrender.com/api/water \
  -H "Content-Type: application/json" \
  -d '{"distance": 45.5, "percentage": 77.25, "volume": 386.25}'
```

### Database Not Persisting

**Check**:
1. Persistent disk is mounted at `/var/data`
2. `DATABASE_PATH=/var/data/water_monitor.db`
3. Disk has sufficient space

### Build Failures

**Frontend (Vercel)**:
```bash
# Check build logs in Vercel dashboard
# Common fix: Clear cache and redeploy
```

**Backend (Render)**:
```bash
# Check if package.json has "build" script
# Ensure all dependencies are in package.json
```

---

## 📈 Upgrade Options

### When to Upgrade

**Vercel Pro ($20/month)**:
- More bandwidth
- Advanced analytics
- Team collaboration

**Render Starter ($7/month)**:
- No sleep (always on)
- Faster cold starts
- More resources

---

## 🎉 You're Live!

Your production URLs:
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://water-monitor-backend.onrender.com`
- **GitHub**: `https://github.com/Rudra-choudhary/water-usage-tracker-for-university`

Share your dashboard with the world! 🌍

---

## 📝 Quick Reference

```bash
# Frontend URL (update this)
https://your-frontend.vercel.app

# Backend URL (update this)
https://water-monitor-backend.onrender.com

# ESP32 Configuration
const char* serverUrl = "https://water-monitor-backend.onrender.com/api/water";

# Environment Variables
NEXT_PUBLIC_API_URL=https://water-monitor-backend.onrender.com
CORS_ORIGIN=https://your-frontend.vercel.app
```

---

**Need help?** Check deployment logs in respective dashboards!
