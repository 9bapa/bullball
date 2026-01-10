#!/bin/bash

# BullRhun Database Schema Deployment Script
echo "🚀 Deploying BullRhun Enhanced Database Schema..."

# Check if required environment variables are set
if [ -z "$POSTGRES_PRISMA_URL" ]; then
    echo "❌ POSTGRES_PRISMA_URL not found in environment"
    exit 1
fi

echo "📋 Schema validation..."
node scripts/validate-schema.js

if [ $? -ne 0 ]; then
    echo "❌ Schema validation failed"
    exit 1
fi

echo "📊 Schema is valid, ready for deployment!"
echo ""
echo "🔧 To deploy to Supabase, run:"
echo "   psql \"\$POSTGRES_URL\" -f database/schema-upgrade-v2-1.sql"
echo ""
echo "   Alternative: psql \"\$POSTGRES_PRISMA_URL\" -f database/schema-upgrade-v2-1.sql"
echo ""
echo "✅ Schema Features Ready:"
echo "   • Complete PumpPortal Integration"
echo "   • Token Creator Analytics" 
echo "   • URI Metadata Processing"
echo "   • Performance Optimization"
echo "   • BullRhun wallet_address compatibility"
echo ""
echo "🎯 Schema Size: $(wc -l database/schema-upgrade-v2-1.sql | awk '{print $1}') lines"