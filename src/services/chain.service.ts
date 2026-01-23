import { supabase } from '@/lib/supabase'

const supabaseClient = supabase!

export interface Chain {
  id: number
  name: string
  symbol: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateChainRequest {
  name: string
  symbol: string
  is_active?: boolean
}

export interface UpdateChainRequest extends Partial<CreateChainRequest> {
  is_active?: boolean
}

class ChainService {
  async getAllChains(activeOnly: boolean = false): Promise<Chain[]> {
    let query = supabaseClient
      .from('chains')
      .select('*')
      .order('id', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching chains:', error)
      throw new Error(`Failed to fetch chains: ${error.message}`)
    }

    return data || []
  }

  async getChainById(id: number): Promise<Chain | null> {
    const { data, error } = await supabaseClient
      .from('chains')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching chain by ID:', error)
      throw new Error(`Failed to fetch chain: ${error.message}`)
    }

    return data
  }

  async createChain(chain: CreateChainRequest): Promise<Chain> {
    const { data, error } = await supabaseClient
      .from('chains')
      .insert([chain])
      .select()
      .single()

    if (error) {
      console.error('Error creating chain:', error)
      throw new Error(`Failed to create chain: ${error.message}`)
    }

    return data
  }

  async updateChain(id: number, chain: UpdateChainRequest): Promise<Chain> {
    const { data, error } = await supabaseClient
      .from('chains')
      .update(chain)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating chain:', error)
      throw new Error(`Failed to update chain: ${error.message}`)
    }

    return data
  }

  async deleteChain(id: number): Promise<void> {
    const { error } = await supabaseClient
      .from('chains')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting chain:', error)
      throw new Error(`Failed to delete chain: ${error.message}`)
    }
  }

  async toggleActive(id: number, is_active: boolean): Promise<Chain> {
    return this.updateChain(id, { is_active })
  }

  async searchChains(query: string): Promise<Chain[]> {
    const { data, error } = await supabaseClient
      .from('chains')
      .select('*')
      .or(`name.ilike.%${query}%,symbol.ilike.%${query}%`)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error searching chains:', error)
      throw new Error(`Failed to search chains: ${error.message}`)
    }

    return data || []
  }

  async getChains(activeOnly: boolean = false): Promise<Chain[]> {
    return this.getAllChains(activeOnly)
  }
}

export { ChainService }
export const chainService = new ChainService()
