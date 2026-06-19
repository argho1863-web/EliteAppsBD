import axios from 'axios';
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

    // Fetch HTML with timeout
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract image URLs
    const images: string[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        const absoluteUrl = new URL(src, url).href;
        images.push(absoluteUrl);
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
