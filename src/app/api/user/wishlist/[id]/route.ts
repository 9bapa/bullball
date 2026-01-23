import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// DELETE /api/user/wishlist/[id] - Remove item from wishlist (already in route.ts)
// POST /api/user/wishlist/[id]/cart - Add wishlist item to cart (already in route.ts)