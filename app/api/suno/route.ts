import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const apiKey = process.env.NEXT_PUBLIC_SUNO_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Suno API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.suno.ai/generate/music', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate song' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const clipIds = request.nextUrl.searchParams.get('ids')?.split(',') || []
    const apiKey = process.env.NEXT_PUBLIC_SUNO_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Suno API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`https://api.suno.ai/clips/${clipIds.join(',')}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch song status' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch song status' },
      { status: 500 }
    )
  }
}
