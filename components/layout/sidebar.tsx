'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  Grid, 
  PlusSquare, 
  Users, 
  Settings, 
  FileText, 
  Sparkles, 
  Instagram, 
  Zap,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { PostCreatorModal } from '@/components/posts/post-creator-modal';

interface SidebarProps {
  onPostCreated?: () => void;
}

export function Sidebar({ onPostCreated }: SidebarProps) {
  const pathname = usePathname();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const navItems = [
    { name: 'Calendário & Painel', href: '/', icon: Calendar },
    { name: 'Gerenciador de Posts', href: '/posts', icon: Grid },
    { name: 'Contas do Instagram', href: '/accounts', icon: Users },
    { name: 'Logs de Publicação', href: '/logs', icon: FileText },
    { name: 'Configurações & IA', href: '/settings', icon: Settings },
  ];

  return (
    <>
      <aside className="w-64 h-screen fixed left-0 top-0 z-30 glass-panel flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl instagram-gradient-bg p-0.5 shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-pink-500" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                  Insta<span className="instagram-gradient-text">Flow</span>
                </span>
                <span className="text-[10px] font-semibold text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/50 flex items-center gap-0.5 w-max">
                  <Sparkles className="w-2.5 h-2.5" /> IA Gemini
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Create Post Trigger Button */}
          <div className="p-4">
            <button
              onClick={() => setIsCreatorOpen(true)}
              className="w-full py-3 px-4 rounded-xl instagram-gradient-bg text-white font-medium shadow-lg shadow-pink-500/25 hover:opacity-95 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <PlusSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Novo Post com IA</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/30 text-white border border-purple-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Info Box */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Vercel Cron
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                Ativo 1m
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Publicação automática idempotente executando a cada 60s.
            </p>
          </div>
        </div>
      </aside>

      {/* Post Creator Modal */}
      {isCreatorOpen && (
        <PostCreatorModal
          isOpen={isCreatorOpen}
          onClose={() => setIsCreatorOpen(false)}
          onSuccess={() => {
            setIsCreatorOpen(false);
            if (onPostCreated) onPostCreated();
          }}
        />
      )}
    </>
  );
}
