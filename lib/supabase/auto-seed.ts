import { SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_MOCK_ACCOUNTS } from '@/lib/supabase/mock-store';

/**
 * Auto-seed: garante que as contas do INITIAL_MOCK_ACCOUNTS sempre existam
 * no Supabase quando nenhuma conta estiver cadastrada para o owner.
 * Chamado automaticamente pelo GET /api/accounts.
 */
export async function autoSeedAccountsIfEmpty(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<void> {
  try {
    // Verifica se já existem contas no Supabase
    const { data: existing, error: checkError } = await supabase
      .from('instagram_accounts')
      .select('id')
      .eq('user_id', ownerUserId)
      .limit(1);

    if (checkError || (existing && existing.length > 0)) {
      // Já existe conta ou erro na verificação — não faz nada
      return;
    }

    // Nenhuma conta encontrada — insere as contas do mock-store
    for (const account of INITIAL_MOCK_ACCOUNTS) {
      const { error: insertError } = await supabase
        .from('instagram_accounts')
        .insert({
          user_id: ownerUserId,
          instagram_business_account_id: account.instagram_business_account_id,
          facebook_page_id: account.facebook_page_id,
          access_token: account.access_token,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          instagram_username: account.instagram_username,
          profile_pic_url: account.profile_pic_url || null,
          is_active: account.is_active,
        });

      if (insertError) {
        console.warn(`[auto-seed] Falha ao inserir @${account.instagram_username}:`, insertError.message);
      } else {
        console.log(`[auto-seed] ✅ Conta @${account.instagram_username} sincronizada com Supabase.`);
      }
    }
  } catch (err) {
    // Nunca deixa o seed quebrar a requisição principal
    console.warn('[auto-seed] Erro silencioso durante seed automático:', err);
  }
}
