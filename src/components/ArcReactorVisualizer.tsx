import React, { useEffect, useRef } from 'react';

interface ArcReactorProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  onToggleListen: () => void;
  statusText?: string;
  className?: string;
}

export const ArcReactorVisualizer: React.FC<ArcReactorProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  onToggleListen,
  statusText,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleOuter = 0;
    let angleInner = 0;
    let pulse = 0;

    // Detect headless test environment to save CPU
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (Boolean((navigator as any).webdriver) || /HeadlessChrome/i.test(navigator.userAgent));

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(cx, cy) - 10;

      ctx.clearRect(0, 0, width, height);

      // Determine activity intensity
      const active = isListening || isSpeaking || isProcessing;
      const speedOuter = active ? 0.03 : 0.008;
      const speedInner = active ? -0.045 : -0.012;
      angleOuter += speedOuter;
      angleInner += speedInner;
      pulse += active ? 0.08 : 0.03;

      const dynamicRadius = radius + (active ? Math.sin(pulse) * 4 : Math.sin(pulse) * 1.5);

      // 1. Core Background Glow
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, dynamicRadius);
      if (isSpeaking) {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.15)');
        grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      } else if (isListening) {
        grad.addColorStop(0, 'rgba(52, 211, 153, 0.5)');
        grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.2)');
        grad.addColorStop(1, 'rgba(5, 150, 105, 0)');
      } else if (isProcessing) {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.5)');
        grad.addColorStop(0.5, 'rgba(217, 119, 6, 0.2)');
        grad.addColorStop(1, 'rgba(180, 83, 9, 0)');
      } else {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
        grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, dynamicRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Segmented Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleOuter);
      const segments = 12;
      for (let i = 0; i < segments; i++) {
        const segAngle = (Math.PI * 2) / segments;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 4, i * segAngle, i * segAngle + segAngle * 0.7);
        ctx.strokeStyle = active
          ? (isListening ? 'rgba(52, 211, 153, 0.85)' : 'rgba(56, 189, 248, 0.85)')
          : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Small notch ticks
        ctx.beginPath();
        const tickAngle = i * segAngle + segAngle * 0.35;
        const tx1 = Math.cos(tickAngle) * (radius - 12);
        const ty1 = Math.sin(tickAngle) * (radius - 12);
        const tx2 = Math.cos(tickAngle) * (radius - 2);
        const ty2 = Math.sin(tickAngle) * (radius - 2);
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // 3. Middle Gyroscopic Coil Ring (Rotates Counter-Clockwise)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleInner);
      const coils = 8;
      for (let i = 0; i < coils; i++) {
        const coilAngle = (i * Math.PI * 2) / coils;
        const x = Math.cos(coilAngle) * (radius * 0.65);
        const y = Math.sin(coilAngle) * (radius * 0.65);

        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = active ? 'rgba(245, 158, 11, 0.85)' : 'rgba(245, 158, 11, 0.4)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Middle dashed ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 4. Central Energy Core (Pulsing Triangle / Hexagon)
      ctx.save();
      ctx.translate(cx, cy);
      const coreRadius = radius * 0.35 + (active ? Math.sin(pulse * 1.5) * 3 : 0);

      // Inner glowing ring
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.strokeStyle = active ? '#38bdf8' : 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Central Inverted Triangle
      const trianglePoints = 3;
      ctx.beginPath();
      for (let i = 0; i < trianglePoints; i++) {
        const tAngle = (i * Math.PI * 2) / trianglePoints - Math.PI / 2 + (active ? angleOuter * 0.5 : 0);
        const px = Math.cos(tAngle) * (coreRadius * 0.7);
        const py = Math.sin(tAngle) * (coreRadius * 0.7);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = isListening
        ? 'rgba(52, 211, 153, 0.3)'
        : isProcessing
        ? 'rgba(245, 158, 11, 0.3)'
        : 'rgba(56, 189, 248, 0.25)';
      ctx.fill();
      ctx.strokeStyle = isListening ? '#34d399' : isProcessing ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Central bright photon center
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      if (!isHeadless) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isSpeaking, isProcessing]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none cursor-pointer group ${className}`}
      onClick={onToggleListen}
      title={isListening ? 'Click to pause voice recognition' : 'Click to activate J.A.R.V.I.S. voice input'}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleListen();
        }
      }}
      aria-label={isListening ? 'Deactivate voice listener' : 'Activate voice listener'}
    >
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={224}
          height={224}
          className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
        />

        {/* Ambient Ring Glow */}
        <div
          className={`absolute inset-4 rounded-full pointer-events-none transition-opacity duration-500 blur-xl ${
            isListening
              ? 'bg-emerald-500/25 opacity-100'
              : isSpeaking
              ? 'bg-sky-500/30 opacity-100'
              : isProcessing
              ? 'bg-amber-500/30 opacity-100'
              : 'bg-sky-500/10 opacity-60 group-hover:opacity-90'
          }`}
        />
      </div>

      {/* Dynamic Status Display */}
      <div className="mt-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <span
            className={`w-2 h-2 rounded-full animate-ping ${
              isListening
                ? 'bg-emerald-400'
                : isSpeaking
                ? 'bg-sky-400'
                : isProcessing
                ? 'bg-amber-400'
                : 'bg-cyan-500/50'
            }`}
          />
          <span className="font-hud text-xs tracking-widest font-semibold uppercase text-cyan-400">
            {isListening
              ? 'VOICE INPUT ENGAGED'
              : isSpeaking
              ? 'AUDIO SYNTHESIS ACTIVE'
              : isProcessing
              ? 'ANALYZING DIRECTIVE...'
              : statusText || 'J.A.R.V.I.S. READY'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
          {isListening ? 'Say "Jarvis, schedule briefing at 3pm" or query protein' : 'Click core or say "Hey Jarvis" to command'}
        </p>
      </div>
    </div>
  );
};
