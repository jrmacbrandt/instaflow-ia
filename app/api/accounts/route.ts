import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, OWNER_USER_ID } from '@/lib/supabase/server';
import { mockStore } from '@/lib/supabase/mock-store';

// GET /api/accounts
export async function GET() {
  const supabase = createServiceClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', OWNER_USER_ID)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ accounts: data || [] });
  }

  // Fallback: mock store
  return NextResponse.json({ accounts: mockStore.getAccounts() });
}

// POST /api/accounts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const supabase = createServiceClient();

    if (action === 'delete') {
      if (supabase) {
        const { error } = await supabase
          .from('instagram_accounts')
          .delete()
          .eq('id', body.id)
          .eq('user_id', OWNER_USER_ID);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }
      const deleted = mockStore.deleteAccount(body.id);
      return NextResponse.json({ success: deleted });
    }

    if (action === 'add') {
      if (supabase) {
        const { data, error } = await supabase
          .from('instagram_accounts')
          .insert({
            user_id: OWNER_USER_ID,
            instagram_business_account_id: body.instagram_business_account_id,
            facebook_page_id: body.facebook_page_id || '',
            access_token: body.access_token,
            token_expires_at: body.token_expires_at,
            instagram_username: body.instagram_username,
            profile_pic_url: body.profile_pic_url || null,
            is_active: true,
          })
          .select()
          .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, account: data });
      }
      const added = mockStore.addAccount(body);
      return NextResponse.json({ success: true, account: added });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
