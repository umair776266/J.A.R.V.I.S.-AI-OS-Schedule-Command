import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Shield, Cpu, Activity, Sparkles } from 'lucide-react';

interface HeaderHUDProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isContinuousListening: boolean;
  onToggleContinuous: () => void;
  securityStatus: string;
  activeProtocol: string | null;
  onTriggerProtocol: (protocol: 'lockdown' | 'focus_mode' | 'normal') => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  isMuted,
  onToggleMute,
  isContinuousListening,
  onToggleContinuous,
  securityStatus,
  activeProtocol,
  onTriggerProtocol,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/40 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: J.A.R.V.I.S. Branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-hud text-lg sm:text-xl font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-teal-300 bg-clip-text text-transparent font-extrabold tracking-widest drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]">
                  ALPHA
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-normal">
                  OS v8.5
                </span>
              </h1>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              STARK INDUSTRIES • BIOTECH LAB & COMPUTER DIRECTIVE ENGINE
            </p>
          </div>
        </div>

        {/* Center: Live Real-time Clock & System Status */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-cyan-950/80 rounded-lg px-3 py-1.5">
          <div className="text-center sm:text-left">
            <div className="font-mono text-sm sm:text-base font-semibold text-cyan-300 tracking-wider">
              {timeStr || '00:00:00'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              {dateStr || 'LOCATING TIME...'}
            </div>
          </div>

          <div className="h-6 w-px bg-cyan-900/40 hidden sm:block" />

          {/* Security Status Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                securityStatus === 'LOCKDOWN'
                  ? 'bg-rose-500 animate-ping'
                  : securityStatus === 'FOCUS'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-medium">
              {activeProtocol ? activeProtocol : securityStatus}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Continuous Voice Toggle */}
          <button
            onClick={onToggleContinuous}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-all border ${
              isContinuousListening
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
            title={isContinuousListening ? 'Continuous listening active' : 'Turn on continuous voice command listener'}
            aria-label="Toggle continuous voice listening"
          >
            {isContinuousListening ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden md:inline">{isContinuousListening ? 'Always Listening' : 'Push-to-Talk'}</span>
          </button>

          {/* Audio Speech Mute / Unmute */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-md transition-all border ${
              isMuted
                ? 'bg-slate-900 text-rose-400 border-rose-900/50 hover:bg-rose-950/30'
                : 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40 hover:bg-cyan-900/40'
            }`}
            title={isMuted ? 'Voice feedback is muted' : 'Voice feedback is enabled'}
            aria-label={isMuted ? 'Unmute voice feedback' : 'Mute voice feedback'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quick Protocol Lockdown Button */}
          <button
            onClick={() => onTriggerProtocol(securityStatus === 'LOCKDOWN' ? 'normal' : 'lockdown')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all ${
              securityStatus === 'LOCKDOWN'
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-rose-800/60 hover:text-rose-400'
            }`}
            title="Toggle security lockdown"
            aria-label="Toggle security lockdown protocol"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {securityStatus === 'LOCKDOWN' ? 'Lift Lockdown' : 'Lockdown'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
