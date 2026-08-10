import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase/mock-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const accountId = searchParams.get('accountId');

  let posts = mockStore.getPosts();

  if (status && status !== 'all') {
    posts = posts.filter(p => p.status === status);
  }
  if (accountId && accountId !== 'all') {
    posts = posts.filter(p => p.instagram_account_id === accountId);
  }

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === 'duplicate') {
      const duplicated = mockStore.duplicatePost(body.id);
      if (!duplicated) {
        return NextResponse.json({ error: 'Post não encontrado para duplicar' }, { status: 404 });
      }
      return NextResponse.json({ success: true, post: duplicated });
    }

    if (action === 'delete') {
      const deleted = mockStore.deletePost(body.id);
      return NextResponse.json({ success: deleted });
    }

    // Save or Update post
    const saved = mockStore.savePost(body);
    return NextResponse.json({ success: true, post: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao processar post' }, { status: 500 });
  }
}
