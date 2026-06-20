import * as cheerio from 'cheerio';

export interface ScrapedData {
  html: string;
  cleanHtml: string;
  images: string[];
  baseUrl: string;
}

/**
 * Fetches and cleans HTML from a target URL
 * Removes scripts, styles, and navigation to minimize LLM context
 */
export async function scrapeAndCleanHTML(url: string): Promise<ScrapedData> {
  try {
    // Validate URL format
    new URL(url);

    // FIX: Using native globalThis.fetch instead of axios to support Cloudflare Edge runtime
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    const response = await globalThis.fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Target site returned status code: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract image URLs
    const images: string[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        try {
          const absoluteUrl = new URL(src, url).href;
          images.push(absoluteUrl);
        } catch {
          // Skip invalid relative URL constructions
        }
      }
    });

    // Remove unwanted elements to save tokens
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('.advertisement').remove();
    $('[class*="ad"]').remove();
    $('[id*="ad"]').remove();
    $('.sidebar').remove();
    $('.comment').remove();

    // Get clean text content
    const cleanHtml = $.html();

    return {
      html,
      cleanHtml,
      images: [...new Set(images)].slice(0, 100), // Dedupe and limit to 100
      baseUrl: url,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Scraping failed: Request timed out after 10 seconds');
    }
    throw new Error(
      `Scraping failed: ${error.message || 'Unknown error during scraping'}`
    );
  }
}

/**
 * Extracts product-like sections from HTML
 * Helpful for giving LLM context-specific data
 */
export function extractProductSections(html: string): string {
  const $ = cheerio.load(html);

  // Look for common product containers
  const productSections: string[] = [];
  const selectors = [
    '[class*="product"]',
    '[class*="item"]',
    '[class*="card"]',
    '[class*="listing"]',
  ];

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20 && text.length < 2000) {
        productSections.push(text);
      }
    });
  }

  return productSections.slice(0, 50).join('\n\n---\n\n');
      }
