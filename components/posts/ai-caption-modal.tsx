'use client';

import { useState } from 'react';
import { Sparkles, X, Wand2, Copy, Check, Hash, RefreshCw, MessageSquare, Flame } from 'lucide-react';

interface AiCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCaption: (caption: string, hashtags: string[]) => void;
  initialPrompt?: string;
}

export function AiCaptionModal({
  isOpen,
  onClose,
  onApplyCaption,
  initialPrompt = '',
}: AiCaptionModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [tone, setTone] = useState('Envolvente & Criativo');
  const [niche, setNiche] = useState('Moda & Estilo');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [hashtagCount, setHashtagCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [suggestedBestTime, setSuggestedBestTime] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tone,
          niche,
          includeEmojis,
          hashtagCount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedCaption(data.caption);
        setGeneratedHashtags(data.hashtags || []);
        setSuggestedBestTime(data.suggestedBestTime || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    const fullText = `${generatedCaption}\n\n${generatedHashtags.join(' ')}`;
    onApplyCaption(fullText, generatedHashtags);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Assistente de Legenda com IA Gemini</h3>
              <p className="text-xs text-slate-400">Gere copys persuasivas, hashtags e ganchos em segundos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Prompt input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Sobre o que é este post? (Prompt / Ideia)</span>
              <span className="text-[10px] text-slate-500">Ex: Lançamento de bolsa de couro eco</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva a foto, produto ou assunto principal do seu post..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tom de Voz</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="Envolvente & Criativo">Envolvente & Criativo (Padrão)</option>
                <option value="Profissional">Profissional & Focado em Autoridade</option>
                <option value="Vendedor">Vendedor / Alta Conversão (CTA forte)</option>
                <option value="Engraçado">Descontraído & Engraçado</option>
                <option value="Inspiracional">Inspiracional & Emocionante</option>
              </select>
            </div>

            {/* Niche Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Nicho de Mercado</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="Moda & Estilo">Moda, Beleza & Estilo</option>
                <option value="Viagem & Turismo">Viagem & Turismo</option>
                <option value="E-commerce & Produtos">E-commerce & Produtos</option>
                <option value="Gastronomia & Culinária">Gastronomia & Culinária</option>
                <option value="Saúde & Fitness">Saúde, Fitness & Bem-estar</option>
                <option value="Negócios & Tecnologia">Negócios & Tecnologia</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEmojis}
                onChange={(e) => setIncludeEmojis(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
              />
              <span>Incluir Emojis estratégicos</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Hashtags:</span>
              {[3, 5, 8, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setHashtagCount(num)}
                  className={`px-2 py-1 text-xs rounded-lg transition-all ${
                    hashtagCount === num
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Geriando legenda com Gemini IA...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-purple-200" />
                <span>Gerar Sugestão de Legenda</span>
              </>
            )}
          </button>

          {/* Preview Result */}
          {generatedCaption && (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-purple-500/30 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Legenda Gerada
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${generatedCaption}\n\n${generatedHashtags.join(' ')}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="whitespace-pre-line text-sm text-slate-200 leading-relaxed font-sans">
                {generatedCaption}
              </div>

              {generatedHashtags.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                  {generatedHashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-purple-950/60 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {suggestedBestTime && (
                <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  💡 <span className="text-slate-300 font-medium">{suggestedBestTime}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {generatedCaption && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Usar esta Legenda no Post</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
