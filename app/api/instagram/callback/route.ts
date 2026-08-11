import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, OWNER_USER_ID } from '@/lib/supabase/server';
import { mockStore } from '@/lib/supabase/mock-store';

// GET /api/instagram/callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error_message') || searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://instaflow-ia.vercel.app';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=${encodeURIComponent(error || 'Autorização cancelada')}`);
  }

  try {
    const appId = process.env.FACEBOOK_APP_ID || '1669236564150637';
    const appSecret = process.env.FACEBOOK_APP_SECRET || 'd0e59101f28710b8fef7895d24b4ee5e';
    const redirectUri = `${appUrl}/api/instagram/callback`;

    // Step 1: Exchange code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Falha ao obter token do Facebook');
    }

    const shortToken = tokenData.access_token;

    // Step 2: Exchange for long-lived access token (60 days)
    const longTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`;
    const longRes = await fetch(longTokenUrl);
    const longData = await longRes.json();

    const accessToken = longData.access_token || shortToken;

    // Step 3: Fetch linked Facebook Pages & Instagram Business Account
    const meRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}`);
    const meData = await meRes.json();

    const pages = meData.data || [];
    let connectedUsername = 'nova_conta_instagram';
    let igUserId = '';
    let pageId = '';

    for (const page of pages) {
      const pageInfoRes = await fetch(`https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`);
      const pageInfo = await pageInfoRes.json();

      if (pageInfo.instagram_business_account?.id) {
        igUserId = pageInfo.instagram_business_account.id;
        pageId = page.id;

        // Fetch Instagram details
        const igRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}?fields=username,profile_picture_url&access_token=${accessToken}`);
        const igData = await igRes.json();
        if (igData.username) connectedUsername = igData.username;
        break;
      }
    }

    // Save to Supabase (or mockStore)
    const supabase = createServiceClient();
    if (supabase && igUserId) {
      await supabase.from('instagram_accounts').upsert({
        user_id: OWNER_USER_ID,
        instagram_business_account_id: igUserId,
        facebook_page_id: pageId,
        access_token: accessToken,
        token_expires_at: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
        instagram_username: connectedUsername,
        is_active: true,
      });
    } else {
      mockStore.addAccount({
        instagram_username: connectedUsername,
        instagram_business_account_id: igUserId || `${Date.now()}`,
        facebook_page_id: pageId || `${Date.now()}`,
        access_token: accessToken,
      });
    }

    return NextResponse.redirect(`${appUrl}/accounts?success=true&username=${encodeURIComponent(connectedUsername)}`);
  } catch (err: any) {
    return NextResponse.redirect(`${appUrl}/accounts?error=${encodeURIComponent(err.message || 'Erro no callback de autenticação')}`);
  }
}
