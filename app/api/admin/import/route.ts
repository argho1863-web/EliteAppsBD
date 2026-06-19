export const runtime = 'edge';
export const maxDuration = 60; // Cloudflare Pages max timeout
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { scrapeAndCleanHTML } from '@/lib/scraper';
import { parseProductsWithAI } from '@/lib/openrouter';
import { calculatePrice } from '@/lib/priceCalculator';

export interface ImportRequest {
  url: string;
  markupPercentage: number;
  category?: string;
}

export interface ImportResponse {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  products: any[];
  errors?: string[];
}

/**
 * POST /api/admin/import
 * Main endpoint for AI-powered product ingestion
 *
 * Request body:
 * {
 *   "url": "https://competitor-site.com",
 *   "markupPercentage": 5
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Check admin authorization
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ImportRequest = await req.json();
    const { url, markupPercentage } = body;

    // Validate inputs
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid URL' },
        { status: 400 }
      );
    }

    if (
      markupPercentage === undefined ||
      typeof markupPercentage !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid markupPercentage' },
        { status: 400 }
      );
    }

    if (markupPercentage < 0 || markupPercentage > 500) {
      return NextResponse.json(
        { error: 'Markup percentage must be between 0 and 500' },
        { status: 400 }
      );
    }

    // Step 1: Scrape and clean HTML
    console.log(`[IMPORT] Starting scrape of ${url}`);
    const scrapedData = await scrapeAndCleanHTML(url);
    console.log(
      `[IMPORT] Scraped ${scrapedData.images.length} images from ${url}`
    );

    // Step 2: Parse products with AI
    console.log('[IMPORT] Parsing products with OpenRouter AI');
    const parsedData = await parseProductsWithAI(
      scrapedData.cleanHtml,
      scrapedData.images
    );
    console.log(
      `[IMPORT] AI extracted ${parsedData.products.length} products`
    );

    // Step 3: Apply markup and prepare for ingestion
    const importedProducts: any[] = [];
    const errors: string[] = [];
    let failedCount = 0;

    for (const aiProduct of parsedData.products) {
      try {
        // Validate AI-extracted product
        if (!aiProduct.name || !aiProduct.variants?.length) {
          errors.push(`Skipped product: missing name or variants`);
          failedCount++;
          continue;
        }

        // Apply markup to variant prices
        const processedVariants = aiProduct.variants.map(
          (v: any) => {
            const priceCalc = calculatePrice(
              parseFloat(v.base_price) || 0,
              markupPercentage
            );
            return {
              label: v.title || 'Standard',
              price: priceCalc.newPrice,
            };
          }
        );

        // Determine product type based on category
        let productType: 'topup' | 'subscription' | 'apps' = 'apps';
        let typeField = '';
        let typeValue: any[] = [];

        if (aiProduct.category === 'topup') {
          productType = 'topup';
          typeField = 'topupAmounts';
          typeValue = processedVariants;
        } else if (aiProduct.category === 'subscription') {
          productType = 'subscription';
          typeField = 'periods';
          typeValue = processedVariants;
        }

        // Prepare product object for database
        const dbProduct = {
          name: aiProduct.name,
          description: aiProduct.description || `Imported from ${url}`,
          category: body.category || aiProduct.category || 'apps',
          productType,
          images: aiProduct.image_url
            ? [aiProduct.image_url]
            : [],
          [typeField]: typeValue,
          price: processedVariants[0]?.price || 0,
          priceMin:
            Math.min(...processedVariants.map((v: any) => v.price)) || 0,
          priceMax:
            Math.max(...processedVariants.map((v: any) => v.price)) || 0,
          stock: 999, // Default high stock for imported products
          featured: false,
          rating: 4.5,
          reviews: 0,
          createdAt: new Date().toISOString(),
          importedFrom: url,
          importedAt: new Date().toISOString(),
        };

        // Insert into database
        const productId = await db.insertOne('products', dbProduct);
        console.log(`[IMPORT] Inserted product: ${aiProduct.name} (${productId})`);

        importedProducts.push({
          _id: productId,
          ...dbProduct,
        });
      } catch (error: any) {
        console.error(`[IMPORT] Error processing product: ${error.message}`);
        errors.push(
          `Failed to process "${aiProduct.name}": ${error.message}`
        );
        failedCount++;
      }
    }

    // Step 4: Return summary
    const response: ImportResponse = {
      success: failedCount === 0,
      message:
        failedCount === 0
          ? `Successfully imported ${importedProducts.length} products`
          : `Imported ${importedProducts.length} products with ${failedCount} failures`,
      imported: importedProducts.length,
      failed: failedCount,
      products: importedProducts,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log(`[IMPORT] Complete: ${response.message}`);
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[IMPORT] Fatal error:', error);

    return NextResponse.json(
      {
        success: false,
        message: `Import failed: ${error.message || 'Unknown error'}`,
        imported: 0,
        failed: 0,
        products: [],
        errors: [error.message],
      },
      { status: 500 }
    );
  }
}
