import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, OWNER_USER_ID } from '@/lib/supabase/server';
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

  if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();

  let duePosts: Post[] = [];

  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, instagram_account:instagram_accounts(*)`)
      .eq('user_id', OWNER_USER_ID)
      .eq('status', 'scheduled')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    duePosts = data || [];
  } else {
    const allPosts = mockStore.getPosts();
    duePosts = allPosts
      .filter(p => p.status === 'scheduled' && p.scheduled_at && new Date(p.scheduled_at) <= now)
      .slice(0, 5);
  }

  if (duePosts.length === 0) {
    return NextResponse.json({
      message: 'Nenhum post pendente para publicação neste momento.',
      timestamp: now.toISOString(),
      processedCount: 0,
    });
  }

  const results: any[] = [];

  for (const post of duePosts) {
    // Lock post to 'publishing'
    if (supabase) {
      await supabase
        .from('posts')
        .update({ status: 'publishing', updated_at: new Date().toISOString() })
        .eq('id', post.id);
    } else {
      mockStore.savePost({ id: post.id, status: 'publishing' });
    }

    const publishResult = await publishPostToInstagram(post);

    // Persist logs
    for (const log of publishResult.logs) {
      if (supabase) {
        await supabase.from('publication_logs').insert({
          post_id: log.post_id,
          attempt: log.attempt,
          action: log.action,
          request_payload: log.request_payload,
          response_status: log.response_status,
          response_body: log.response_body,
          error_message: log.error_message || null,
        });
      } else {
        mockStore.addLog(log);
      }
    }

    if (publishResult.success) {
      if (supabase) {
        await supabase
          .from('posts')
          .update({
            status: 'published',
            instagram_post_id: publishResult.instagram_post_id || null,
            instagram_permalink: publishResult.instagram_permalink || null,
            failure_reason: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);
      } else {
        mockStore.savePost({
          id: post.id,
          status: 'published',
          instagram_post_id: publishResult.instagram_post_id,
          instagram_permalink: publishResult.instagram_permalink,
          failure_reason: null,
        });
      }

      results.push({
        id: post.id,
        status: 'published',
        instagram_post_id: publishResult.instagram_post_id,
        permalink: publishResult.instagram_permalink,
      });
    } else {
      if (supabase) {
        await supabase
          .from('posts')
          .update({
            status: 'failed',
            failure_reason: publishResult.error || 'Erro durante a publicação',
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);
      } else {
        mockStore.savePost({
          id: post.id,
          status: 'failed',
          failure_reason: publishResult.error || 'Erro durante a publicação',
        });
      }

      results.push({ id: post.id, status: 'failed', error: publishResult.error });
    }
  }

  return NextResponse.json({
    message: `Processamento do cron concluído. ${results.length} posts atualizados.`,
    timestamp: now.toISOString(),
    processedCount: results.length,
    results,
  });
}
