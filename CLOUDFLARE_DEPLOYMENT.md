# 🚀 Cloudflare Pages Deployment Guide

## EliteAppsBD AI Product Importer on Cloudflare Pages

This guide walks you through deploying the AI Product Importer to Cloudflare Pages.

---

## 📋 Prerequisites

1. **GitHub Account** - Repository already set up ✓
2. **Cloudflare Account** - https://dash.cloudflare.com (free tier works)
3. **Domain or Subdomain** - Optional, Cloudflare provides free `.pages.dev` domain
4. **Environment Variables Ready** - See `.env.example`

---

## 🔑 Step 1: Set Up Environment Variables

### On Cloudflare Pages Dashboard:

1. Go to https://dash.cloudflare.com → Pages
2. Select your project: **EliteAppsBD**
3. Click **Settings** → **Environment Variables**
4. Add these variables for **Production** environment:

```
OPENROUTER_API_KEY = sk-or-v1-your_key_here
OPENROUTER_MODEL = google/gemini-2.5-flash
DATABASE_URL = your_neon_postgres_url
ADMIN_EMAIL = admin@example.com
ADMIN_PASSWORD = your_secure_password
GOOGLE_CLIENT_ID = your_google_client_id
GOOGLE_CLIENT_SECRET = your_google_client_secret
NEXTAUTH_SECRET = your_nextauth_secret_64_char_hex
```

### Getting NEXTAUTH_SECRET:

```bash
# Generate a secure 32-byte hex string
openssl rand -hex 32
# Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 🔗 Step 2: Connect GitHub Repository

### Automatic Deployment Setup:

1. Go to **Cloudflare Pages**
2. Click **Create a project** → **Connect to Git**
3. Authorize Cloudflare to access GitHub
4. Select repository: **argho1863-web/EliteAppsBD**
5. Select branch: **main**
6. Click **Begin setup**

### Build Configuration:

Cloudflare will auto-detect Next.js. Configure as follows:

| Setting | Value |
|---------|-------|
| **Framework preset** | Next.js |
| **Build command** | `npm run build` |
| **Build output directory** | `.next` |
| **Root directory** | `/` |
| **Environment** | Node.js 18.x or later |

---

## 🛠️ Step 3: Configure Build Settings

### In Cloudflare Pages Settings:

1. **Builds & deployments** → **Build configuration**
   - Build command: `npm run build`
   - Output directory: `.next`

2. **Build cache** → Enable for faster builds

3. **Function settings** (if available):
   - Compatibility date: `2024-06-19`
   - Node.js compatibility: **Enabled**

4. **Compatibility flags**:
   - ✓ `nodejs_compat`
   - ✓ `streams_enable_constructors`

---

## ✅ Step 4: Deploy

### Automatic Deployment:

Once connected, Cloudflare automatically deploys when you push to `main`:

```bash
# Push changes to GitHub
git push origin main

# Cloudflare automatically builds and deploys
# Monitor at: https://dash.cloudflare.com → Pages → EliteAppsBD
```

### Manual Deployment:

In Cloudflare Pages dashboard:
1. Go to **Deployments**
2. Click **Retry** on any deployment
3. Or connect new branch

---

## 🌐 Step 5: Configure Custom Domain (Optional)

### Connect Your Domain:

1. In Cloudflare Pages → **Custom domains**
2. Add your domain:
   - **eliteappsbd.com** (if you own it)
   - Or use Cloudflare DNS: **eliteappsbd.pages.dev** (free)

3. Update DNS records (if using custom domain):
   ```
   Type: CNAME
   Name: eliteappsbd
   Content: eliteappsbd.pages.dev
   Proxied: Yes (orange cloud)
   ```

---

## 🧪 Step 6: Verify Deployment

### Check Deployment Status:

1. Visit Cloudflare Pages dashboard
2. Look for green checkmark ✓ on latest deployment
3. Click deployment to see logs

### Test Your Application:

```bash
# For Cloudflare Pages domain:
curl https://eliteappsbd.pages.dev/api/products

# For custom domain:
curl https://eliteappsbd.com/api/products
```

### Test Admin Panel:

1. Open: `https://eliteappsbd.pages.dev/admin`
2. Log in with credentials:
   - Email: `ADMIN_EMAIL` from env vars
   - Password: `ADMIN_PASSWORD` from env vars
3. Click "AI Importer"
4. Try importing a test product

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Logs location:** Cloudflare Pages → Deployments → [Your Deployment] → View build log

**Common causes:**
- Missing environment variables
- Node.js version mismatch
- Dependency installation failure

