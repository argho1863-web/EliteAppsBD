/**
 * TEST DATA & SAMPLE REQUESTS
 * Use these to test the AI Product Importer
 */

// =============================================================================
// CURL Test Requests
// =============================================================================

/**
 * Test 1: Import from a real website (requires authentication)
 * 
 * Run in terminal:
 * 
 * curl -X POST http://localhost:3000/api/admin/import \
 *   -H "Content-Type: application/json" \
 *   -H "Cookie: YOUR_SESSION_COOKIE" \
 *   -d '{
 *     "url": "https://www.freefirestore.com",
 *     "markupPercentage": 5
 *   }'
 */

// =============================================================================
// TypeScript Test Function
// =============================================================================

export async function testAIImporter() {
  // Test 1: Valid import request
  console.log("Test 1: Valid import request");
  const response1 = await fetch('/api/admin/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://example.com',
      markupPercentage: 5,
    }),
  });
  console.log('Status:', response1.status);
  console.log('Response:', await response1.json());

  // Test 2: Invalid URL format
  console.log("\nTest 2: Invalid URL format");
  const response2 = await fetch('/api/admin/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'invalid-url',
      markupPercentage: 5,
    }),
  });
  console.log('Status:', response2.status);
  console.log('Response:', await response2.json());

  // Test 3: Invalid markup percentage (negative)
  console.log("\nTest 3: Invalid markup percentage");
  const response3 = await fetch('/api/admin/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://example.com',
      markupPercentage: -5,
    }),
  });
  console.log('Status:', response3.status);
  console.log('Response:', await response3.json());

  // Test 4: Missing fields
  console.log("\nTest 4: Missing required fields");
  const response4 = await fetch('/api/admin/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://example.com',
    }),
  });
  console.log('Status:', response4.status);
  console.log('Response:', await response4.json());
}

// =============================================================================
// Expected Response Format
// =============================================================================

export interface MockImportResponse {
  success: true;
  message: string;
  imported: number;
  failed: number;
  products: Array<{
    _id: string;
    name: string;
    category: 'topup' | 'subscription' | 'apps';
    price: number;
    priceMin: number;
    priceMax: number;
    images: string[];
    description: string;
    productType: string;
    topupAmounts?: Array<{ label: string; price: number }>;
    periods?: Array<{ label: string; price: number }>;
    stock: number;
    featured: boolean;
    rating: number;
    reviews: number;
    importedFrom: string;
    importedAt: string;
  }>;
  errors?: string[];
}

export const mockSuccessResponse: MockImportResponse = {
  success: true,
  message: 'Successfully imported 3 products',
  imported: 3,
  failed: 0,
  products: [
    {
      _id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Free Fire Diamonds',
      category: 'topup',
      price: 105,
      priceMin: 52.5,
      priceMax: 525,
      images: ['https://example.com/image1.jpg'],
      description: 'Imported from https://freefirestore.com',
      productType: 'topup',
      topupAmounts: [
        { label: '50 Diamonds', price: 52.5 },
        { label: '100 Diamonds', price: 105 },
        { label: '500 Diamonds', price: 525 },
      ],
      stock: 999,
      featured: false,
      rating: 4.5,
      reviews: 0,
      importedFrom: 'https://freefirestore.com',
      importedAt: '2026-06-19T10:30:00Z',
    },
    {
      _id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Netflix Premium',
      category: 'subscription',
      price: 16.5,
      priceMin: 16.5,
      priceMax: 22,
      images: ['https://example.com/image2.jpg'],
      description: 'Imported from https://netflix.com',
      productType: 'subscription',
      periods: [
        { label: '1 Month Premium', price: 16.5 },
        { label: '3 Month Premium', price: 44 },
        { label: 'Annual Premium', price: 220 },
      ],
      stock: 999,
      featured: false,
      rating: 4.5,
      reviews: 0,
      importedFrom: 'https://netflix.com',
      importedAt: '2026-06-19T10:30:05Z',
    },
    {
      _id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Telegram Premium',
      category: 'apps',
      price: 5.5,
      priceMin: 5.5,
      priceMax: 5.5,
      images: ['https://example.com/image3.jpg'],
      description: 'Imported from https://telegram.org',
      productType: 'apps',
      stock: 999,
      featured: false,
      rating: 4.5,
      reviews: 0,
      importedFrom: 'https://telegram.org',
      importedAt: '2026-06-19T10:30:10Z',
    },
  ],
};

