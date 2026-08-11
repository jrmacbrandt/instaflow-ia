'use client';

import { useState, useEffect } from 'react';
import { PublicationLog } from '@/lib/types/database';
import { FileText, CheckCircle2, AlertCircle, RefreshCw, Terminal, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LogsPage() {
  const [logs, setLogs] = useState<PublicationLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<PublicationLog | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Logs de Publicação <Terminal className="w-6 h-6 text-purple-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Histórico técnico detalhado de chamadas à Instagram Graph API para auditoria e tratamento de falhas.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-purple-400" />
          <span>Atualizar Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/60">
              <th className="p-4">Data / Hora</th>
              <th className="p-4">Post ID</th>
              <th className="p-4">Ação API</th>
              <th className="p-4">HTTP Status</th>
              <th className="p-4">Mensagem / Detalhes</th>
              <th className="p-4 text-right">Inspecionar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300 font-mono">
            {logs.map((log) => {
              const isSuccess = log.response_status >= 200 && log.response_status < 300;

              return (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-400 whitespace-nowrap">
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </td>
                  <td className="p-4 text-purple-300 font-semibold">{log.post_id}</td>
                  <td className="p-4 text-slate-200">{log.action}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        isSuccess
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {log.response_status}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-slate-400">
                    {log.error_message || JSON.stringify(log.response_body)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Inspecionar Payload JSON"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white font-mono flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" /> Log: {selectedLog.action}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Request Payload:</span>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.request_payload, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Response Body:</span>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-purple-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.response_body, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
