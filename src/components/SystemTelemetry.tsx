import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Database,
  Wifi,
  BatteryCharging,
  Battery,
  Shield,
  Zap,
  Terminal,
  Activity,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import type { SystemVitals } from '../types/jarvis';

interface SystemTelemetryProps {
  vitals: SystemVitals;
  onRunDiagnostic: () => void;
  onPurgeCache: () => void;
  onTriggerProtocol: (protocol: 'lockdown' | 'focus_mode' | 'normal') => void;
}

export const SystemTelemetry: React.FC<SystemTelemetryProps> = ({
  vitals,
  onRunDiagnostic,
  onPurgeCache,
  onTriggerProtocol,
}) => {
  const [coreLoads, setCoreLoads] = useState<number[]>([24, 38, 15, 62, 29, 44, 18, 51]);
  const [cpuUsage, setCpuUsage] = useState<number>(34);
  const [isPurging, setIsPurging] = useState(false);

  // Subtle real-time oscillation to feel like a live running computer system
  useEffect(() => {
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (Boolean((navigator as any).webdriver) || /HeadlessChrome/i.test(navigator.userAgent));

    if (isHeadless) return;

    const interval = setInterval(() => {
      const newLoads = coreLoads.map((load) => {
        const delta = (Math.random() - 0.48) * 8;
        return Math.min(95, Math.max(8, Math.round(load + delta)));
      });
      setCoreLoads(newLoads);
      const avg = Math.round(newLoads.reduce((a, b) => a + b, 0) / newLoads.length);
      setCpuUsage(avg);
    }, 2500);

    return () => clearInterval(interval);
  }, [coreLoads]);

  const handlePurge = () => {
    setIsPurging(true);
    onPurgeCache();
    setTimeout(() => setIsPurging(false), 1200);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-cyan-900/40 rounded-xl p-4 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="font-hud text-base font-bold tracking-wide text-slate-100 uppercase">
            Computer Subsystems & Vitals
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>NOMINAL TELEMETRY</span>
        </div>
      </div>

      {/* Grid of Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-3">
        {/* CPU Telemetry */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU Core Load</span>
            </span>
            <span className="text-cyan-300 font-bold">{cpuUsage}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                cpuUsage > 80 ? 'bg-rose-500' : cpuUsage > 50 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${cpuUsage}%` }}
            />
          </div>

          {/* Virtual 8-Core Histogram */}
          <div className="grid grid-cols-8 gap-1 mt-2.5 items-end h-7">
            {coreLoads.map((load, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 h-full justify-end">
                <div
                  className="w-full bg-cyan-500/70 rounded-xs transition-all duration-500"
                  style={{ height: `${load}%` }}
                />
              </div>
            ))}
          </div>
          <div className="text-[9px] font-mono text-slate-500 text-center mt-1">
            8-Core OctaThread Matrix
          </div>
        </div>

        {/* Memory Allocation */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>RAM Allocation</span>
            </span>
            <span className="text-purple-300 font-bold">58%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full" style={{ width: '58%' }} />
          </div>

          <div className="mt-2.5 text-xs font-mono text-slate-300 flex items-center justify-between">
            <span>Allocated:</span>
            <span className="font-bold text-slate-100">9.3 GB / 16.0 GB</span>
          </div>

          <button
            onClick={handlePurge}
            disabled={isPurging}
            className="w-full mt-2 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-purple-900/50 text-[10px] font-mono text-purple-300 flex items-center justify-center gap-1 transition-all"
            aria-label="Flush cache and purge transient buffers"
          >
            {isPurging ? (
              <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />
            ) : (
              <Trash2 className="w-3 h-3 text-purple-400" />
            )}
            <span>{isPurging ? 'Purging RAM Buffers...' : 'Flush Memory Cache'}</span>
          </button>
        </div>

        {/* Network Telemetry */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Network I/O</span>
            </span>
            <span className="text-emerald-300 font-bold text-[11px]">ENCRYPTED</span>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Downlink:</span>
              <span className="text-cyan-400 font-bold">148.2 Mbps</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Uplink:</span>
              <span className="text-emerald-400 font-bold">42.6 Mbps</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Firewall:</span>
              <span className="text-cyan-300">Quantum Active</span>
            </div>
          </div>
        </div>

        {/* Computer Power & Security */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
              <span>Power Telemetry</span>
            </span>
            <span className="text-amber-300 font-bold">AC Connected</span>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Battery Level:</span>
              <span className="text-emerald-400 font-bold">96% [Healthy]</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Arc Core Output:</span>
              <span className="text-cyan-300 font-bold">3.2 GJ/s</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">System Mode:</span>
              <span className="text-amber-400 font-bold">{vitals.securityStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Trigger Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-xs font-mono">
        <span className="text-slate-400 text-[11px]">Computer Directives & System Protocols:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRunDiagnostic}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-800/60 text-cyan-300 text-[11px] transition-all"
            aria-label="Run full diagnostic sweep"
          >
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>Diagnostic Sweep</span>
          </button>
          <button
            onClick={() => onTriggerProtocol(vitals.securityStatus === 'FOCUS' ? 'normal' : 'focus_mode')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] transition-all ${
              vitals.securityStatus === 'FOCUS'
                ? 'bg-amber-950 text-amber-300 border-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            aria-label="Toggle deep focus protocol"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Deep Focus Mode</span>
          </button>
          <button
            onClick={() => onTriggerProtocol(vitals.securityStatus === 'LOCKDOWN' ? 'normal' : 'lockdown')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] transition-all ${
              vitals.securityStatus === 'LOCKDOWN'
                ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            aria-label="Toggle system lockdown protocol"
          >
            <Shield className="w-3 h-3 text-rose-400" />
            <span>{vitals.securityStatus === 'LOCKDOWN' ? 'Disengage Lockdown' : 'Lockdown Protocol'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
