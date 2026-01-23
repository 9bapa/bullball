import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const memeId = params.id

    return NextResponse.json({ success: true, memeId })
  } catch (error) {
    console.error('Error liking meme:', error)
    return NextResponse.json({ error: 'Failed to like meme' }, { status: 500 })
  }
}
