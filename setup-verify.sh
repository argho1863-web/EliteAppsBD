#!/bin/bash

# EliteAppsBD AI Product Importer - Quick Setup Script
# Run this to verify all components are in place

echo "🔍 EliteAppsBD AI Product Importer - Setup Verification"
echo "========================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node modules
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    if [ -d "node_modules/axios" ] && [ -d "node_modules/cheerio" ]; then
        echo -e "${GREEN}✓${NC} axios and cheerio installed"
    else
        echo -e "${YELLOW}⚠ Missing dependencies. Run: npm install axios cheerio${NC}"
    fi
else
    echo -e "${RED}✗${NC} node_modules not found. Run: npm install"
    exit 1
fi

echo ""
echo "Checking source files..."

# Check backend utilities
files=(
    "lib/scraper.ts"
    "lib/openrouter.ts"
    "lib/priceCalculator.ts"
    "app/api/admin/import/route.ts"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file"
        all_exist=false
    fi
done

# Check frontend components
if [ -f "components/AIProductImporter.tsx" ]; then
    echo -e "${GREEN}✓${NC} components/AIProductImporter.tsx"
else
    echo -e "${RED}✗${NC} components/AIProductImporter.tsx"
    all_exist=false
fi

# Check admin page
if [ -f "app/admin/import/page.tsx" ]; then
    echo -e "${GREEN}✓${NC} app/admin/import/page.tsx"
else
    echo -e "${RED}✗${NC} app/admin/import/page.tsx"
    all_exist=false
fi

echo ""
echo "Checking environment variables..."

if grep -q "OPENROUTER_API_KEY" .env.local 2>/dev/null; then
    echo -e "${GREEN}✓${NC} OPENROUTER_API_KEY found in .env.local"
else
    echo -e "${YELLOW}⚠ OPENROUTER_API_KEY not found in .env.local${NC}"
    echo "  Add to .env.local:"
    echo "    OPENROUTER_API_KEY=sk-or-v1-..."
    echo "    OPENROUTER_MODEL=google/gemini-2.5-flash"
fi

echo ""
if [ "$all_exist" = true ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ All components verified successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set OPENROUTER_API_KEY in .env.local"
    echo "2. Run: npm run dev"
    echo "3. Visit: http://localhost:3000/admin"
    echo "4. Click 'AI Importer' button"
    echo ""
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ Some files are missing!${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
