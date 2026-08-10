'use client';

import { useState } from 'react';
import { Post, PostStatus } from '@/lib/types/database';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Instagram, 
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InteractiveCalendarProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onCreateNewPost: (date?: Date) => void;
}

export function InteractiveCalendar({ posts, onSelectPost, onCreateNewPost }: InteractiveCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getStatusBadgeClass = (status: PostStatus) => {
    switch (status) {
      case 'scheduled':
        return 'badge-scheduled';
      case 'published':
        return 'badge-published';
      case 'failed':
        return 'badge-failed';
      case 'publishing':
        return 'badge-publishing';
      default:
        return 'badge-draft';
    }
  };

  const getStatusLabel = (status: PostStatus) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'published': return 'Publicado';
      case 'failed': return 'Falha';
      case 'publishing': return 'Publicando...';
      default: return 'Rascunho';
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <p className="text-xs text-slate-400">Visualização de agendamentos do Instagram</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Hoje
          </button>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 py-1">
        <span>DOM</span>
        <span>SEG</span>
        <span>TER</span>
        <span>QUA</span>
        <span>QUI</span>
        <span>SEX</span>
        <span>SÁB</span>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((dateDay, idx) => {
          const isCurrentMonthDay = isSameMonth(dateDay, currentMonth);
          const isToday = isSameDay(dateDay, new Date());

          // Find posts for this day
          const dayPosts = posts.filter(
            p => p.scheduled_at && isSameDay(new Date(p.scheduled_at), dateDay)
          );

          return (
            <div
              key={idx}
              className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition-all group ${
                isCurrentMonthDay
                  ? isToday
                    ? 'bg-purple-950/20 border-purple-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  : 'bg-slate-950/20 border-slate-900 opacity-40'
              }`}
            >
              {/* Date Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400'
                  }`}
                >
                  {format(dateDay, 'd')}
                </span>

                <button
                  onClick={() => onCreateNewPost(dateDay)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all"
                  title="Agendar post neste dia"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Posts list */}
              <div className="space-y-1 mt-1 overflow-y-auto max-h-[85px]">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onSelectPost(post)}
                    className={`p-1.5 rounded-lg border text-[11px] font-medium cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-1.5 ${getStatusBadgeClass(
                      post.status
                    )}`}
                  >
                    {post.media_urls[0] && (
                      <img
                        src={post.media_urls[0]}
                        alt="thumb"
                        className="w-5 h-5 rounded object-cover shrink-0"
                      />
                    )}

                    <div className="truncate flex-1">
                      <span className="truncate block font-semibold leading-tight">
                        {post.caption ? post.caption.substring(0, 18) : 'Sem legenda'}
                      </span>
                      <span className="text-[9px] opacity-80 block">
                        {post.scheduled_at ? format(new Date(post.scheduled_at), 'HH:mm') : ''}
                      </span>
                    </div>

                    {post.ai_generated && (
                      <span title="Gerado com IA Gemini">
                        <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
