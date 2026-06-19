# 🚀 AI Product Importer - Quick Reference Card

## File Structure

```
/workspaces/EliteAppsBD/
├── lib/
│   ├── scraper.ts                    # Web scraping utility
│   ├── openrouter.ts                 # AI parsing integration
│   └── priceCalculator.ts            # Markup formula implementation
├── app/
│   ├── api/admin/import/route.ts     # Main API endpoint
│   └── admin/
│       ├── import/page.tsx           # Admin import page
│       └── page.tsx                  # Dashboard (with AI Importer link)
├── components/
│   └── AIProductImporter.tsx         # Frontend UI component
└── AI_PRODUCT_IMPORTER_GUIDE.md     # Full documentation
```

---

## Environment Setup

```bash
# Install dependencies (if not already done)
npm install

# Create/update .env.local
cat >> .env.local << EOF
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
OPENROUTER_MODEL=google/gemini-2.5-flash
EOF

# Start development server
npm run dev
```

**Get API Key:** https://openrouter.ai → Settings → API Keys

---

## API Endpoint

```
POST /api/admin/import
Authorization: Admin session required

Request Body:
{
  "url": "https://competitor-site.com",
  "markupPercentage": 5,
  "category": "topup"  // optional
}

Response:
{
  "success": true,
  "message": "Successfully imported 25 products",
  "imported": 25,
  "failed": 0,
  "products": [...],
  "errors": []
}
```

---

## Usage Flow

| Step | URL | Component | Description |
|------|-----|-----------|-------------|
| 1 | `/admin` | Dashboard | Click "AI Importer" button |
| 2 | `/admin/import` | AIProductImporter | Fill form (URL + markup) |
| 3 | - | API | Backend processes import |
| 4 | `/admin/import` | AIProductImporter | Display results |

---

## Markup Formula

$$\text{NewPrice} = \text{BasePrice} \times \left(1 + \frac{\text{Markup\%}}{100}\right)$$

**Example:**
- Base: $100
- Markup: 5%
- Result: $100 × 1.05 = **$105** ✓

---

## Key Features

✅ **Scraping** - HTML fetching + cleaning (cheerio)  
✅ **AI Parsing** - OpenRouter LLM with strict JSON schema  
✅ **Price Calculation** - Automatic markup application  
✅ **Database Ingestion** - PostgreSQL (Neon) integration  
✅ **Error Handling** - Graceful failures + partial imports  
✅ **Admin Auth** - Protected endpoint with role check  
✅ **Beautiful UI** - Gradient design with Tailwind CSS  

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "OPENROUTER_API_KEY not configured" | Add to `.env.local` and restart dev server |
| "Unauthorized" | Ensure logged in as admin |
| "Invalid URL" | Include `https://` or `http://` |
| "No products imported" | Website might lack visible products or be blocked |
| "Scraping failed: timeout" | Website took >10s to respond, try different site |

---

## Performance Metrics

| Metric | Time | Cost |
|--------|------|------|
| Scraping | 2-5s | - |
| AI Parsing | 5-15s | ~$0.001-0.01 |
| DB Insert | 1-3s | - |
| **Total** | **10-25s** | **~$0.01-0.05** |

---

## Testing

```bash
# Verify setup
bash setup-verify.sh

# Test API endpoint with curl
curl -X POST http://localhost:3000/api/admin/import \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "markupPercentage": 5
  }'

# View imported products
curl http://localhost:3000/api/products
```

---

## Database Schema Support

Ingested products map to your schema:

```typescript
{
  name: string;                    // Product name
  category: string;                // topup/subscription/apps
  description: string;             // Auto-generated if empty
  images: string[];                // Extracted from website
  price: number;                   // Calculated with markup
  priceMin: number;               // Min variant price
  priceMax: number;               // Max variant price
  topupAmounts?: Variant[];        // For topup products
  periods?: Variant[];             // For subscription products
  stock: number;                   // Default: 999
  featured: boolean;               // Default: false
  rating: number;                  // Default: 4.5
  productType: string;             // topup/subscription/apps
  importedFrom: string;            // Source URL
  importedAt: string;              // ISO timestamp
}
```

---

## Markup Recommendations

| Markup | Scenario | Profit Margin |
|--------|----------|---|
| 2-3% | High volume, competitive | ~2% |
| 5-10% | Standard, balanced | ~5-9% |
| 10-20% | Premium positioning | ~9-17% |
| 20%+ | Specialty/limited items | 17%+ |

---

## OpenRouter Model Comparison

