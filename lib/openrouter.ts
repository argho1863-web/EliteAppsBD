/**
 * OpenRouter API Integration for AI Product Parsing
 * Uses structured JSON output for guaranteed parsing
 */

export interface OpenRouterResponse {
  products: Product[];
}

export interface Product {
  name: string;
  category: 'topup' | 'subscription' | 'apps';
  description?: string;
  image_url?: string;
  variants: Variant[];
}

export interface Variant {
  title: string;
  base_price: number;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Clean Markdown backticks from AI response if present
 */
function cleanJSONResponse(text: string): string {
  let cleaned = text.trim();
  // Remove markdown code block wrappers if the AI included them
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

/**
 * Calls OpenRouter API with a strict structured prompt
 * Returns JSON-parsed products
 */
export async function parseProductsWithAI(
  cleanedHtml: string,
  images: string[]
): Promise<OpenRouterResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const model =
    process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

  // Limit HTML size for token efficiency
  const truncatedHtml = cleanedHtml.substring(0, 8000);

  const systemPrompt = `You are a product data extraction expert. Your job is to analyze website content and extract product information in STRICT JSON format.

RULES:
1. ONLY return valid JSON, no other text
2. Extract ALL products from the content
3. Categorize each product as one of: "topup", "subscription", or "apps"
4. For each product, extract variants (e.g., "100 Diamonds", "1 Month Premium") with their base_price
5. Assign relevant image URLs from the provided list if available
6. Include a brief description for each product

RESPONSE FORMAT (MUST be valid JSON):
{
  "products": [
    {
      "name": "Product Name",
      "category": "topup",
      "description": "Brief description",
      "image_url": "[https://example.com/image.jpg](https://example.com/image.jpg)",
      "variants": [
        {
          "title": "100 Units",
          "base_price": 50.00
        },
        {
          "title": "500 Units",
          "base_price": 200.00
        }
      ]
    }
  ]
}

Extract at least 5-20 products if available. Be precise with pricing.`;

  const userPrompt = `Extract all products from this website content:

AVAILABLE IMAGES:
${images.slice(0, 10).map((url, i) => `${i + 1}. ${url}`).join('\n')}

WEBSITE CONTENT:
${truncatedHtml}

Return ONLY valid JSON. No markdown, no explanations.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': '[https://eliteappsbd.qzz.io](https://eliteappsbd.qzz.io)',
        'X-Title': 'EliteAppsBD AI Importer',
      },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' }, // FIX: Forces the LLM to output pure JSON text
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1, // Lowered temperature slightly from 0.3 to 0.1 for maximum structural adherence
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenRouter');
    }

    // FIX: Clean markdown code blocks/backticks out of response before parsing
    const cleanedContent = cleanJSONResponse(content);

    // Parse the JSON response
    const parsed = JSON.parse(cleanedContent) as OpenRouterResponse;

    if (!parsed || !Array.isArray(parsed.products)) {
      throw new Error('Invalid response format: missing products array');
    }

    return parsed;
  
  } catch (error: any) {
    throw new Error(
      `OpenRouter parsing failed: ${error.message || 'Unknown error'}`
    );
  }
}
