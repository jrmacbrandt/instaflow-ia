'use client';

import { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertCircle, RefreshCw, Instagram, Bell, Globe } from 'lucide-react';
import { Profile, InstagramAccount } from '@/lib/types/database';

interface HeaderProps {
  onRefreshNeeded?: () => void;
}

export function Header({ onRefreshNeeded }: HeaderProps) {
  const [isRunningCron, setIsRunningCron] = useState(false);
  const [cronNotification, setCronNotification] = useState<string | null>(null);
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: 'José Roberto Machado Brandt',
    default_timezone: 'America/Sao_Paulo',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  });
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { if (data.profile) setProfile(data.profile); })
      .catch(console.error);

    fetch('/api/accounts')
      .then(r => r.json())
      .then(data => { if (data.accounts) setAccounts(data.accounts); })
      .catch(console.error);
  }, []);

  const activeAccount = accounts[0] || null;

  const triggerCronExecution = async () => {
    setIsRunningCron(true);
    setCronNotification(null);

    try {
      const res = await fetch('/api/cron/publish', { method: 'POST' });
      const data = await res.json();

      if (data.processedCount > 0) {
        setCronNotification(` Cron executado com sucesso: ${data.processedCount} post(s) publicados!`);
      } else {
        setCronNotification(' Cron executado: Nenhum post com horário vencido no momento.');
      }

      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      setCronNotification(' Erro ao disparar cron manual: ' + err.message);
    } finally {
      setIsRunningCron(false);
      setTimeout(() => setCronNotification(null), 5000);
    }
  };

  return (
    <header className="h-16 ml-64 glass-panel border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Active Account Switcher Indicator */}
      <div className="flex items-center gap-3">
        {activeAccount ? (
          <div className="flex items-center gap-2.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <img
              src={activeAccount.profile_pic_url || ''}
              alt={activeAccount.instagram_username}
              className="w-6 h-6 rounded-full object-cover border border-pink-500/50"
            />
            <span className="text-xs font-semibold text-slate-200">@{activeAccount.instagram_username}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Conexão Ativa" />
          </div>
        ) : (
          <div className="text-xs text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-full border border-amber-800 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Nenhuma conta do Instagram vinculada
          </div>
        )}

        <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span>Fuso: {profile.default_timezone}</span>
        </div>
      </div>

      {/* Actions & Cron Manual Trigger */}
      <div className="flex items-center gap-3">
        {cronNotification && (
          <div className="hidden lg:flex items-center gap-2 text-xs bg-purple-950/80 text-purple-200 border border-purple-800/80 px-3 py-1.5 rounded-lg animate-fade-in">
            <span>{cronNotification}</span>
          </div>
        )}

        <button
          onClick={triggerCronExecution}
          disabled={isRunningCron}
          className="text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 hover:text-purple-200 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          title="Executa verificação manual de posts agendados para a hora atual"
        >
          {isRunningCron ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
          ) : (
            <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
          )}
          <span>{isRunningCron ? 'Processando...' : 'Executar Cron Agora'}</span>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
          <img
            src={profile.avatar_url || ''}
            alt={profile.full_name || 'User'}
            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">{profile.full_name}</p>
            <p className="text-[10px] text-slate-400">Social Media</p>
          </div>
        </div>
      </div>
    </header>
  );
}
