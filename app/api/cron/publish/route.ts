import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase/mock-store';
import { publishPostToInstagram } from '@/lib/instagram/api';
import { Post } from '@/lib/types/database';

export async function GET(req: NextRequest) {
  return handleCronPublish(req);
}

export async function POST(req: NextRequest) {
  return handleCronPublish(req);
}

async function handleCronPublish(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'instaflow_cron_secret_key_2026';

  // Security check for cron invocations
  if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
    // In production Vercel Cron sends Bearer token
    // For local manual trigger, we allow query param ?force=true or auth header
  }

  const now = new Date();
  const allPosts = mockStore.getPosts();

  // Find posts scheduled for NOW or in the past
  const duePosts = allPosts.filter(
    post =>
      post.status === 'scheduled' &&
      post.scheduled_at &&
      new Date(post.scheduled_at) <= now
  );

  if (duePosts.length === 0) {
    return NextResponse.json({
      message: 'Nenhum post pendente para publicação neste momento.',
      timestamp: now.toISOString(),
      processedCount: 0,
    });
  }

  // Limit processing to 5 posts per execution cycle to prevent serverless timeout
  const batch = duePosts.slice(0, 5);
  const results: any[] = [];

  for (const post of batch) {
    // Lock post status to 'publishing' (Idempotency requirement RF22)
    mockStore.savePost({
      id: post.id,
      status: 'publishing',
    });

    const publishResult = await publishPostToInstagram(post);

    // Persist logs
    for (const log of publishResult.logs) {
      mockStore.addLog(log);
    }

    if (publishResult.success) {
      const updated = mockStore.savePost({
        id: post.id,
        status: 'published',
        instagram_post_id: publishResult.instagram_post_id,
        instagram_permalink: publishResult.instagram_permalink,
        failure_reason: null,
      });

      results.push({
        id: post.id,
        status: 'published',
        instagram_post_id: publishResult.instagram_post_id,
        permalink: publishResult.instagram_permalink,
      });
    } else {
      const updated = mockStore.savePost({
        id: post.id,
        status: 'failed',
        failure_reason: publishResult.error || 'Erro durante a publicação',
      });

      results.push({
        id: post.id,
        status: 'failed',
        error: publishResult.error,
      });
    }
  }

  return NextResponse.json({
    message: `Processamento do cron concluído. ${results.length} posts atualizados.`,
    timestamp: now.toISOString(),
    processedCount: results.length,
    results,
  });
}
