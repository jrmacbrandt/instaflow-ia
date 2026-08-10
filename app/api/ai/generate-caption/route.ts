import { NextRequest, NextResponse } from 'next/server';
import { generateInstagramCaption } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, tone, includeEmojis, hashtagCount, niche, callToAction } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    const result = await generateInstagramCaption({
      prompt,
      tone,
      includeEmojis,
      hashtagCount,
      niche,
      callToAction,
    });

    return NextResponse.json({
      success: true,
      caption: result.caption,
      hashtags: result.hashtags,
      suggestedBestTime: result.suggestedBestTime,
    });
  } catch (error: any) {
    console.error('Error generating caption:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerar legenda com IA' }, { status: 500 });
  }
}
