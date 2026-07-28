import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const models = [
    { id: 'groq/llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
    { id: 'groq/llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    { id: 'groq/mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    { id: 'groq/gemma2-9b-it', name: 'Gemma 2 9B IT' }
  ];

  return NextResponse.json({ models });
}
