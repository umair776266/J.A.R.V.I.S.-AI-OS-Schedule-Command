import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, Terminal, CornerDownLeft } from 'lucide-react';

interface VoiceCommandBarProps {
  onSendCommand: (command: string) => void;
  isListening: boolean;
  onToggleListen: () => void;
  interimTranscript: string;
  isProcessing: boolean;
}

const QUICK_COMMANDS = [
  { label: '🎬 The Alpha Toon: Make Daily Video', cmd: 'Jarvis, open The Alpha Toon and make today cartoon video for YouTube, TikTok, and Instagram' },
  { label: 'Schedule Lab Sync at 3 PM', cmd: 'Jarvis, schedule lab sync today at 3:00 PM with high priority' },
  { label: 'Forge TikTok/Reels Video', cmd: 'Jarvis, create a video about my automated web platform' },
  { label: 'Analyze Protein TP53', cmd: 'Jarvis, analyze protein TP53' },
  { label: 'PubChem: Caffeine Structure', cmd: 'PubChem lookup for Caffeine' },
  { label: 'Run Diagnostic Scan', cmd: 'Run diagnostic scan on computer' },
  { label: 'Engage Deep Focus', cmd: 'Engage focus mode' },
];

export const VoiceCommandBar: React.FC<VoiceCommandBarProps> = ({
  onSendCommand,
  isListening,
  onToggleListen,
  interimTranscript,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendCommand(inputText.trim());
    setInputText('');
  };

  const handleQuickCommand = (cmd: string) => {
    onSendCommand(cmd);
  };

  return (
    <div className="w-full bg-slate-900/70 border border-cyan-900/50 rounded-xl p-3 sm:p-4 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      {/* Real-time Voice Transcript Banner if active */}
      {isListening && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LISTENING TO AUDIO STREAM:</span>
            <span className="text-slate-200 italic">
              {interimTranscript ? `"${interimTranscript}"` : 'Awaiting vocal directive... (e.g. "Schedule workout at 5pm")'}
            </span>
          </div>
          <button
            onClick={onToggleListen}
            className="text-[11px] underline hover:text-emerald-200"
            aria-label="Stop recording voice"
          >
            Stop Mic
          </button>
        </div>
      )}

      {/* Main Command Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3 text-cyan-400/80 pointer-events-none">
            <Terminal className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Give J.A.R.V.I.S. a directive (e.g., "Schedule lab review at 2pm", "Analyze EGFR", "Lockdown")...'
            disabled={isProcessing}
            className="w-full bg-slate-950/80 border border-cyan-800/50 rounded-lg pl-9 pr-10 py-2.5 text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            aria-label="Enter J.A.R.V.I.S. voice or text command"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="absolute right-3 text-xs text-slate-400 hover:text-slate-200 font-mono"
              aria-label="Clear input text"
            >
              Clear
            </button>
          )}
        </div>

        {/* Mic Activation Button */}
        <button
          type="button"
          onClick={onToggleListen}
          className={`flex items-center justify-center p-2.5 rounded-lg border transition-all ${
            isListening
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : 'bg-cyan-950/50 text-cyan-400 border-cyan-800/60 hover:bg-cyan-900/50 hover:border-cyan-500'
          }`}
          title={isListening ? 'Mute microphone' : 'Speak voice command'}
          aria-label={isListening ? 'Mute microphone' : 'Activate microphone for voice command'}
        >
          {isListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Transmit Command Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
            !inputText.trim() || isProcessing
              ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
          }`}
          aria-label="Submit directive to J.A.R.V.I.S."
        >
          <span className="hidden sm:inline">Transmit</span>
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>

      {/* Pre-loaded Quick Directive Chips */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-cyan-400/80 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick Directives:</span>
        </span>
        <div className="flex items-center gap-1.5 flex-nowrap">
          {QUICK_COMMANDS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickCommand(item.cmd)}
              className="px-2.5 py-1 rounded bg-slate-950/70 border border-cyan-900/60 hover:border-cyan-500/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-200 text-[11px] font-mono whitespace-nowrap transition-all"
              aria-label={`Quick command: ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
