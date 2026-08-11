'use client';

import { useState, useEffect } from 'react';
import { InstagramAccount } from '@/lib/types/database';
import { 
  Instagram, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Key, 
  ExternalLink,
  Facebook
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectSuccessMsg, setConnectSuccessMsg] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRealFacebookOAuth = () => {
    setIsConnecting(true);
    const appId = '1669236564150637';
    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/api/instagram/callback` : 'https://instaflow-ia.vercel.app/api/instagram/callback';
    const scope = 'instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list';
    
    // Facebook Login Dialog for Instagram Business Graph API
    const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;
    window.location.href = authUrl;
  };

  const handleDeleteAccount = async (id: string, username: string) => {
    if (confirm(`Deseja desconectar a conta @${username}?`)) {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      fetchAccounts();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Contas do Instagram <Instagram className="w-6 h-6 text-pink-500" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Conecte suas contas Business / Creator via Facebook Login para habilitar agendamentos e publicação direta.
          </p>
        </div>

        <button
          onClick={handleRealFacebookOAuth}
          disabled={isConnecting}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isConnecting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Facebook className="w-5 h-5 fill-white" />
          )}
          <span>{isConnecting ? 'Autenticando com Facebook...' : 'Conectar Nova Conta do Instagram'}</span>
        </button>
      </div>

      {connectSuccessMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{connectSuccessMsg}</span>
        </div>
      )}

      {/* Linked Accounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => {
          const expiresAt = acc.token_expires_at ? new Date(acc.token_expires_at) : null;
          const daysLeft = expiresAt
            ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 3600 * 24))
            : 0;
          const isExpiringSoon = daysLeft <= 5;

          return (
            <div
              key={acc.id}
              className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden"
            >
              {/* Account Top Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={acc.profile_pic_url || ''}
                      alt={acc.instagram_username}
                      className="w-14 h-14 rounded-full object-cover border-2 border-pink-500 p-0.5"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      @{acc.instagram_username}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Facebook className="w-3 h-3 text-blue-400" /> Página Facebook ID: {acc.facebook_page_id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAccount(acc.id, acc.instagram_username)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Desconectar conta"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Status details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Permissões Graph API
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    instagram_content_publish
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-800/60">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-purple-400" /> Validade do Token
                  </span>
                  <span className={`font-semibold ${isExpiringSoon ? 'text-amber-400' : 'text-slate-300'}`}>
                    {expiresAt
                      ? `${daysLeft} dias restantes (${format(expiresAt, 'dd/MM/yyyy')})`
                      : 'Indefinido'}
                  </span>
                </div>
              </div>

              {/* Token Renewal Banner if expiring soon */}
              {isExpiringSoon && (
                <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl text-xs text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" /> Token expira em breve!
                  </span>
                  <button
                    onClick={handleRealFacebookOAuth}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px] transition-all"
                  >
                    Renovar Agora
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
