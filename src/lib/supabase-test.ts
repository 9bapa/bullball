// Quick test to verify Supabase connection
import { productService } from '@/services/product.service';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
    
    const products = await productService.getAllProducts();
    console.log('✅ Supabase connection successful!');
    console.log(`📦 Found ${products.length} products`);
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

// Export for manual testing
export { testSupabaseConnection };