**Solution:**
```bash
# Verify locally first
npm install
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Issue: "Function Timed Out"

**Symptom:** AI import takes too long (>60 seconds)

**Solution:** Increase timeout in `app/api/admin/import/route.ts`:
```typescript
export const maxDuration = 120; // Increase to 120 seconds
```

Then redeploy.

### Issue: "Database Connection Failed"

**Check:**
- DATABASE_URL is set in Cloudflare environment
- Neon database allows connections from Cloudflare IPs
- Connection string is correct format

**Add IP whitelist:**
1. Go to Neon console
2. Add Cloudflare IP range:
   - All Cloudflare IPs or specific ones

### Issue: "OpenRouter API Error"

**Check:**
- `OPENROUTER_API_KEY` is set
- API key has proper permissions
- You have API credits

**Test locally:**
```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"google/gemini-2.5-flash","messages":[{"role":"user","content":"test"}]}'
```

---

## 📊 Monitoring & Logs

### View Logs:

1. **Deployment logs:** Cloudflare Pages → Deployments → [Version] → View Build Log
2. **Function logs:** Check real-time in Cloudflare Workers dashboard
3. **Error tracking:** Set up Sentry or similar

### Monitor Performance:

- Cloudflare Pages → Analytics
- Monitor:
  - Request counts
  - Response times
  - Error rates
  - Geographic distribution

---

## 🔄 Continuous Deployment

### Automatic Updates:

Every time you push to `main`:
1. GitHub receives push
2. Cloudflare Pages webhook triggers
3. Build starts automatically
4. Deploy on success
5. Rollback on failure

### Rollback:

If something breaks:
1. Go to **Deployments**
2. Find previous successful deployment
3. Click **Rollback to this deployment**

---

## 🔐 Security Best Practices

### Environment Variables:

✅ **DO:**
- Use unique, strong passwords
- Rotate API keys periodically
- Use Cloudflare's built-in secret management
- Enable 2FA on your Cloudflare account

❌ **DON'T:**
- Commit `.env.local` to GitHub (it's in `.gitignore`)
- Share API keys
- Use same password for multiple services
- Push secrets to main branch

### Database Security:

1. Use strong PostgreSQL password
2. Enable SSL/TLS connections
3. Restrict IP access to Cloudflare only
4. Use read-only credentials where possible
5. Enable query logging

### API Rate Limiting:

Add Cloudflare rate limiting rules:
1. Go to **Firewall** → **Rate Limiting**
2. Add rule:
   ```
   Path: /api/admin/import
   Requests: 10 per 1 minute
   Action: Block
   ```

---

## 📈 Scaling & Performance Tips

### Caching:

Set up Cloudflare Cache Rules:
```
Path: /api/products
Cache time: 5 minutes
Method: Cache on GET
```

### Worker Functions:

Use Cloudflare Workers for preprocessing:
- Validate requests before routing to Pages Functions
- Add authentication layer
- Rate limiting

### Database Optimization:

1. Add indexes to frequently queried columns:
   ```sql
   CREATE INDEX idx_products_category ON products(category);
   CREATE INDEX idx_products_imported_from ON products(importedFrom);
   ```

2. Enable query optimization
3. Monitor slow queries

---

## 🎯 Post-Deployment Checklist

- [ ] Environment variables set in Cloudflare
- [ ] Build passes without errors
- [ ] Green checkmark on latest deployment
- [ ] Admin panel accessible at `/admin`
- [ ] AI Importer page loads at `/admin/import`
- [ ] Can log in with admin credentials
- [ ] Test import runs successfully
- [ ] Products appear in database
- [ ] Prices calculated correctly
- [ ] Custom domain configured (optional)
- [ ] SSL/TLS enabled (automatic with Cloudflare)
- [ ] Analytics showing traffic

---

## 🚀 Going Live

### Pre-Launch Testing:

```bash
# Test all endpoints
curl https://your-domain.pages.dev/api/products
curl https://your-domain.pages.dev/admin
curl https://your-domain.pages.dev/admin/import

# Test AI importer
curl -X POST https://your-domain.pages.dev/api/admin/import \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","markupPercentage":5}'
```

### Performance Testing:

Use tools like:
- Google PageSpeed Insights
- WebPageTest
- Cloudflare's built-in Analytics

### Monitoring Setup:

1. Enable Cloudflare Workers Analytics
2. Set up error notifications
3. Configure uptime monitoring
4. Create performance dashboards

---

## 📞 Support & Additional Resources

### Cloudflare Documentation:
- https://developers.cloudflare.com/pages/
- https://developers.cloudflare.com/pages/framework-guides/nextjs/
- https://developers.cloudflare.com/workers/platform/environment-variables/

### Next.js on Cloudflare:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/

### OpenRouter Documentation:
- https://openrouter.ai/docs
- https://openrouter.ai/models

### Neon PostgreSQL:
- https://neon.tech/docs/

---

## 🎉 You're Live!

Your AI Product Importer is now running on Cloudflare Pages! 

**Your app is available at:**
- https://eliteappsbd.pages.dev (default)
- https://your-custom-domain.com (if configured)

**Start importing products:**
1. Visit `/admin`
2. Log in
3. Click "AI Importer"
4. Paste competitor URL
5. Set markup percentage
6. Click "Analyze & Import"

---

## 📝 Deployment Summary

| Component | Status | Location |
|-----------|--------|----------|
| GitHub Repo | ✅ Connected | https://github.com/argho1863-web/EliteAppsBD |
| Cloudflare Pages | ✅ Deployed | https://dash.cloudflare.com |
| Domain | ✅ Configured | your-domain.pages.dev |
| Database | ✅ Connected | Neon PostgreSQL |
| AI API | ✅ Configured | OpenRouter |
| Admin Panel | ✅ Live | /admin |
| AI Importer | ✅ Ready | /admin/import |

---

**Deployment Date:** 2026-06-19  
**Version:** 1.0.0  
**Runtime:** Node.js on Cloudflare Pages  
**Status:** ✅ Production Ready
