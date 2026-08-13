/**
 * seed-account.mjs
 * Insere (ou atualiza) a conta do Instagram no Supabase a partir dos dados do mock-store.
 * Uso: node scripts/seed-account.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oyemorrlloawjqbvosgq.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZW1vcnJsbG9hd2pxYnZvc2dxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjM5MTU2MCwiZXhwIjoyMTAxOTY3NTYwfQ.YN0XTkkvJm44azmX0N8ZWqgNHMgttVKZoOOCRSb2BBg';
const OWNER_USER_ID = '00a4e2ae-eda1-4524-b3b4-45314e588834';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const account = {
  user_id: OWNER_USER_ID,
  instagram_business_account_id: '37370166699293226',
  facebook_page_id: '1669236564150637',
  access_token: 'IGAAXuKWxzyW1BZAGJPZAnB0OHpzLVNFTEhrNURMMDVxQ3hKbFFfd3dVa2VWYUpLUTZAsVkdZAWHRTajNndXBzZAjVua3U1VE9hRWhIM1Q4Y0E4WktJc3NyNjVpUlNlVGpQdEt5V3l1dktCS1VScThSMnJwWFEzWEdlOVQzUUNIZAi1IbwZDZD',
  token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  instagram_username: 'jrbrandt.webdesigner',
  profile_pic_url: 'https://instagram.fstu2-1.fna.fbcdn.net/v/t51.82787-19/684896521_18101235280864641_2414854226926064674_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=107&ccb=7-5&_nc_sid=bf7eb4',
  is_active: true,
};

console.log('🔄 Inserindo conta no Supabase...');
console.log(`   Usuário: @${account.instagram_username}`);
console.log(`   IG Business ID: ${account.instagram_business_account_id}`);

// Verifica se já existe
const { data: existing } = await supabase
  .from('instagram_accounts')
  .select('id')
  .eq('instagram_business_account_id', account.instagram_business_account_id)
  .eq('user_id', OWNER_USER_ID)
  .maybeSingle();

let data, error;

if (existing) {
  console.log(`   Conta já existe (id: ${existing.id}), atualizando...`);
  ({ data, error } = await supabase
    .from('instagram_accounts')
    .update(account)
    .eq('id', existing.id)
    .select()
    .single());
} else {
  ({ data, error } = await supabase
    .from('instagram_accounts')
    .insert(account)
    .select()
    .single());
}

if (error) {
  console.error('❌ Erro ao inserir conta:', error.message);
  console.error('   Detalhes:', error);
  process.exit(1);
}

console.log('✅ Conta inserida/atualizada com sucesso!');
console.log(`   ID gerado: ${data.id}`);
console.log(`   Username: @${data.instagram_username}`);
console.log(`   Token expira em: ${new Date(data.token_expires_at).toLocaleDateString('pt-BR')}`);
