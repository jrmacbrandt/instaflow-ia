'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/types/database';
import { InteractiveCalendar } from '@/components/calendar/interactive-calendar';
import { PostCreatorModal } from '@/components/posts/post-creator-modal';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  PlusSquare, 
  Play, 
  Grid, 
  ExternalLink,
  Instagram,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const totalScheduled = posts.filter(p => p.status === 'scheduled').length;
  const totalPublished = posts.filter(p => p.status === 'published').length;
  const totalFailed = posts.filter(p => p.status === 'failed').length;
  const totalDrafts = posts.filter(p => p.status === 'draft').length;
  const totalAiPosts = posts.filter(p => p.ai_generated).length;

  const upcomingPosts = posts
    .filter(p => p.status === 'scheduled' && p.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Painel de Agendamento <span className="instagram-gradient-text">InstaFlow</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gerencie, crie com IA e automatize a publicação de posts no Instagram em minutos.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPost(null);
            setIsCreatorOpen(true);
          }}
          className="px-5 py-3 rounded-xl instagram-gradient-bg text-white font-bold text-sm shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <PlusSquare className="w-5 h-5" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Scheduled Card */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold">Agendados</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">{totalScheduled}</p>
          <p className="text-[10px] text-slate-400">Aguardando horário</p>
        </div>

        {/* Published Card */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold">Publicados</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">{totalPublished}</p>
          <p className="text-[10px] text-slate-400">No Instagram</p>
        </div>

        {/* Drafts Card */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Rascunhos</span>
            <Grid className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">{totalDrafts}</p>
          <p className="text-[10px] text-slate-400">Em preparação</p>
        </div>

        {/* Failed Card */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-semibold">Falhas</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">{totalFailed}</p>
          <p className="text-[10px] text-slate-400">Requer atenção</p>
        </div>

        {/* AI Generations Card */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1 bg-gradient-to-br from-purple-950/40 to-slate-900">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold">Posts com IA</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalAiPosts}</p>
          <p className="text-[10px] text-purple-300">Gemini 1.5 Flash</p>
        </div>
      </div>

      {/* Main Grid: Calendar & Upcoming Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Section (8 cols) */}
        <div className="lg:col-span-8">
          <InteractiveCalendar
            posts={posts}
            onSelectPost={(p) => {
              setSelectedPost(p);
              setIsCreatorOpen(true);
            }}
            onCreateNewPost={() => {
              setSelectedPost(null);
              setIsCreatorOpen(true);
            }}
          />
        </div>

        {/* Upcoming Posts & Status (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" /> Próximos da Fila
              </h3>
              <span className="text-xs text-slate-400">{upcomingPosts.length} agendados</span>
            </div>

            {upcomingPosts.length > 0 ? (
              <div className="space-y-3">
                {upcomingPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post);
                      setIsCreatorOpen(true);
                    }}
                    className="p-3 bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 rounded-xl cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <img
                      src={post.media_urls[0] || ''}
                      alt="thumb"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {post.caption || 'Sem legenda'}
                      </p>
                      <p className="text-[11px] text-purple-400 font-medium mt-0.5">
                        {post.scheduled_at
                          ? format(new Date(post.scheduled_at), "dd/MM 'às' HH:mm", { locale: ptBR })
                          : ''}
                      </p>
                    </div>

                    <span className="text-[10px] bg-blue-950/80 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded-full shrink-0">
                      {post.media_type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Nenhum post agendado na fila.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Creator / Edit Modal */}
      {isCreatorOpen && (
        <PostCreatorModal
          isOpen={isCreatorOpen}
          onClose={() => setIsCreatorOpen(false)}
          onSuccess={() => {
            setIsCreatorOpen(false);
            fetchPosts();
          }}
          initialPost={selectedPost}
        />
      )}
    </div>
  );
}
