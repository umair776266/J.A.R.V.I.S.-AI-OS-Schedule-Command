import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Sparkles,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  CalendarPlus,
  RefreshCw,
  ExternalLink,
  Flame,
  Volume2,
  Tv,
  Radio,
  Clock,
  Send,
  Zap,
  Video,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { CartoonEpisode, CartoonScene } from '../utils/alphaToonEngine';
import { generateDailyCartoonEpisode, formatChannelScheduleDirective } from '../utils/alphaToonEngine';

interface AlphaToonAutomationProps {
  onScheduleDirective: (title: string, time?: string, description?: string) => void;
  onSpeak: (text: string) => void;
}

export const AlphaToonAutomation: React.FC<AlphaToonAutomationProps> = ({
  onScheduleDirective,
  onSpeak,
}) => {
  const [episodeNum, setEpisodeNum] = useState<number>(14);
  const [autoPilotEnabled, setAutoPilotEnabled] = useState<boolean>(true);
  const [activePlatformTab, setActivePlatformTab] = useState<'youtube' | 'tiktok' | 'insta'>('youtube');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(true);

  // Storyboard player state
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlayingScenes, setIsPlayingScenes] = useState<boolean>(false);

  // Active Cartoon Episode Package
  const [episode, setEpisode] = useState<CartoonEpisode>(() =>
    generateDailyCartoonEpisode(14)
  );

  const thumbnailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch or Generate New Episode
  const handleGenerateEpisode = async (numOverride?: number, topicOverride?: string) => {
    const targetNum = numOverride ?? episodeNum;
    const targetTopic = topicOverride ?? customTopic;
    setIsLoading(true);

    try {
      const res = await fetch('/api/alpha-toon/generate-daily-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeNumber: targetNum, customTopic: targetTopic }),
      });

      if (!res.ok) throw new Error('Failed to generate cartoon episode');
      const data: CartoonEpisode = await res.json();
      setEpisode(data);
      setCurrentSceneIdx(0);
      onSpeak(
        `The Alpha Toon Episode ${data.episodeNumber} is ready, sir. Storyboard scenes, comic thumbnail, and captions generated.`
      );
    } catch (err) {
      console.error('Cartoon generation fallback:', err);
      const local = generateDailyCartoonEpisode(targetNum, targetTopic);
      setEpisode(local);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Cartoon Thumbnail to Canvas with Story Character & Comic Visuals
  useEffect(() => {
    const canvas = thumbnailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 640;
    const height = 360; // 16:9 comic thumbnail
    canvas.width = width;
    canvas.height = height;

    // 1. Vibrant Comic Sunburst Background
    ctx.fillStyle = '#f59e0b'; // Amber yellow
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    const rays = 18;
    ctx.fillStyle = '#ea580c'; // Warm orange-red comic rays
    for (let i = 0; i < rays; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const a1 = (i * 2 * Math.PI) / rays;
      const a2 = ((i * 2 + 1) * Math.PI) / rays;
      ctx.arc(0, 0, width, a1, a2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 2. Comic Halftone Dots overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 0; x < width; x += 16) {
      for (let y = 0; y < height; y += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Comic Action Lightning Bolts
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(30, 80);
    ctx.lineTo(60, 110);
    ctx.lineTo(45, 125);
    ctx.lineTo(85, 160);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - 40, 90);
    ctx.lineTo(width - 70, 120);
    ctx.lineTo(width - 55, 135);
    ctx.lineTo(width - 95, 170);
    ctx.stroke();

    // 4. Draw The Star Character "ALPHA" on left side
    const charX = 135;
    const charY = 230;

    // Alpha character shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(charX, 335, 60, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Hero suit)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(charX, charY + 30, 36, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Hero emblem 'α' on chest
    ctx.fillStyle = '#fde047';
    ctx.font = '900 20px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('α', charX, charY + 38);

    // Alpha Head
    ctx.fillStyle = '#fde047'; // Animated bright face
    ctx.beginPath();
    ctx.arc(charX, charY - 35, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Hero Goggles / Eyes (Shocked / Excited Expression)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(charX - 12, charY - 38, 10, 0, Math.PI * 2);
    ctx.arc(charX + 12, charY - 38, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pupils looking at the title
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(charX - 8, charY - 38, 4, 0, Math.PI * 2);
    ctx.arc(charX + 16, charY - 38, 4, 0, Math.PI * 2);
    ctx.fill();

    // Wide Funny Open Mouth
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(charX, charY - 20, 12, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Character Name Tag
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(charX - 45, 310, 90, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 12px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ ALPHA', charX, 326);

    // 5. Giant Comic Headline Bubble on Right
    const bubbleX = 385;
    const bubbleY = 195;

    // Burst shape behind headline
    ctx.save();
    ctx.translate(bubbleX, bubbleY);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    const burstPoints = 14;
    for (let p = 0; p < burstPoints; p++) {
      const angle = (p * Math.PI * 2) / burstPoints;
      const rad = p % 2 === 0 ? 155 : 120;
      const px = Math.cos(angle) * rad;
      const py = Math.sin(angle) * (rad * 0.65);
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Story Headline Text
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    const mainHead = episode.thumbnail.headline || episode.title.toUpperCase();
    ctx.fillText(mainHead.length > 20 ? mainHead.slice(0, 18) + '...' : mainHead, 0, -8);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText(episode.thumbnail.subheadline || 'VIRAL CARTOON STORY', 0, 22);

    ctx.restore();

    // 6. Channel Header Ribbon (Top Left)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(20, 18, 230, 36, 8);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 16px "Chakra Petch", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ THE ALPHA TOON', 34, 42);

    // 7. Episode Badge Sticker (Top Right)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(width - 165, 18, 145, 36, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(episode.thumbnail.episodeBadge || `EPISODE #${episode.episodeNumber}`, width - 92, 42);

    // 8. Story Action Sound Badge (Bottom Right)
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.roundRect(width - 240, height - 42, 220, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`💥 ${episode.scenes[0]?.soundEffect || 'ZAP!'} • DAILY 1 VID/DAY`, width - 130, height - 24);
  }, [episode]);

  // Render Scene Animation Frame
  useEffect(() => {
    const canvas = animationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 560;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    const currentScene = episode.scenes[currentSceneIdx] || episode.scenes[0];

    // Background Room / Scene
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.7, '#1e293b');
    bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Floor line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.78);
    ctx.lineTo(width, height * 0.78);
    ctx.stroke();

    // Cartoon Character: Alpha (Animated Stylized Character)
    const charX = width * 0.25;
    const charY = height * 0.62;

    // Body
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(charX, charY, 26, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fde047'; // Cartoon face
    ctx.beginPath();
    ctx.arc(charX, charY - 45, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hero Goggles / Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(charX - 8, charY - 47, 5, 0, Math.PI * 2);
    ctx.arc(charX + 8, charY - 47, 5, 0, Math.PI * 2);
    ctx.fill();

    // Wide Comic Smile
    ctx.beginPath();
    ctx.arc(charX, charY - 38, 10, 0, Math.PI);
    ctx.stroke();

    // Sound effect explosion badge
    ctx.save();
    ctx.fillStyle = '#f43f5e';
    ctx.font = '900 16px "Chakra Petch", sans-serif';
    ctx.fillText(`⚡ ${currentScene.soundEffect || 'ZAP!'}`, width * 0.55, height * 0.25);
    ctx.restore();

    // Comic Dialogue Speech Bubble
    const bubbleX = width * 0.42;
    const bubbleY = height * 0.38;
    const bubbleW = width * 0.54;
    const bubbleH = 88;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 12);
    ctx.fill();
    ctx.stroke();

    // Bubble pointer triangle towards character
    ctx.beginPath();
    ctx.moveTo(bubbleX, bubbleY + 30);
    ctx.lineTo(bubbleX - 16, bubbleY + 40);
    ctx.lineTo(bubbleX, bubbleY + 50);
    ctx.fill();
    ctx.stroke();

    // Dialogue text inside bubble
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`${currentScene.character}:`, bubbleX + 14, bubbleY + 22);

    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    const words = currentScene.dialogue.split(' ');
    let line = '';
    let textY = bubbleY + 42;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > bubbleW - 28 && n > 0) {
        ctx.fillText(line, bubbleX + 14, textY);
        line = words[n] + ' ';
        textY += 18;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, bubbleX + 14, textY);
  }, [episode, currentSceneIdx]);

  // Play dialogue audio for current scene
  const handlePlaySceneAudio = () => {
    const scene = episode.scenes[currentSceneIdx];
    if (!scene) return;
    onSpeak(`${scene.character} says: ${scene.dialogue}`);
  };

  // Automated Sequential Playback
  useEffect(() => {
    if (!isPlayingScenes) return;

    const timer = setTimeout(() => {
      if (currentSceneIdx < episode.scenes.length - 1) {
        const next = currentSceneIdx + 1;
        setCurrentSceneIdx(next);
        onSpeak(episode.scenes[next].dialogue);
      } else {
        setIsPlayingScenes(false);
      }
    }, (episode.scenes[currentSceneIdx]?.durationSec || 5) * 1000);

    return () => clearTimeout(timer);
  }, [isPlayingScenes, currentSceneIdx, episode]);

  // Download Comic Thumbnail
  const handleDownloadThumbnail = () => {
    const canvas = thumbnailCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `TheAlphaToon_Ep${episode.episodeNumber}_thumbnail.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Copy Platform Text
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Record entire animated cartoon video across all scenes to .webm file
  const handleRecordAndDownloadVideo = async () => {
    const canvas = animationCanvasRef.current;
    if (!canvas) return;

    if (!window.MediaRecorder) {
      onSpeak("MediaRecorder is not supported in this browser environment, sir.");
      return;
    }

    setIsRecordingVideo(true);
    onSpeak(`Recording The Alpha Toon Episode ${episode.episodeNumber} video clip...`);

    try {
      const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
      if (!stream) {
        throw new Error('Canvas captureStream not supported');
      }

      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        options = { mimeType: 'video/webm;codecs=vp9' };
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options = { mimeType: 'video/webm' };
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TheAlphaToon_Ep${episode.episodeNumber}_CartoonVideo.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecordingVideo(false);
        onSpeak(`Video exported successfully for Episode ${episode.episodeNumber}, sir.`);
      };

      recorder.start();

      // Sequentially step through each scene
      for (let i = 0; i < episode.scenes.length; i++) {
        setCurrentSceneIdx(i);
        const duration = Math.max(2, episode.scenes[i].durationSec || 3);
        await new Promise((resolve) => setTimeout(resolve, duration * 1000));
      }

      recorder.stop();
    } catch (err) {
      console.error('Video recording failed:', err);
      setIsRecordingVideo(false);
      onSpeak("Video recording encountered an issue, sir. You can download the comic thumbnail and scenes directly.");
    }
  };

  // Schedule upload into J.A.R.V.I.S.
  const handleDispatchSchedule = () => {
    const directive = formatChannelScheduleDirective(episode);
    onScheduleDirective(directive.directiveTitle, directive.time, directive.description);
    onSpeak(
      `Directive scheduled, sir. The Alpha Toon Episode ${episode.episodeNumber} queued for upload at ${directive.time}.`
    );
  };

  return (
    <div className="w-full bg-slate-950/90 border border-amber-500/40 rounded-xl p-4 sm:p-5 shadow-[0_0_35px_rgba(245,158,11,0.15)]">
      {/* Top Channel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-950/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black font-hud text-lg shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              α
            </div>
            <div>
              <h2 className="font-hud text-lg sm:text-xl font-black tracking-wider text-amber-400 uppercase flex items-center gap-2">
                <span>The Alpha Toon</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/80 font-mono font-normal">
                  AUTOMATION PIPELINE
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Daily Automated 2D Cartoon Videos • Comic Thumbnails • Multi-Platform Publishing (YouTube, TikTok, Insta)
          </p>
        </div>

        {/* Auto-Pilot Toggle & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPilotEnabled(!autoPilotEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
              autoPilotEnabled
                ? 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            aria-label="Toggle daily automated cartoon production"
          >
            <Radio className={`w-3.5 h-3.5 ${autoPilotEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{autoPilotEnabled ? 'Auto-Pilot ACTIVE (1 Vid/Day)' : 'Auto-Pilot Paused'}</span>
          </button>

          <button
            onClick={() => {
              const nextNum = episodeNum + 1;
              setEpisodeNum(nextNum);
              handleGenerateEpisode(nextNum);
            }}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50"
            aria-label="Generate next cartoon episode"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Next Ep #{episodeNum + 1}</span>
          </button>
        </div>
      </div>

      {/* Episode Header Bar */}
      <div className="my-3.5 p-3 rounded-lg bg-slate-900/60 border border-amber-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-hud font-bold text-xs uppercase shadow-sm">
            EPISODE #{episode.episodeNumber}
          </span>
          <h3 className="text-sm sm:text-base font-bold font-hud text-slate-100">
            {episode.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Daily Upload Target:</span>
          <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>5:00 PM (17:00)</span>
          </span>
        </div>
      </div>

      {/* Operations Manual Guide: How Scheduling, AI Thumbnails & Video Creation Work */}
      <div className="mb-4 rounded-xl border border-amber-500/30 bg-slate-900/90 overflow-hidden shadow-lg">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 hover:from-amber-950/80 transition-colors text-left"
          aria-label="Toggle operations manual guide"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-hud font-bold text-amber-300 text-xs sm:text-sm tracking-wide uppercase">
              How J.A.R.V.I.S. Operates The Alpha Toon Channel (Schedule • AI Thumbnails • Video Engine)
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-amber-400">
            <span>{showGuide ? 'Collapse Guide' : 'Expand Guide'}</span>
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showGuide && (
          <div className="p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-mono border-t border-amber-950/80 bg-slate-950/70">
            {/* 1. Schedule Setup */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold font-hud uppercase">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Setting The Schedule</span>
              </div>
              <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                <li><strong>Auto-Pilot (1 Vid/Day)</strong>: Target set to 5:00 PM daily.</li>
                <li><strong>1-Click Dispatch</strong>: Click the golden <em>"Schedule Upload"</em> button below to queue into J.A.R.V.I.S. Mission Schedule.</li>
                <li><strong>Voice Directives</strong>: Speak <em>"Jarvis, schedule today's Alpha Toon upload for 5 PM"</em> to activate hands-free!</li>
              </ul>
            </div>

            {/* 2. AI Thumbnail */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-hud uppercase">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. AI Story Thumbnails</span>
              </div>
              <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                <li><strong>Story Visuals</strong>: Draws star hero <strong>Alpha</strong> in an expressive shock pose reacting directly to today's plot.</li>
                <li><strong>Comic Cover Art</strong>: Sunburst rays, halftone dots, explosive headline, and sound effect stickers.</li>
                <li><strong>Export Ready</strong>: Click <em>"Download (.PNG)"</em> for high-CTR 16:9 covers for YouTube, TikTok & Reels.</li>
              </ul>
            </div>

            {/* 3. Cartoon Video Creation */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-emerald-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-hud uppercase">
                <Film className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Cartoon Video Pipeline</span>
              </div>
              <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                <li><strong>Scripting</strong>: Generates multi-scene cartoon plot starring Alpha with comic dialogue and sound effects.</li>
                <li><strong>Animation Reel</strong>: Real-time 2D canvas character animation with speech bubbles and vocal dialogue.</li>
                <li><strong>Export Video (.webm)</strong>: Click the <em>"Export Video (.webm)"</em> button to render and download the animated cartoon video!</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Main Studio Grid: Cartoon Storyboard Player + Comic Thumbnail Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Cartoon Storyboard Player (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" />
                <span>Animated Storyboard Reel (Scene {currentSceneIdx + 1}/{episode.scenes.length})</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlayingScenes(!isPlayingScenes)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[11px]"
                  aria-label="Play animated scene reel"
                >
                  {isPlayingScenes ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlayingScenes ? 'Pause Reel' : 'Play Reel'}</span>
                </button>
                <button
                  onClick={handlePlaySceneAudio}
                  className="p-1 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700"
                  title="Speak scene dialogue aloud"
                  aria-label="Play dialogue audio"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRecordAndDownloadVideo}
                  disabled={isRecordingVideo}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[11px] font-semibold transition-all disabled:opacity-50"
                  title="Render and download full animated cartoon video"
                  aria-label="Export cartoon video"
                >
                  {isRecordingVideo ? <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" /> : <Video className="w-3 h-3" />}
                  <span>{isRecordingVideo ? 'Recording...' : 'Export Video (.webm)'}</span>
                </button>
              </div>
            </div>

            {/* Animation Scene Viewport */}
            <div className="my-3 flex items-center justify-center bg-slate-950 rounded-lg p-2 border border-slate-800 overflow-hidden">
              <canvas
                ref={animationCanvasRef}
                className="w-full max-h-64 object-contain rounded shadow-lg border border-cyan-900/40"
              />
            </div>

            {/* Scene Selectors Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
              {episode.scenes.map((scene, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSceneIdx(idx);
                    onSpeak(`${scene.character}: ${scene.dialogue}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-left flex-1 min-w-[120px] transition-all ${
                    currentSceneIdx === idx
                      ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                  aria-label={`Select Scene ${idx + 1}`}
                >
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    Scene {scene.sceneNum} ({scene.durationSec}s)
                  </div>
                  <div className="text-xs truncate font-sans text-slate-200 mt-0.5">{scene.setting}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Directive Bridge Button */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-900/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <CalendarPlus className="w-4 h-4 text-amber-400" />
                <span>Automated Daily Dispatch Schedule</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Queues upload for today at 5:00 PM with voice confirmation
              </p>
            </div>

            <button
              onClick={handleDispatchSchedule}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              aria-label="Queue today's episode in daily schedule"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Schedule Upload</span>
            </button>
          </div>
        </div>

        {/* Right: Comic Thumbnail Studio & Multi-Platform Captions (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          {/* Cartoon Comic Thumbnail Studio */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5" />
                <span>Comic Thumbnail Studio (16:9 / High-CTR)</span>
              </span>

              <button
                onClick={handleDownloadThumbnail}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[11px] font-mono"
                aria-label="Download comic thumbnail PNG"
              >
                <Download className="w-3 h-3" />
                <span>Download (.PNG)</span>
              </button>
            </div>

            {/* Thumbnail Canvas */}
            <div className="my-2.5 flex items-center justify-center bg-slate-950 rounded-lg p-2 border border-slate-800 overflow-hidden">
              <canvas
                ref={thumbnailCanvasRef}
                className="w-full max-h-52 object-contain rounded shadow-lg border border-amber-500/30"
              />
            </div>
          </div>

          {/* Multi-Platform Upload Distributor (YouTube, TikTok, Instagram) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                Multi-Platform Ready Captions & Metadata
              </span>

              {/* Platform Switcher */}
              <div className="flex rounded-md bg-slate-950 p-0.5 border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setActivePlatformTab('youtube')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-all ${
                    activePlatformTab === 'youtube'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-label="YouTube metadata tab"
                >
                  YouTube
                </button>
                <button
                  onClick={() => setActivePlatformTab('tiktok')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-all ${
                    activePlatformTab === 'tiktok'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-label="TikTok metadata tab"
                >
                  TikTok
                </button>
                <button
                  onClick={() => setActivePlatformTab('insta')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-all ${
                    activePlatformTab === 'insta'
                      ? 'bg-purple-950 text-purple-300 border border-purple-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-label="Instagram metadata tab"
                >
                  Instagram
                </button>
              </div>
            </div>

            {/* Platform Content Card */}
            <div className="mt-3">
              {activePlatformTab === 'youtube' && (
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Video Title</span>
                      <span className="text-slate-100 font-semibold">{episode.youtubePackage.title}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(episode.youtubePackage.title, 'yt-title')}
                      className="text-cyan-400 hover:text-cyan-200 p-1"
                      aria-label="Copy YouTube title"
                    >
                      {copiedText === 'yt-title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 uppercase">SEO Description & Tags</span>
                      <button
                        onClick={() => handleCopy(episode.youtubePackage.description, 'yt-desc')}
                        className="text-cyan-400 hover:text-cyan-200 text-[10px] flex items-center gap-1"
                        aria-label="Copy YouTube description"
                      >
                        {copiedText === 'yt-desc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Description</span>
                      </button>
                    </div>
                    <p className="text-slate-300 font-sans text-xs whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
                      {episode.youtubePackage.description}
                    </p>
                  </div>
                </div>
              )}

              {activePlatformTab === 'tiktok' && (
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-2 rounded bg-cyan-950/30 border border-cyan-900/60">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-0.5">3-Second Hook</span>
                    <span className="text-slate-100 font-medium italic">{episode.tiktokPackage.hook}</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 uppercase">TikTok Caption & Hashtags</span>
                      <button
                        onClick={() => handleCopy(episode.tiktokPackage.caption, 'tt-caption')}
                        className="text-cyan-400 hover:text-cyan-200 text-[10px] flex items-center gap-1"
                        aria-label="Copy TikTok caption"
                      >
                        {copiedText === 'tt-caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Caption</span>
                      </button>
                    </div>
                    <p className="text-slate-300 font-sans text-xs whitespace-pre-line leading-relaxed">
                      {episode.tiktokPackage.caption}
                    </p>
                  </div>
                </div>
              )}

              {activePlatformTab === 'insta' && (
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 uppercase">Instagram Reel Caption</span>
                      <button
                        onClick={() => handleCopy(episode.instaPackage.caption, 'ig-caption')}
                        className="text-purple-400 hover:text-purple-200 text-[10px] flex items-center gap-1"
                        aria-label="Copy Instagram caption"
                      >
                        {copiedText === 'ig-caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Caption</span>
                      </button>
                    </div>
                    <p className="text-slate-300 font-sans text-xs whitespace-pre-line leading-relaxed">
                      {episode.instaPackage.caption}
                    </p>
                  </div>
                </div>
              )}

              {/* Creator Studio Launchers */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Direct Upload Portals:</span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://studio.youtube.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-400 hover:underline flex items-center gap-0.5"
                    aria-label="Launch YouTube Studio"
                  >
                    <span>YT Studio</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href="https://www.tiktok.com/creator-center/upload"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-0.5"
                    aria-label="Launch TikTok Creator Center"
                  >
                    <span>TikTok</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline flex items-center gap-0.5"
                    aria-label="Launch Instagram"
                  >
                    <span>Insta</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
