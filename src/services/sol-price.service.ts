import { supabase } from '@/lib/supabase'

export interface SolPrice {
  current_sol_price: number
}

export class SolPriceService {
  static async getCurrentSolPrice(): Promise<number> {
    try {
      const supabaseClient = supabase!
      
      const { data, error } = await supabaseClient
        .from('bullrhun_metrics')
        .select('current_sol_price')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching SOL price:', error)
        return 0
      }

      return data?.current_sol_price || 0
    } catch (error) {
      console.error('Error fetching SOL price:', error)
      return 0
    }
  }

  static formatUsdToSol(usdAmount: number, solPrice: number): string {
    if (!solPrice || solPrice === 0) return 'N/A'
    
    const solAmount = usdAmount / solPrice
    return `${solAmount.toFixed(6)} SOL`
  }

  static formatPriceWithSol(usdAmount: number, solPrice: number): { usd: string; sol: string } {
    const usd = `$${usdAmount.toFixed(2)}`
    const sol = this.formatUsdToSol(usdAmount, solPrice)
    
    return { usd, sol }
  }
}