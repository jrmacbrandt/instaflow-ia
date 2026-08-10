'use client';

import { useState } from 'react';
import { mockStore } from '@/lib/supabase/mock-store';
import { Settings, Sparkles, Globe, Key, Save, CheckCircle2, Zap } from 'lucide-react';

export default function SettingsPage() {
  const profile = mockStore.getProfile();
  const [timezone, setTimezone] = useState(profile.default_timezone);
  const [aiTone, setAiTone] = useState(profile.ai_default_tone);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    mockStore.updateProfile({
      default_timezone: timezone,
      ai_default_tone: aiTone,
    });

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Configurações da Conta & IA <Settings className="w-6 h-6 text-purple-400" />
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Defina seu fuso horário padrão para agendamentos e personalize o tom de voz da IA Generativa.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        {/* Timezone Section */}
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" /> Fuso Horário Padrão
          </h3>
          <p className="text-xs text-slate-400">
            Todos os seus agendamentos utilizarão este fuso para determinar a hora exata da publicação.
          </p>

          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="America/Sao_Paulo">América/São Paulo (UTC-03:00)</option>
            <option value="America/Manaus">América/Manaus (UTC-04:00)</option>
            <option value="Europe/Lisbon">Europa/Lisboa (UTC+01:00)</option>
            <option value="UTC">Tempo Universal (UTC)</option>
          </select>
        </div>

        {/* AI Preferences Section */}
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Preferências de IA Gemini
          </h3>
          <p className="text-xs text-slate-400">
            Configure o tom de voz padrão para sugestões automáticas de legenda.
          </p>

          <div className="space-y-1.5 max-w-md">
            <label className="text-xs font-semibold text-slate-300">Tom de Voz Padrão</label>
            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Envolvente & Criativo">Envolvente & Criativo</option>
              <option value="Profissional">Profissional & Focado em Autoridade</option>
              <option value="Vendedor">Vendedor / Alta Conversão (CTA forte)</option>
              <option value="Engraçado">Descontraído & Engraçado</option>
            </select>
          </div>
        </div>

        {/* AI Quota Meter Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> Cota de Uso da API Gemini
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 max-w-md">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Gerações de Texto (Hoje):</span>
              <span className="font-bold text-purple-400">12 / 1000 requisições</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[1.2%]" />
            </div>
            <p className="text-[10px] text-slate-500">Limites do tier gratuito mantidos com segurança.</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl instagram-gradient-bg text-white font-bold text-xs shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>
    </div>
  );
}
