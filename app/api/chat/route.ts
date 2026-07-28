import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model } = body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not set in frontend .env' }, { status: 500 });
    }

    const actualModel = (model || 'groq/llama-3.3-70b-versatile').replace('groq/', '');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: actualModel,
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Groq API Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const replyContent = data.choices[0]?.message?.content || "No response";

    return NextResponse.json({
      message: { content: replyContent },
      sources: []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
