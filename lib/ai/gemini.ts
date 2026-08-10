import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateCaptionOptions } from '@/lib/types/database';

export async function generateInstagramCaption(options: GenerateCaptionOptions): Promise<{
  caption: string;
  hashtags: string[];
  suggestedBestTime?: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  const tone = options.tone || 'Envolvente e Criativo';
  const includeEmojis = options.includeEmojis !== false;
  const hashtagCount = options.hashtagCount ?? 5;
  const niche = options.niche || 'Geral / Estilo de Vida';

  if (!apiKey || apiKey.trim() === '') {
    // Intelligent fallback AI generator for instant testing without API key
    return generateFallbackCaption(options);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `Você é um especialista profissional em Copywriting e Social Media Marketing para o Instagram.
Sua missão é criar legendas altamente engajadoras, estruturadas e otimizadas para conversão.

Instruções:
- Tema / Contexto do Post: ${options.prompt}
- Nicho de Mercado: ${niche}
- Tom de Voz: ${tone}
- Emojis: ${includeEmojis ? 'Utilize emojis de forma estratégica no texto' : 'Não inclua emojis'}
- Hashtags: Gere exatamente ${hashtagCount} hashtags relevantes e populares em português.

Formato da resposta:
Retorne no seguinte formato estruturado exatamente como abaixo:
---CAPTION---
[Legenda completa do post aqui com quebras de linha amigáveis e gancho inicial forte]

---HASHTAGS---
#hashtag1 #hashtag2 #hashtag3 ...

---BEST_TIME---
[Sugestão de melhor horário para postar no nicho]`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    const captionMatch = text.match(/---CAPTION---([\s\S]*?)(?=---HASHTAGS---|$)/);
    const hashtagsMatch = text.match(/---HASHTAGS---([\s\S]*?)(?=---BEST_TIME---|$)/);
    const timeMatch = text.match(/---BEST_TIME---([\s\S]*?)$/);

    const captionText = captionMatch ? captionMatch[1].trim() : text;
    const hashtagsString = hashtagsMatch ? hashtagsMatch[1].trim() : '';
    const hashtagsArray = hashtagsString
      .split(/\s+/)
      .filter(h => h.startsWith('#'))
      .slice(0, hashtagCount);

    const suggestedTime = timeMatch ? timeMatch[1].trim() : 'Terças e Quintas às 18:30';

    return {
      caption: captionText,
      hashtags: hashtagsArray.length > 0 ? hashtagsArray : ['#instaflow', '#conteudo', '#instagram'],
      suggestedBestTime: suggestedTime,
    };
  } catch (error) {
    console.error('Gemini API execution error, falling back to smart generator:', error);
    return generateFallbackCaption(options);
  }
}

function generateFallbackCaption(options: GenerateCaptionOptions) {
  const prompt = options.prompt || 'Conteúdo inspirador';
  const tone = options.tone || 'Profissional & Amigável';
  const count = options.hashtagCount ?? 5;

  const sampleCaptions: Record<string, string> = {
    'Casual': `✨ Um toque de inspiração para o seu dia! 🌿\n\n${prompt}. Quando nos dedicamos àquilo que amamos, os resultados chegam naturalmente. O que achou dessa ideia?\n\n💬 Deixe sua opinião nos comentários!`,
    'Profissional': `📊 Estratégia & Foco: ${prompt}.\n\nPara alcançar a excelência no mercado atual, a consistência é a chave principal. Implementar processos claros transforma a rotina e alavanca os resultados.\n\n📌 Salve este post para consultar depois!`,
    'Vendedor': `🔥 NOVIDADE EXCLUSIVA! 🚀\n\nVocê pediu e nós trouxemos: ${prompt}!\n\nGaranta o seu antes que esgoste. Oferta por tempo limitado com condições imperdíveis.\n\n📲 Clique no link da bio para conferir agora mesmo!`,
    'Engraçado': `😅 Quem mais se identifica com isso? ${prompt}!\n\nA vida de quem cria conteúdo não é fácil, mas a gente ama cada segundo. Marca aquele amigo que precisa ver isso hoje! 👇`,
  };

  const selectedCaption = sampleCaptions[tone] || sampleCaptions['Casual'];

  const sampleHashtags = [
    '#InstagramMarketing',
    '#CriacaoDeConteudo',
    '#InstaFlowIA',
    '#Empreendedorismo',
    '#MarketingDigital',
    '#SucessoVisual',
    '#EstrategiaDeConteudo',
    '#DicasDeInstagram',
  ].slice(0, count);

  return {
    caption: selectedCaption,
    hashtags: sampleHashtags,
    suggestedBestTime: 'Horário recomendado: Terça-feira às 19:00 ou Quinta-feira às 12:30',
  };
}
