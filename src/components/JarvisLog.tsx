import React, { useRef, useEffect } from 'react';
import { Terminal, Volume2, Trash2 } from 'lucide-react';
import type { VoiceInteractionLog } from '../types/jarvis';

interface JarvisLogProps {
  logs: VoiceInteractionLog[];
  onClearLogs: () => void;
  onReplaySpeech: (text: string) => void;
}

export const JarvisLog: React.FC<JarvisLogProps> = ({ logs, onClearLogs, onReplaySpeech }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full bg-slate-950/90 border border-cyan-950/80 rounded-xl p-4 shadow-lg font-mono">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-900 text-xs">
        <div className="flex items-center gap-2 text-cyan-400">
          <Terminal className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider">J.A.R.V.I.S. Neural Speech & Directive Log</span>
        </div>
        <button
          onClick={onClearLogs}
          className="text-slate-500 hover:text-slate-300 text-[10px] flex items-center gap-1 transition-colors"
          aria-label="Clear communication log history"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear Feed</span>
        </button>
      </div>

      <div ref={scrollRef} className="mt-3 space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-6 text-xs">
            Awaiting voice commands or system directives...
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-lg border text-xs leading-relaxed transition-all ${
                log.type === 'user'
                  ? 'bg-slate-900/60 border-cyan-900/40 text-slate-200'
                  : log.type === 'jarvis'
                  ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span
                  className={`font-semibold uppercase ${
                    log.type === 'user'
                      ? 'text-emerald-400'
                      : log.type === 'jarvis'
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  }`}
                >
                  {log.type === 'user' ? '► USER DIRECTIVE' : log.type === 'jarvis' ? '◆ J.A.R.V.I.S.' : '▲ SYSTEM'}
                </span>
                <div className="flex items-center gap-2 text-slate-500">
                  <span>{log.timestamp}</span>
                  {log.type === 'jarvis' && (
                    <button
                      onClick={() => onReplaySpeech(log.message)}
                      className="text-cyan-400 hover:text-cyan-200"
                      title="Replay speech audio"
                      aria-label="Replay audio message"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="font-sans text-xs">{log.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
