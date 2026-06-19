# AI Product Importer - Setup & Configuration Guide

## Overview
This guide explains how to configure and use the AI-Powered Product Ingestion feature in EliteAppsBD.

## Prerequisites
- Admin access to EliteAppsBD dashboard
- OpenRouter API key
- Node.js 18+ (already included in the project)

---

## 1. Environment Configuration

### Setting Up OpenRouter API Key

1. **Get an API Key:**
   - Visit [OpenRouter.ai](https://openrouter.ai)
   - Sign up for a free account
   - Go to Settings → API Keys
   - Create a new API key

2. **Add to `.env.local`:**
   ```env
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   OPENROUTER_MODEL=google/gemini-2.5-flash
   ```

### Recommended Models

| Model | Speed | Quality | Cost | Use Case |
|-------|-------|---------|------|----------|
| `google/gemini-2.5-flash` | ⚡⚡⚡ | ⭐⭐⭐⭐ | 💰 | Default (Recommended) |
| `meta-llama/llama-3-70b-instruct` | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰 | Higher accuracy |
| `mistralai/mistral-7b-instruct` | ⚡⚡⚡⚡ | ⭐⭐⭐ | 💰 | Budget-friendly |

**Recommendation:** Start with `google/gemini-2.5-flash` for the best balance of speed and accuracy.

---

## 2. Using the AI Product Importer

### Step-by-Step Guide

1. **Navigate to AI Importer:**
   - Go to Admin Dashboard (`/admin`)
   - Click the **"AI Importer"** button (purple with lightning icon)
   - Or navigate directly to `/admin/import`

2. **Enter Website URL:**
   - Paste the competitor/supplier website URL
   - Include `https://` or `http://`
   - Example: `https://competitor-topup.com/products`

3. **Set Markup Percentage:**
   - Enter the markup percentage (0-500%)
   - Example: `5` for a 5% markup
   - The formula applied: `NewPrice = BasePrice × (1 + Markup% / 100)`

4. **Click "Analyze & Import":**
   - Wait for the AI to process the website
   - Monitor the progress indication
   - Review results when complete

### Example Imports

#### Example 1: Free Fire Top-ups
- URL: `https://competitive-store.com/freefire`
- Markup: `8`
- Expected Result: 15-30 products imported with calculated prices

#### Example 2: Netflix Subscriptions
- URL: `https://streaming-service.com/plans`
- Markup: `5`
- Expected Result: 5-10 subscription variants extracted

---

## 3. Data Extraction Details

### What Gets Extracted

The AI automatically extracts:
- ✅ Product names
- ✅ Product categories (topup, subscription, apps)
- ✅ Variants and their base prices
- ✅ Product images
- ✅ Descriptions

### Database Mapping

Extracted data is automatically mapped to your product schema:

| AI Field | Database Field | Type | Notes |
|----------|---|------|-------|
| `name` | `name` | string | Product title |
| `category` | `productType` | enum | topup/subscription/apps |
| `variants[].title` | `topupAmounts[].label` or `periods[].label` | string | Variant name |
| `variants[].base_price` | Markup calculation | number | Applied with markup % |
| `image_url` | `images[]` | string[] | Product images |
| `description` | `description` | string | Product info |

### Price Calculation

All imported prices have the markup formula applied:

```
NewPrice = BasePrice × (1 + MarkupPercentage / 100)

Example:
BasePrice = $100
MarkupPercentage = 5
NewPrice = 100 × (1 + 5/100) = 100 × 1.05 = $105
```

---

## 4. Feature Capabilities

### What Works Well
✅ E-commerce product listings  
✅ Subscription and SaaS pricing pages  
✅ Top-up services and digital goods  
✅ App store listings  
✅ Multi-variant products  
✅ Image extraction  
✅ Bulk imports (20-100+ products)  

### What Needs Manual Review
⚠️ Very dynamic/JavaScript-heavy sites (may need adjustment)  
⚠️ Paywalled or geo-restricted content  
⚠️ Non-standard pricing formats  
⚠️ Regional or currency-specific pricing  

---

## 5. Error Handling & Troubleshooting

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid URL format` | URL syntax error | Include `https://` prefix |
| `OpenRouter API error` | API key invalid/rate limit | Check `.env.local`, wait a minute |
| `No products extracted` | Website structure unusual | Try a different URL or category |
| `Markup percentage invalid` | Out of range (>500%) | Use 0-500 range |

### Debug Information

Check browser console or server logs for detailed error messages:
```
[IMPORT] Starting scrape of https://...
[IMPORT] Scraped 45 images from https://...
[IMPORT] Parsing products with OpenRouter AI
[IMPORT] AI extracted 25 products
[IMPORT] Inserted product: Product Name (uuid)
[IMPORT] Complete: Successfully imported 25 products
```

---

## 6. Best Practices

### Before Importing
1. ✅ Test the import with a small markup first (5-10%)
2. ✅ Verify the source website has legitimate products
3. ✅ Check that product data makes sense for your store
4. ✅ Ensure you have legal right to use the pricing data

### After Importing
1. ✅ Review imported products in the products admin panel
2. ✅ Adjust product descriptions if needed
3. ✅ Verify images loaded correctly
4. ✅ Test product pages before publishing to customers
5. ✅ Monitor for duplicates and clean up as needed

### Markup Strategy
| Scenario | Markup % |
|----------|----------|
| High-margin business | 20-50% |
| Competitive pricing | 5-15% |
| Bulk/Volume play | 2-5% |
| Premium positioning | 15-30% |

---

## 7. API Reference

### POST /api/admin/import

**Request:**
```json
{
  "url": "https://competitor-site.com/products",
  "markupPercentage": 5
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully imported 25 products",
  "imported": 25,
  "failed": 0,
  "products": [
    {
      "_id": "uuid-1234",
      "name": "100 Diamonds",
      "category": "topup",
      "price": 105,
      "topupAmounts": [{"label": "100 Diamonds", "price": 105}],
      ...
    }
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Import failed: [error message]",
  "imported": 0,
  "failed": 0,
  "products": [],
  "errors": ["Error message"]
}
```

---

## 8. Cost Estimation

### OpenRouter Pricing
- **google/gemini-2.5-flash**: ~$0.01-0.05 per import
- **meta-llama/llama-3-70b-instruct**: ~$0.05-0.15 per import
- **Average monthly cost**: $5-50 (for 100-500 imports)

Monitor API usage in OpenRouter dashboard.

---

## 9. Advanced Configuration

### Custom Environment Variables

Optional advanced settings:

```env
# (Optional) Override default model
OPENROUTER_MODEL=meta-llama/llama-3-70b-instruct

# (Optional) Increase timeout for slow sites
SCRAPE_TIMEOUT=15000

# (Optional) Maximum products to extract
MAX_PRODUCTS=50
```

### Rate Limiting

The system includes built-in safeguards:
- Timeout: 10 seconds per URL scrape
- Max redirects: 5
- Max HTML size: 8000 chars (truncated for token efficiency)
- Max images per import: 100

---

## 10. Support & Troubleshooting

### Getting Help
1. Check debug logs in browser console (F12)
2. Review error messages in the import result
3. Verify OpenRouter API key is correct
4. Test with a different website URL
5. Check if website structure is supported

### Testing with Example Sites
- **E-commerce**: amazon.com, ebay.com
- **Subscriptions**: netflix.com (pricing page)
- **Games**: gameflip.com (product listings)

---

## Summary

The AI Product Importer is a powerful tool for bulk product ingestion. With proper configuration and best practices, you can:

✅ Automatically import 20-100+ products at once  
✅ Maintain competitive pricing with markup control  
✅ Save hours of manual product entry  
✅ Scale your catalog efficiently  

**Next Steps:**
1. Get OpenRouter API key
2. Update `.env.local`
3. Install dependencies with `npm install`
4. Start importing products!
