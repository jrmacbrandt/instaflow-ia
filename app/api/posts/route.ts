import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, OWNER_USER_ID } from '@/lib/supabase/server';
import { mockStore } from '@/lib/supabase/mock-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const accountId = searchParams.get('accountId');

  const supabase = createServiceClient();

  if (supabase) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        instagram_account:instagram_accounts(*)
      `)
      .eq('user_id', OWNER_USER_ID)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (accountId && accountId !== 'all') {
      query = query.eq('instagram_account_id', accountId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ posts: data || [] });
  }

  // Fallback: mock store
  let posts = mockStore.getPosts();
  if (status && status !== 'all') posts = posts.filter(p => p.status === status);
  if (accountId && accountId !== 'all') posts = posts.filter(p => p.instagram_account_id === accountId);

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;
    const supabase = createServiceClient();

    if (action === 'duplicate') {
      if (supabase) {
        const { data: original, error: fetchErr } = await supabase
          .from('posts')
          .select('*')
          .eq('id', body.id)
          .eq('user_id', OWNER_USER_ID)
          .single();

        if (fetchErr || !original) {
          return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
        }

        const { id, created_at, updated_at, instagram_post_id, instagram_permalink, ...rest } = original;

        const { data: dup, error: dupErr } = await supabase
          .from('posts')
          .insert({
            ...rest,
            caption: `${original.caption} (Cópia)`,
            status: 'draft',
            scheduled_at: null,
          })
          .select()
          .single();

        if (dupErr) return NextResponse.json({ error: dupErr.message }, { status: 500 });
        return NextResponse.json({ success: true, post: dup });
      }

      const duplicated = mockStore.duplicatePost(body.id);
      if (!duplicated) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
      return NextResponse.json({ success: true, post: duplicated });
    }

    if (action === 'delete') {
      if (supabase) {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', body.id)
          .eq('user_id', OWNER_USER_ID);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: mockStore.deletePost(body.id) });
    }

    // Save or Update post
    if (supabase) {
      if (body.id) {
        // Update existing
        const { id, created_at, instagram_account, ...updates } = body;
        const { data, error } = await supabase
          .from('posts')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', body.id)
          .eq('user_id', OWNER_USER_ID)
          .select(`*, instagram_account:instagram_accounts(*)`)
          .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, post: data });
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: OWNER_USER_ID,
            instagram_account_id: body.instagram_account_id || null,
            caption: body.caption || '',
            media_type: body.media_type || 'IMAGE',
            media_urls: body.media_urls || [],
            scheduled_at: body.scheduled_at || null,
            status: body.scheduled_at ? 'scheduled' : 'draft',
            ai_generated: !!body.ai_generated,
            ai_prompt: body.ai_prompt || null,
          })
          .select(`*, instagram_account:instagram_accounts(*)`)
          .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, post: data });
      }
    }

    const saved = mockStore.savePost(body);
    return NextResponse.json({ success: true, post: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao processar post' }, { status: 500 });
  }
}
