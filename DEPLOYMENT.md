# 🚀 Quizzy Deployment & Persistence Guide

This guide explains:
1. **How Data Persistence Works** (Never lose data on server restarts).
2. **How to Deploy Backend & Frontend for Free** (Render, Vercel, MongoDB Atlas).

---

## 💾 1. Data Persistence (No Data Loss on Restart)

Quizzy now supports **two seamless layers of data persistence**:

### A. Local / Fallback Persistent File Storage (Zero Setup, Active by Default)
- All quizzes, registered students, test attempts, results, scores, and audit logs are automatically saved to:
  ```
  server/data/quizzy_store.json
  ```
- **When the server restarts or reloads**, the data is **NOT reset**. Everything reloads from the persistent file immediately.
- Default demo accounts:
  - **Admin**: `admin@quizzy.io` / `admin123`
  - **Student**: `student@quizzy.io` / `user123`

### B. Production Cloud Database (MongoDB Atlas)
- In production, set the `MONGO_URI` environment variable with your MongoDB Atlas connection string.
- If connected, Quizzy uses MongoDB Atlas. If Atlas is temporarily unreachable, Quizzy safely falls back to persistent file storage so your app never crashes.

---

## ☁️ 2. Free Cloud Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Click **Build a Database** and select the **FREE (M0)** tier.
3. Under **Security Quickstart**:
   - Create a database user (e.g. `quizzy_admin` and set a password).
   - Under **Where would you like to connect from?**, select **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Connect** -> **Drivers (Node.js)**.
5. Copy the connection string:
   ```
   mongodb+srv://quizzy_admin:<password>@cluster0.xxxxx.mongodb.net/quizzes?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your database password).*

---

## 🌐 3. Deployment Options

### Recommended Stack:
- **Backend**: [Render](https://render.com) (Free Node Web Service)
- **Frontend**: [Vercel](https://vercel.com) (Free Vite/React Static Hosting)
- **Database**: MongoDB Atlas (Free M0)

---

### Step A: Deploy Backend on Render

1. Push your code to GitHub.
2. Log in to [Render](https://dashboard.render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:
   - **Name**: `quizzy-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
6. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `JWT_SECRET` | *(Any long random secure string)* |
   | `MONGO_URI` | *(Your MongoDB Atlas connection string)* |
   | `CLIENT_URL` | *(Leave empty for now or put your frontend URL once deployed)* |
7. Click **Deploy Web Service**.
8. Note your backend URL (e.g., `https://quizzy-api.onrender.com`).

---

### Step B: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client`
5. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE` | `https://quizzy-api.onrender.com/api` *(Your Render backend URL with `/api`)* |
6. Click **Deploy**.
7. Vercel will build and launch your application!
8. Copy your Vercel URL (e.g. `https://quizzy-web.vercel.app`) and update `CLIENT_URL` on Render if you want strict CORS.

---

### Alternative: 1-Click Blueprint on Render

The repository includes a `render.yaml` blueprint.
1. In Render Dashboard, click **New +** -> **Blueprint**.
2. Connect your repo.
3. Render will automatically configure both the backend web service (`quizzy-api`) and frontend static site (`quizzy-web`).
4. Fill in the environment variables:
   - `MONGO_URI` on `quizzy-api`
   - `VITE_API_BASE` on `quizzy-web` (`https://<your-quizzy-api>.onrender.com/api`)
5. Click **Apply**.

---

## 🛠️ Local Verification

To run both services locally with full persistence:

```bash
# Terminal 1 - Start Server
cd server
npm run dev

# Terminal 2 - Start Client
cd client
npm run dev
```

Any changes made in the app (quizzes created, test attempts, results) will remain saved in `server/data/quizzy_store.json` even if you restart the server.

---

## ⏰ 4. Keeping Render Free Server Active (Prevent 15-Minute Sleep / Cold Starts)

Render's free tier spins down web services after **15 minutes of inactivity**, which causes a ~50-second cold start delay on the next visit.

Quizzy provides **two automatic ways to keep your Render server awake 24/7**:

### Option 1: Automatic Server Self-Ping (Built-in)
- Located in: [`server/src/utils/keepAlive.ts`](file:///server/src/utils/keepAlive.ts)
- **How it works**: When deployed to Render, the server automatically detects `RENDER_EXTERNAL_URL` (e.g., `https://quizzy-api.onrender.com`) and sends a lightweight HTTP ping to `/api/health` every 12 minutes.
- **Render traffic counted**: Inbound HTTPS requests to your public domain reset Render's 15-minute inactivity counter.
- **Configuration (Optional)**:
  - `SERVER_URL`: Set your backend URL if deploying to a custom domain.
  - `ENABLE_KEEP_ALIVE`: Set to `false` if you wish to disable this feature.
  - `KEEP_ALIVE_INTERVAL_MINUTES`: Default is `12` minutes.

### Option 2: GitHub Actions Scheduled Cron (External & 100% Free)
- Located in: [`.github/workflows/render-keepalive.yml`](file:///.github/workflows/render-keepalive.yml)
- **Why this is best**: If the server ever goes to sleep (e.g., after downtime or maintenance), an internal timer is asleep. A GitHub Action runs externally on GitHub's servers every 14 minutes to ping your health endpoint and wake the instance up!
- **How to activate**:
  1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
  2. Click **New repository secret**.
  3. Name: `RENDER_SERVER_URL`
  4. Value: Your deployed Render API URL (e.g. `https://quizzy-api.onrender.com`).
  5. *(Optional)* You can also test it immediately under the **Actions** tab by selecting **Render Server Keep-Alive Cron** -> **Run workflow**.

### Option 3: Free Web Monitor (cron-job.org or UptimeRobot)
If you prefer an external third-party dashboard:
1. Go to [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com).
2. Create a free monitor/cron job.
3. Target URL: `https://<your-render-app>.onrender.com/api/health`
4. Schedule: Every **10** or **12 minutes**.

