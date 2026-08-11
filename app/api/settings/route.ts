import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, OWNER_USER_ID } from '@/lib/supabase/server';
import { mockStore } from '@/lib/supabase/mock-store';

// GET /api/settings
export async function GET() {
  const supabase = createServiceClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', OWNER_USER_ID)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ profile: data });
  }

  return NextResponse.json({ profile: mockStore.getProfile() });
}

// POST /api/settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createServiceClient();

    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          default_timezone: body.default_timezone,
          ai_default_tone: body.ai_default_tone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', OWNER_USER_ID)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, profile: data });
    }

    const updated = mockStore.updateProfile(body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
