import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, role } = body

    console.log('DELETE meme request received:', { id, role })

    if (!id) {
      return NextResponse.json({ error: 'Meme ID is required' }, { status: 400 })
    }

    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Only super_admin can delete memes.' }, { status: 403 })
    }

    const { data: meme, error: fetchError } = await supabaseService
      .from('bullrhun_memes')
      .select('media_url')
      .eq('id', id)
      .single()

    if (fetchError || !meme) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 })
    }

    const filePath = meme.media_url?.split('images/')[1]?.split('?')[0]
    if (filePath) {
      const { error: storageError } = await supabaseService.storage
        .from('images')
        .remove([`images/${filePath}`])

      if (storageError) {
        console.error('Supabase storage delete error:', storageError)
      }
    }

    const { error: deleteError } = await supabaseService
      .from('bullrhun_memes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete meme' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Meme deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
