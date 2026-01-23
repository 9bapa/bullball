import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: memes, error } = await supabaseService
      .from('bullrhun_memes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching memes:', error)
      const fallbackMemes = [
        {
          id: '1',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&h=800&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 234,
          view_count: 1520,
          created_at: new Date('2025-01-20').toISOString(),
          is_featured: true
        },
        {
          id: '2',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=700&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 189,
          view_count: 980,
          created_at: new Date('2025-01-19').toISOString(),
          is_featured: true
        },
        {
          id: '3',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1621504450168-b8c437542777?w=600&h=900&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 312,
          view_count: 2100,
          created_at: new Date('2025-01-18').toISOString(),
          is_featured: false
        },
        {
          id: '4',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=600&h=750&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 156,
          view_count: 890,
          created_at: new Date('2025-01-17').toISOString(),
          is_featured: false
        },
        {
          id: '5',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&h=850&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 278,
          view_count: 1450,
          created_at: new Date('2025-01-16').toISOString(),
          is_featured: true
        },
        {
          id: '6',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=600&h=650&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 198,
          view_count: 1100,
          created_at: new Date('2025-01-15').toISOString(),
          is_featured: false
        },
        {
          id: '7',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1516245834210-c4c14278733f?w=600&h=800&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 245,
          view_count: 1300,
          created_at: new Date('2025-01-14').toISOString(),
          is_featured: true
        },
        {
          id: '8',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=600&h=700&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 167,
          view_count: 920,
          created_at: new Date('2025-01-13').toISOString(),
          is_featured: false
        },
        {
          id: '9',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&h=900&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 289,
          view_count: 1650,
          created_at: new Date('2025-01-12').toISOString(),
          is_featured: true
        },
        {
          id: '10',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=600&h=750&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 134,
          view_count: 780,
          created_at: new Date('2025-01-11').toISOString(),
          is_featured: false
        },
        {
          id: '11',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=850&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 176,
          view_count: 940,
          created_at: new Date('2025-01-10').toISOString(),
          is_featured: false
        },
        {
          id: '12',
          title: 'BullRhun Meme',
          description: 'BullRhun meme',
          media_url: 'https://images.unsplash.com/photo-1622630998477-20aa696ecf05?w=600&h=800&fit=crop',
          media_type: 'image',
          tags: ['BullRhun'],
          likes_count: 223,
          view_count: 1180,
          created_at: new Date('2025-01-09').toISOString(),
          is_featured: false
        }
      ]
      return NextResponse.json(fallbackMemes)
    }

    return NextResponse.json(memes || [])
  } catch (error) {
    console.error('Error fetching memes:', error)
    return NextResponse.json({ error: 'Failed to fetch memes' }, { status: 500 })
  }
}
