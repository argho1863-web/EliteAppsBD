'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Upload,
  Loader,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  products: any[];
  errors?: string[];
}

export default function AIProductImporter() {
  const [url, setUrl] = useState('');
  const [markup, setMarkup] = useState('5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();

    if (!url.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    if (!isValidUrl(url)) {
      toast.error('Invalid URL format. Include https:// or http://');
      return;
    }

    const markupNum = parseFloat(markup);
    if (isNaN(markupNum) || markupNum < 0 || markupNum > 500) {
      toast.error('Markup percentage must be between 0 and 500');
      return;
    }

    setLoading(true);
    setResult(null);
    setShowResults(false);

    try {
      const toastId = toast.loading(
        'Analyzing website and importing products...'
      );

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          markupPercentage: markupNum,
        }),
      });

      const data: ImportResult = await response.json();

      if (response.ok && data.success) {
        toast.success(
          `✅ ${data.imported} products imported successfully!`,
          { id: toastId }
        );
        setResult(data);
        setShowResults(true);
        setUrl('');
        setMarkup('5');
      } else {
        toast.error(data.message || 'Import failed', { id: toastId });
        setResult(data);
        setShowResults(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            AI Product Importer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Automatically scrape and import products from any website using AI.
            Just paste a URL, set your markup, and let the AI do the rest.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Form Section */}
            <div className="p-8 md:border-r border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Import Configuration
              </h2>

              <form onSubmit={handleImport} className="space-y-6">
                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://competitor-site.com"
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:border-gray-200 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full URL including https:// or http://
                  </p>
                </div>

                {/* Markup Percentage Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Markup Percentage (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={markup}
                      onChange={(e) => setMarkup(e.target.value)}
                      placeholder="5"
                      min="0"
                      max="500"
                      step="0.5"
                      disabled={loading}
                      className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:border-gray-200 disabled:cursor-not-allowed"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 font-medium pointer-events-none">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Applied to all imported product prices. Example: 5% markup
                    on $100 = $105
                  </p>
                </div>

                {/* Formula Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Price Calculation Formula
                  </p>
                  <code className="text-xs text-blue-800 font-mono">
                    NewPrice = BasePrice × (1 + Markup% / 100)
                  </code>
                  <p className="text-xs text-blue-700 mt-2">
                    Example: $100 + 5% markup = ${(100 * 1.05).toFixed(2)}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Analyzing & Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Analyze & Import
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info Section */}
            <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  How It Works
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Scrape</p>
                      <p className="text-sm text-gray-600">
                        Fetches and cleans website content
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Parse</p>
                      <p className="text-sm text-gray-600">
                        AI extracts products and variants
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Calculate</p>
                      <p className="text-sm text-gray-600">
                        Applies markup formula to prices
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Import</p>
                      <p className="text-sm text-gray-600">
                        Saves products to your database
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Tip:</span> Start with a 5-10%
                  markup for competitive pricing. Adjust based on your margin
                  requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {showResults && result && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {result.success ? (
              <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      {result.message}
                    </h3>
                    <p className="text-green-700 mb-4">
                      {result.imported} products have been successfully added to
                      your database.
                    </p>

                    {/* Results Summary */}
                    <div className="grid grid-cols-2 gap-4 mt-4 mb-6">
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <p className="text-sm text-gray-600">Imported</p>
                        <p className="text-2xl font-bold text-green-600">
                          {result.imported}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600">Failed</p>
                        <p className="text-2xl font-bold text-gray-600">
                          {result.failed}
                        </p>
                      </div>
                    </div>

                    {/* Product Preview */}
                    {result.products.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Sample Products:
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {result.products.slice(0, 5).map((product, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 bg-white rounded border border-gray-100 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-gray-700 flex-1">
                                {product.name}
                              </span>
                              <span className="text-gray-500 text-xs">
                                ${product.price?.toFixed(2) || 'N/A'}
                              </span>
                            </div>
                          ))}
                          {result.products.length > 5 && (
                            <p className="text-xs text-gray-500 p-2 text-center">
                              +{result.products.length - 5} more products
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      {result.message}
                    </h3>

                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-red-800 mb-2">
                          Details:
                        </p>
                        <ul className="space-y-1 text-sm text-red-700 bg-white rounded p-3 border border-red-100">
                          {result.errors.map((err, i) => (
                            <li key={i} className="flex gap-2">
                              <span>•</span>
                              <span>{err}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.imported > 0 && (
                      <p className="text-sm text-red-700 mt-3">
                        However, {result.imported} product(s) were imported
                        before the error occurred.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button */}
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowResults(false);
                  setResult(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium text-sm"
              >
                Import More
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-1">Fast</h3>
            <p className="text-sm text-gray-600">
              AI processes products in seconds using OpenRouter
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-indigo-600 mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-1">Accurate</h3>
            <p className="text-sm text-gray-600">
              Smart parsing extracts all product details and variants
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-1">Flexible</h3>
            <p className="text-sm text-gray-600">
              Customize markup per import for competitive pricing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