| Model | Speed | Cost | Quality | Accuracy |
|-------|-------|------|---------|----------|
| google/gemini-2.5-flash | ⚡ | 💰 | ⭐ | Good |
| meta-llama/llama-3-70b | ⚡ | 💰 | ⭐⭐ | Excellent |
| mistral/mistral-7b | ⚡⚡ | 💰 | ⭐ | Fair |

**Switch model:** Update `OPENROUTER_MODEL` in `.env.local`

---

## Admin Dashboard Integration

The "AI Importer" button is in `/admin/page.tsx`:

```typescript
<Link
  href="/admin/import"
  className="flex items-center justify-center gap-3 px-6 py-3 
    rounded-2xl border border-purple-500/20 bg-purple-500/5 
    text-purple-400 hover:bg-purple-500 hover:text-white 
    transition-all text-xs font-black uppercase tracking-widest"
>
  <Zap size={16} />
  AI Importer
</Link>
```

---

## Component Props

### AIProductImporter Component

No required props. Standalone component.

```typescript
<AIProductImporter />
```

**Internal State:**
- `url`: string
- `markup`: string (number as string)
- `loading`: boolean
- `result`: ImportResult | null
- `showResults`: boolean

---

## Customization

### Change AI Model

Edit `.env.local`:
```env
OPENROUTER_MODEL=meta-llama/llama-3-70b-instruct
```

### Customize Extraction Prompt

Edit `lib/openrouter.ts` - modify `systemPrompt`:
```typescript
const systemPrompt = `
  Your custom instructions here...
`;
```

### Adjust Markup Formula

Edit `lib/priceCalculator.ts`:
```typescript
export function calculatePrice(
  basePrice: number,
  markupPercentage: number
): PriceCalculation {
  const markupMultiplier = 1 + markupPercentage / 100;
  const newPrice = basePrice * markupMultiplier;
  // ... rest of logic
}
```

---

## Security Checklist

✅ Admin-only endpoint (`/api/admin/import`)  
✅ Session authentication required  
✅ URL validation (prevents injection)  
✅ Input range validation (0-500% markup)  
✅ HTML sanitization (scripts/styles removed)  
✅ Error details don't expose system info  
✅ Database uses parameterized queries  

---

## Monitoring & Logs

Check browser console for frontend logs:
```javascript
// In AIProductImporter.tsx
toast.loading('Analyzing website and importing products...');
```

Check server logs for backend:
```typescript
// In app/api/admin/import/route.ts
console.log('[IMPORT] Starting scrape of ${url}');
console.log('[IMPORT] Parsing products with OpenRouter AI');
console.log('[IMPORT] Inserted product: ${aiProduct.name} (${productId})');
```

---

## Deployment Notes

### Vercel/Next.js Deployment

1. Set environment variables in Vercel dashboard:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`
   - Other required vars

2. Runtime: `nodejs` (in route.ts)
   ```typescript
   export const runtime = 'nodejs';
   ```

3. Max timeout: Consider increasing for large imports

### Edge Runtime Note

The endpoint uses Node.js runtime (not edge) due to:
- File system operations (temp storage)
- Long-running processes (30s+)
- External API calls

---

## Troubleshooting Guide

### 1. API Key Issues
```
Error: OPENROUTER_API_KEY not configured
Fix: Add to .env.local and restart npm run dev
```

### 2. CORS Issues
```
Error: CORS policy blocked
Fix: API is same-origin, should not occur
Check: Browser console for actual error
```

### 3. Database Errors
```
Error: Failed to insert product
Fix: Check database connection in .env
Verify: DATABASE_URL is valid
```

### 4. Scraping Failures
```
Error: Failed to fetch URL
Reasons:
- Website is down
- Blocked by robots.txt
- Requires authentication
- SSL certificate issues
```

### 5. AI Parsing Issues
```
Error: Invalid response format
Fixes:
- Try different URL
- Check OPENROUTER_MODEL
- Verify API key validity
```

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set API key in `.env.local`
3. ✅ Run dev server: `npm run dev`
4. ✅ Visit: `http://localhost:3000/admin`
5. ✅ Click "AI Importer"
6. ✅ Paste competitor URL
7. ✅ Set markup percentage (e.g., 5%)
8. ✅ Click "Analyze & Import"
9. ✅ Review imported products

---

## Support Resources

- 📖 Full Guide: `AI_PRODUCT_IMPORTER_GUIDE.md`
- 🔑 API Keys: https://openrouter.ai
- 💬 OpenRouter Docs: https://openrouter.ai/docs
- 🛠️ Schema Ref: `lib/openrouter.ts`
- 📝 Logs: Browser console + server terminal

---

*Version 1.0.0 - Production Ready*  
*EliteAppsBD AI Product Importer*
