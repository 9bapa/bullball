import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { randomUUID } from 'crypto'

interface MemeData {
  title: string
  description: string
  tags: string[]
  is_featured: boolean
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const walletAddress = formData.get('wallet_address') as string
    const role = formData.get('role') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const tagsStr = formData.get('tags') as string
    const isFeatured = formData.get('is_featured') === 'true'

    if (!walletAddress || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Only super_admin can upload memes.' }, { status: 403 })
    }

    const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(Boolean) : []

    const files: File[] = []
    formData.forEach((value, key) => {
      if (key.startsWith('files[') && value instanceof File) {
        files.push(value)
      }
    })

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
    const uploadedMemes: any[] = []

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        console.error(`Invalid file type: ${file.type}`)
        continue
      }

      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        console.error(`File too large: ${file.size}`)
        continue
      }

      const fileExtension = file.name.split('.').pop()
      const fileName = `memes/${randomUUID()}.${fileExtension}`

      const { data: uploadData, error: uploadError } = await supabaseService.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        continue
      }

      const { data: { publicUrl } } = supabaseService.storage
        .from('images')
        .getPublicUrl(fileName)

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image'

      const { data: memeData, error: memeError } = await supabaseService
        .from('bullrhun_memes')
        .insert({
          title,
          description: description || null,
          media_url: publicUrl,
          media_type: mediaType,
          tags: tags.length > 0 ? tags : null,
          is_featured: isFeatured,
          likes_count: 0,
          view_count: 0
        })
        .select()
        .single()

      if (memeError) {
        console.error('Database insert error:', memeError)
        await supabaseService.storage.from('images').remove([fileName])
        continue
      }

      uploadedMemes.push(memeData)
    }

    if (uploadedMemes.length === 0) {
      return NextResponse.json({ error: 'Failed to upload any memes' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      memes: uploadedMemes,
      message: `Successfully uploaded ${uploadedMemes.length} meme${uploadedMemes.length > 1 ? 's' : ''}`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
