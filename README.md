# ⚡ EliteApps BD — Cloudflare Pages Edition

Full-stack e-commerce built with Next.js 14, fully compatible with **Cloudflare Pages Edge Runtime**.

---

## 🔑 What's Different From the Vercel Version

| Feature | Vercel Version | This Version |
|---|---|---|
| Database | Mongoose (Node.js) | MongoDB Data API (Edge) |
| Email | Nodemailer (Node.js) | Resend API (Edge) |
| Password hashing | bcryptjs (Node.js) | Web Crypto API (Edge) |
| Runtime | Node.js | Edge Runtime |

---

## 📋 Required External Services (Free)

Before deploying, you need API keys from **2 services**:

### 1 — MongoDB Data API
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Left sidebar → **App Services**
3. Click **Create a New App** → name it `eliteapps` → choose your cluster → Create 
4. In the App, go to **HTTPS Endpoints** → **Data API** → Enable
5. Go to **Authentication** → **API Keys** → Generate API Key
6. Copy your **App ID** (looks like `data-abcde`) and **API Key**

### 2 — Resend (Free email API)
1. Go to [resend.com](https://resend.com) → Sign up free
2. Go to **API Keys** → **Create API Key** → Full access
3. Copy the API key (starts with `re_`)
4. **Important**: Add and verify your domain, OR use `onboarding@resend.dev` as the from address (free tier allows this for testing)

---

## ⚙️ Environment Variables

Add these to Cloudflare Pages → Settings → Environment Variables:

```env
# NextAuth
NEXTAUTH_URL=https://your-app.pages.dev
NEXTAUTH_SECRET=eliteapps-bd-super-secret-key-2024

# Google OAuth
GOOGLE_CLIENT_ID=(set in Cloudflare environment variables)
GOOGLE_CLIENT_SECRET=(set in Cloudflare environment variables)
# MongoDB Data API
MONGODB_DATA_API_KEY=your_mongodb_api_key_here
MONGODB_APP_ID=data-xxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=dpgtztt3o
CLOUDINARY_API_KEY=112224724456546
CLOUDINARY_API_SECRET=ELDMTGOzz0XJJAfPxes0BbQZ6WE
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpgtztt3o
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=website

# Resend Email
RESEND_API_KEY=re_your_key_here
RESEND_FROM=EliteApps BD <onboarding@resend.dev>
EMAIL_ADMIN=arghoroy339@gmail.com

# Admin
ADMIN_EMAIL=argho5691@gmail.com
ADMIN_PASSWORD=Argho@12345

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.pages.dev
```

---

## 🚀 Deploy to Cloudflare Pages

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/eliteapps-cf.git
git push -u origin main
```

### Step 2 — Cloudflare Pages Setup
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your repo → **Begin setup**

### Step 3 — Build Settings
| Setting | Value |
|---|---|
| Framework preset | `Next.js` |
| Build command | `npx @cloudflare/next-on-pages@1` |
| Build output directory | `.vercel/output/static` |
| Node.js version | `18` |

### Step 4 — Add Environment Variables
Add all variables from the list above.

### Step 5 — Compatibility Flag
After first deploy:
- Go to **Settings** → **Functions** → **Compatibility flags**
- Add: `nodejs_compat`
- Redeploy

---

## 🔐 Admin Access

- **URL**: `/admin`
- **Email**: `argho5691@gmail.com`
- **Password**: `Argho@12345`

---

## 💳 Payment Methods

bKash, Nagad, Rocket, Upay — all manual with transaction ID verification.

- **Number**: 01707776676

---

## 📞 Support

- **WhatsApp**: 01707776676 (Message only)
- **Email**: arghoroy339@gmail.com