// =============================================================================
// Test Websites (for manual testing)
// =============================================================================

export const testWebsites = [
  {
    name: 'Free Fire Store',
    url: 'https://www.freefirestore.com',
    category: 'topup',
    description: 'Mobile game top-up products',
  },
  {
    name: 'Netflix',
    url: 'https://www.netflix.com',
    category: 'subscription',
    description: 'Streaming subscription service',
  },
  {
    name: 'Google Play Store',
    url: 'https://play.google.com',
    category: 'apps',
    description: 'Android app store',
  },
  {
    name: 'Genshin Impact',
    url: 'https://genshin.hoyoverse.com',
    category: 'topup',
    description: 'Game top-up currency',
  },
  {
    name: 'PlayStation Store',
    url: 'https://store.playstation.com',
    category: 'topup',
    description: 'Gaming platform store',
  },
];

// =============================================================================
// Price Calculation Tests
// =============================================================================

export function testPriceCalculations() {
  const testCases = [
    { basePrice: 100, markup: 5, expected: 105 },
    { basePrice: 100, markup: 10, expected: 110 },
    { basePrice: 100, markup: 15, expected: 115 },
    { basePrice: 50.5, markup: 5, expected: 53.025 },
    { basePrice: 999, markup: 20, expected: 1198.8 },
    { basePrice: 0, markup: 10, expected: 0 },
  ];

  console.log('Price Calculation Tests:');
  testCases.forEach(({ basePrice, markup, expected }) => {
    const calculated = basePrice * (1 + markup / 100);
    const rounded = Math.round(calculated * 100) / 100;
    const passed = Math.abs(rounded - expected) < 0.01;
    console.log(
      `Base: $${basePrice}, Markup: ${markup}% → $${rounded} ${passed ? '✓' : '✗'}`
    );
  });
}

// =============================================================================
// Browser Console Test (run in admin panel console)
// =============================================================================

/**
 * Paste this into browser console to test the importer:
 * 
 * // Test with a simple example
 * fetch('/api/admin/import', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     url: 'https://example.com',
 *     markupPercentage: 5
 *   })
 * })
 * .then(r => r.json())
 * .then(d => console.log(d))
 * .catch(e => console.error(e))
 */

// =============================================================================
// Validation Tests
// =============================================================================

export function testValidation() {
  console.log('Input Validation Tests:');

  // URL validation
  const validUrls = [
    'https://example.com',
    'http://example.com',
    'https://example.com/path',
  ];

  const invalidUrls = ['example.com', 'ftp://example.com', 'not a url'];

  console.log('\nValid URLs:');
  validUrls.forEach((url) => {
    try {
      new URL(url);
      console.log(`  ✓ ${url}`);
    } catch {
      console.log(`  ✗ ${url}`);
    }
  });

  console.log('\nInvalid URLs:');
  invalidUrls.forEach((url) => {
    try {
      new URL(url);
      console.log(`  ✗ ${url} (should have failed)`);
    } catch {
      console.log(`  ✓ ${url} (correctly rejected)`);
    }
  });

  // Markup validation
  const validMarkups = [0, 5, 10, 15, 100, 500];
  const invalidMarkups = [-5, 1000, 'invalid'];

  console.log('\nValid Markup Percentages:');
  validMarkups.forEach((m) => {
    const valid = typeof m === 'number' && m >= 0 && m <= 500;
    console.log(`  ${valid ? '✓' : '✗'} ${m}%`);
  });

  console.log('\nInvalid Markup Percentages:');
  invalidMarkups.forEach((m) => {
    const valid = typeof m === 'number' && m >= 0 && m <= 500;
    console.log(`  ${valid ? '✗' : '✓'} ${m}% (correctly rejected)`);
  });
}

// =============================================================================
// Run All Tests
// =============================================================================

export function runAllTests() {
  console.clear();
  console.log('🧪 Running AI Product Importer Tests\n');
  console.log('=====================================\n');

  testPriceCalculations();
  console.log('\n');
  testValidation();
}

// Export for use in Node.js environment
export default {
  testAIImporter,
  testPriceCalculations,
  testValidation,
  runAllTests,
  testWebsites,
  mockSuccessResponse,
};
