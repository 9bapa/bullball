import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet_address } = body
    
    if (!wallet_address) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { status: 400 }
      )
    }

    // Fetch user by wallet address
    const { data: user, error } = await supabase
      .from('bullrhun_users')
      .select('*')
      .eq('wallet_address', wallet_address.toLowerCase())

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500 }
      )
    }
    
    console.log('Query result:', user)
    console.log('Wallet address:', wallet_address.toLowerCase())
    
    if (!user || user.length === 0) {
      return new Response(
        JSON.stringify({ data: null }),
        { status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ data: user[0] }),
      { status: 200 }
    )
  } catch (error) {
    console.error('API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}