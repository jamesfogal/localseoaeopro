import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { system, prompt, max_tokens = 2000 } = await req.json();

    if (!system || !prompt) {
      return NextResponse.json({ error: 'system and prompt are required' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens,
        system,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```[\w]*\n?/g, '').trim();

    return NextResponse.json({ result: clean });
  } catch (err) {
    console.error('Claude proxy error:', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
