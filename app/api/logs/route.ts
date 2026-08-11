import { NextResponse } from 'next/server';
import { createServiceClient, OWNER_USER_ID } from '@/lib/supabase/server';
import { mockStore } from '@/lib/supabase/mock-store';

// GET /api/logs
export async function GET() {
  const supabase = createServiceClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('publication_logs')
      .select(`
        *,
        posts!inner(user_id)
      `)
      .eq('posts.user_id', OWNER_USER_ID)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ logs: data || [] });
  }

  // Fallback: mock store
  return NextResponse.json({ logs: mockStore.getLogs() });
}
