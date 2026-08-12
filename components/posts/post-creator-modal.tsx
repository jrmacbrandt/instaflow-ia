'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  Instagram, 
  Image as ImageIcon, 
  Film, 
  Layers, 
  Send, 
  Save, 
  AlertCircle,
  Trash2,
  Smile,
  Check
} from 'lucide-react';
import { Post, PostMediaType, InstagramAccount } from '@/lib/types/database';

import { AiCaptionModal } from './ai-caption-modal';

interface PostCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPost?: Post | null;
}

export function PostCreatorModal({
  isOpen,
  onClose,
  onSuccess,
  initialPost,
}: PostCreatorModalProps) {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialPost?.instagram_account_id || ''
  );

  useEffect(() => {
    fetch('/api/accounts')
      .then(r => r.json())
      .then(data => {
        const list = data.accounts || [];
        setAccounts(list);
        if (!selectedAccountId && list.length > 0) {
          setSelectedAccountId(initialPost?.instagram_account_id || list[0]?.id || '');
        }
      })
      .catch(console.error);
  }, []);

  const [mediaType, setMediaType] = useState<PostMediaType>(initialPost?.media_type || 'IMAGE');
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    initialPost?.media_urls || [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
    ]
  );
  const [caption, setCaption] = useState(initialPost?.caption || '');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scheduling date/time inputs
  const now = new Date();
  const defaultScheduleTime = new Date(now.getTime() + 2 * 3600 * 1000); // 2 hours from now
  const [scheduleDate, setScheduleDate] = useState(
    initialPost?.scheduled_at
      ? new Date(initialPost.scheduled_at).toISOString().split('T')[0]
      : defaultScheduleTime.toISOString().split('T')[0]
  );
  const [scheduleTime, setScheduleTime] = useState(
    initialPost?.scheduled_at
      ? new Date(initialPost.scheduled_at).toTimeString().substring(0, 5)
      : defaultScheduleTime.toTimeString().substring(0, 5)
  );

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newUrls.push(url);
    });

    if (mediaType === 'CAROUSEL') {
      const combined = [...mediaUrls, ...newUrls].slice(0, 10);
      setMediaUrls(combined);
    } else {
      setMediaUrls([newUrls[0]]);
    }
  };

  const handleAddSampleMedia = (type: PostMediaType) => {
    setMediaType(type);
    if (type === 'IMAGE') {
      const samples = [
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      ];
      setMediaUrls([samples[0]]);
    } else if (type === 'VIDEO') {
      setMediaUrls(['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4']);
    } else if (type === 'CAROUSEL') {
      setMediaUrls([
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
      ]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const updated = mediaUrls.filter((_, idx) => idx !== index);
    setMediaUrls(updated);
    if (activeMediaIndex >= updated.length) {
      setActiveMediaIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSubmit = async (targetStatus: 'draft' | 'scheduled' | 'publish_now') => {
    setError(null);
    setIsSubmitting(true);

    try {
      let finalStatus: Post['status'] = 'draft';
      let scheduledAtIso: string | null = null;

      if (targetStatus === 'scheduled') {
        finalStatus = 'scheduled';
        // Build date in local time (America/Sao_Paulo) by using the date/time string directly.
        // The server will store as ISO; the cron compares via .lte() on UTC—this is consistent.
        const combinedDate = new Date(`${scheduleDate}T${scheduleTime}:00`);
        if (isNaN(combinedDate.getTime())) throw new Error('Data ou hora inválida. Verifique os campos de agendamento.');
        scheduledAtIso = combinedDate.toISOString();
      } else if (targetStatus === 'publish_now') {
        finalStatus = 'scheduled';
        scheduledAtIso = new Date().toISOString(); // Publicação imediata
      }

      const postData: Partial<Post> = {
        id: initialPost?.id,
        instagram_account_id: selectedAccountId || null,
        caption,
        media_type: mediaType,
        media_urls: mediaUrls,
        scheduled_at: scheduledAtIso,
        status: finalStatus,
        ai_generated: initialPost?.ai_generated || false,
        ai_prompt: initialPost?.ai_prompt || null,
      };

      // CORREÇÃO CRÍTICA: Salvar via API REST (não direto no mockStore)
      // Isso garante que o post chegue ao Supabase e seja encontrado pelo cron job
      const saveRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(errData.error || 'Erro ao salvar o post no servidor.');
      }

      if (targetStatus === 'publish_now') {
        // Disparar publicação imediata via cron endpoint
        await fetch('/api/cron/publish', { method: 'POST' });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar o post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg instagram-gradient-bg p-0.5 flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-bold text-base text-white">
                {initialPost ? 'Editar Post Agendado' : 'Criar Novo Post para Instagram'}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Grid */}
          <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            {/* Left Column: Media Upload & Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Formato da Mídia</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSampleMedia('IMAGE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      mediaType === 'IMAGE'
                        ? 'border-purple-500 bg-purple-950/60 text-purple-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Imagem
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSampleMedia('VIDEO')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      mediaType === 'VIDEO'
                        ? 'border-purple-500 bg-purple-950/60 text-purple-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" /> Vídeo / Reels
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSampleMedia('CAROUSEL')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      mediaType === 'CAROUSEL'
                        ? 'border-purple-500 bg-purple-950/60 text-purple-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Carrossel
                  </button>
                </div>
              </div>

              {/* Main Media Preview & Dropzone Box */}
              <div className="relative aspect-square w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center group shadow-inner">
                {mediaUrls.length > 0 ? (
                  mediaType === 'VIDEO' || (mediaUrls[activeMediaIndex] && (mediaUrls[activeMediaIndex].endsWith('.mp4') || mediaUrls[activeMediaIndex].startsWith('blob:') && mediaUrls[activeMediaIndex].includes('video'))) ? (
                    <video
                      src={mediaUrls[activeMediaIndex] || mediaUrls[0]}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={mediaUrls[activeMediaIndex] || mediaUrls[0]}
                      alt="Preview do Post"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <label className="text-center p-6 space-y-3 cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-slate-900/50 transition-colors">
                    <UploadCloud className="w-12 h-12 text-purple-400 animate-bounce" />
                    <div>
                      <p className="text-xs font-bold text-white">Clique para selecionar foto ou vídeo</p>
                      <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, MP4, MOV até 100MB</p>
                    </div>
                    <input
                      type="file"
                      accept={mediaType === 'VIDEO' ? 'video/*' : mediaType === 'CAROUSEL' ? 'image/*,video/*' : 'image/*'}
                      multiple={mediaType === 'CAROUSEL'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Upload Action Overlay on Hover */}
                {mediaUrls.length > 0 && (
                  <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 cursor-pointer backdrop-blur-xs">
                    <UploadCloud className="w-8 h-8 text-white" />
                    <span className="text-xs font-bold text-white bg-purple-600 px-3 py-1.5 rounded-lg shadow-lg">
                      {mediaType === 'CAROUSEL' ? 'Adicionar Mídia Local' : 'Trocar Arquivo Local'}
                    </span>
                    <input
                      type="file"
                      accept={mediaType === 'VIDEO' ? 'video/*' : mediaType === 'CAROUSEL' ? 'image/*,video/*' : 'image/*'}
                      multiple={mediaType === 'CAROUSEL'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Carousel Indicator Badge */}
                {mediaType === 'CAROUSEL' && mediaUrls.length > 1 && (
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700 text-[11px] text-white font-medium">
                    {activeMediaIndex + 1} / {mediaUrls.length}
                  </div>
                )}
              </div>

              {/* Carousel Thumbnail Strip & Local File Upload Button */}
              {mediaType === 'CAROUSEL' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {mediaUrls.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                        activeMediaIndex === idx ? 'border-purple-500 scale-105' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      {mediaUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMedia(idx);
                          }}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-slate-950/80 rounded-full text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {mediaUrls.length < 10 && (
                    <label className="w-14 h-14 rounded-lg border border-dashed border-purple-500/50 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-900/30 flex flex-col items-center justify-center text-purple-300 shrink-0 text-xs font-semibold cursor-pointer transition-all">
                      <UploadCloud className="w-4 h-4" />
                      <span className="text-[10px] mt-0.5">+ Foto</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Account, Caption, AI Generator & Schedule */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Account Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Conta do Instagram Destino</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        @{acc.instagram_username} (Página ID: {acc.facebook_page_id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Caption Area with AI Trigger & Character Limit Counter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Legenda do Post</label>
                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(true)}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gerar com IA Gemini</span>
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Escreva sua legenda aqui, inclua chamadas para ação ou clique no botão acima para usar IA..."
                      rows={6}
                      maxLength={2200}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-all resize-none placeholder:text-slate-600"
                    />
                    <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                      {caption.length} / 2200
                    </div>
                  </div>
                </div>

                {/* Schedule Picker Options */}
                <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-purple-400" /> Programar Data e Hora
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400">Data</span>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400">Horário</span>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit('draft')}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Salvar Rascunho</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSubmit('publish_now')}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-indigo-300 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isSubmitting ? 'Publicando...' : 'Publicar Agora'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit('scheduled')}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 instagram-gradient-bg hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-pink-300 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generator Modal */}
      {isAiModalOpen && (
        <AiCaptionModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onApplyCaption={(generatedText) => setCaption(generatedText)}
          initialPrompt={caption ? caption.substring(0, 100) : ''}
        />
      )}
    </>
  );
}
