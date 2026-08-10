'use client';

import { useState, useEffect } from 'react';
import { mockStore } from '@/lib/supabase/mock-store';
import { Post, PostStatus } from '@/lib/types/database';
import { PostCreatorModal } from '@/components/posts/post-creator-modal';
import { 
  Grid, 
  List, 
  Search, 
  PlusSquare, 
  Copy, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const fetchPosts = () => {
    setPosts(mockStore.getPosts());
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDuplicate = (id: string) => {
    mockStore.duplicatePost(id);
    fetchPosts();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      mockStore.deletePost(id);
      fetchPosts();
    }
  };

  const handleRetryPublish = async (post: Post) => {
    mockStore.savePost({
      id: post.id,
      status: 'scheduled',
      scheduled_at: new Date().toISOString(),
    });
    fetchPosts();
    await fetch('/api/cron/publish', { method: 'POST' });
    fetchPosts();
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab !== 'all' && post.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCaption = post.caption?.toLowerCase().includes(q);
      const matchAccount = post.instagram_account?.instagram_username.toLowerCase().includes(q);
      return matchCaption || matchAccount;
    }
    return true;
  });

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'scheduled':
        return <span className="badge-scheduled px-2.5 py-0.5 rounded-full text-xs font-semibold">Agendado</span>;
      case 'published':
        return <span className="badge-published px-2.5 py-0.5 rounded-full text-xs font-semibold">Publicado</span>;
      case 'failed':
        return <span className="badge-failed px-2.5 py-0.5 rounded-full text-xs font-semibold">Falha</span>;
      case 'publishing':
        return <span className="badge-publishing px-2.5 py-0.5 rounded-full text-xs font-semibold">Publicando...</span>;
      default:
        return <span className="badge-draft px-2.5 py-0.5 rounded-full text-xs font-semibold">Rascunho</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Gerenciador & Histórico de Posts</h1>
          <p className="text-sm text-slate-400 mt-1">
            Filtre, duplique, edite ou acompanhe os detalhes de publicação dos seus posts.
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
          <span>Novo Post</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'scheduled', label: 'Agendados' },
            { id: 'published', label: 'Publicados' },
            { id: 'draft', label: 'Rascunhos' },
            { id: 'failed', label: 'Falhas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar legenda ou conta..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts Cards Grid / List View */}
      {filteredPosts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-purple-500/40 transition-all"
              >
                {/* Media Image Banner */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <img
                    src={post.media_urls[0] || ''}
                    alt="media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">{getStatusBadge(post.status)}</div>

                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md border border-slate-700">
                      {post.media_type}
                    </span>
                    {post.ai_generated && (
                      <span className="text-[10px] bg-purple-950/90 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> IA
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>@{post.instagram_account?.instagram_username || 'Sem conta'}</span>
                      <span>
                        {post.scheduled_at
                          ? format(new Date(post.scheduled_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })
                          : 'Rascunho'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans line-clamp-3">
                      {post.caption || 'Sem legenda inserida'}
                    </p>
                  </div>

                  {post.failure_reason && (
                    <div className="p-2 bg-red-950/60 border border-red-800/80 rounded-lg text-[11px] text-red-300 flex items-center justify-between">
                      <span className="truncate">{post.failure_reason}</span>
                      <button
                        onClick={() => handleRetryPublish(post)}
                        className="text-red-200 hover:text-white underline text-[10px] shrink-0 ml-1 font-semibold"
                      >
                        Tentar De Novo
                      </button>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setIsCreatorOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
                        title="Editar post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(post.id)}
                        className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
                        title="Duplicar post"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded-lg hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Excluir post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {post.instagram_permalink && (
                      <a
                        href={post.instagram_permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <span>Ver no Instagram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View Table */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/60">
                  <th className="p-4">Mídia</th>
                  <th className="p-4">Conta</th>
                  <th className="p-4">Legenda</th>
                  <th className="p-4">Data / Programado</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <img
                        src={post.media_urls[0] || ''}
                        alt="thumb"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                      />
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      @{post.instagram_account?.instagram_username || 'Desconhecido'}
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      {post.caption || 'Sem legenda'}
                    </td>
                    <td className="p-4 text-slate-400">
                      {post.scheduled_at
                        ? format(new Date(post.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : 'Sem data'}
                    </td>
                    <td className="p-4">{getStatusBadge(post.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setIsCreatorOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(post.id)}
                          className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded-lg hover:text-red-400 hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <Grid className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-sm text-slate-400">Nenhum post encontrado com os filtros selecionados.</p>
        </div>
      )}

      {/* Post Creator Modal */}
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
