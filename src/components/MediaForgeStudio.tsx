import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Sparkles,
  Copy,
  Check,
  Download,
  CalendarPlus,
  Play,
  Pause,
  ExternalLink,
  Flame,
  Layers,
  Image as ImageIcon,
  Share2,
  RefreshCw,
  Clock,
} from 'lucide-react';
import type { PlatformType, ThumbnailConfig } from '../utils/mediaEngine';
import { PLATFORM_LIMITS, validateCaptionLength, formatHashtags } from '../utils/mediaEngine';

interface MediaForgeStudioProps {
  onScheduleUpload: (directiveTitle: string, time?: string, description?: string) => void;
  onSpeak: (text: string) => void;
}

interface GeneratedMediaPackage {
  title: string;
  hook: string;
  caption: string;
  hashtags: string[];
  script: Array<{ timestamp: string; scene: string; narration: string }>;
  thumbnail: ThumbnailConfig;
  recommendedPostingTime?: string;
  platform: PlatformType;
  topic: string;
}

const INSPIRATION_CHIPS = [
  'Promote My New Website & Web App',
  'J.A.R.V.I.S. AI Voice Computer Assistant',
  'Automated Daily Schedule & Task Manager',
  'AlphaFold & Biotech Intelligence Breakthrough',
  'Top 5 Coding Workflows in 2026',
];

export const MediaForgeStudio: React.FC<MediaForgeStudioProps> = ({
  onScheduleUpload,
  onSpeak,
}) => {
  const [platform, setPlatform] = useState<PlatformType>('tiktok');
  const [topic, setTopic] = useState('My Automated Web Platform');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Active Media Package State
  const [mediaPackage, setMediaPackage] = useState<GeneratedMediaPackage>({
    title: 'How I Built and Automated My Website in 2026',
    hook: 'Stop scrolling! Here is how our automated platform replaces 10 separate tools. 🚀',
    caption:
      'We just launched the complete AI operating system for creators and builders. From voice commands to scheduling and multi-platform media pipelines—here is the exact breakdown.\n\nDrop a comment with "ALPHA" and check the link in bio to try it now!',
    hashtags: ['fyp', 'webdev', 'tech', 'coding', 'productivity', 'ai2026'],
    script: [
      { timestamp: '0:00', scene: 'Hook & Curiosity Gap', narration: 'Stop scrolling! Here is how our automated platform replaces 10 tools.' },
      { timestamp: '0:12', scene: 'Live UI Demonstration', narration: 'Watch how J.A.R.V.I.S. captures voice directives and schedules your day in seconds.' },
      { timestamp: '0:28', scene: 'The Secret Weapon', narration: 'With built-in video scripts, captions, and thumbnail forge, publishing is 1-click.' },
      { timestamp: '0:45', scene: 'Call to Action', narration: 'Link is live in bio. Try the fully functional web app today.' },
    ],
    thumbnail: {
      headline: 'FULL AI WEBSITE',
      subtext: 'AUTOMATED IN SECONDS',
      badgeText: 'MUST WATCH',
      aspectRatio: '9:16',
      theme: 'stark_cyan',
    },
    recommendedPostingTime: '16:00',
    platform: 'tiktok',
    topic: 'My Automated Web Platform',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate Media Package from Backend API
  const handleGenerate = async (overrideTopic?: string, overridePlatform?: PlatformType) => {
    const qTopic = overrideTopic || topic;
    const qPlatform = overridePlatform || platform;
    setIsLoading(true);

    try {
      const res = await fetch('/api/media/generate-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: qTopic, platform: qPlatform }),
      });

      if (!res.ok) throw new Error('Failed to generate media package');
      const data: GeneratedMediaPackage = await res.json();
      setMediaPackage(data);
      onSpeak(`Viral media package generated for ${qPlatform.toUpperCase()}. High-CTR thumbnail and captions are ready, sir.`);
    } catch (err) {
      console.error('Error generating media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render high-impact thumbnail to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 480;
    const height = mediaPackage.thumbnail.aspectRatio === '16:9' ? 270 : mediaPackage.thumbnail.aspectRatio === '9:16' ? 853 : 480;

    canvas.width = width;
    canvas.height = height;

    // Background Gradient based on theme
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (mediaPackage.thumbnail.theme === 'neon_gold') {
      bgGrad.addColorStop(0, '#1c1917');
      bgGrad.addColorStop(0.5, '#292524');
      bgGrad.addColorStop(1, '#0c0a09');
    } else if (mediaPackage.thumbnail.theme === 'cyber_purple') {
      bgGrad.addColorStop(0, '#0f0728');
      bgGrad.addColorStop(0.6, '#1e103a');
      bgGrad.addColorStop(1, '#080318');
    } else if (mediaPackage.thumbnail.theme === 'crimson_alert') {
      bgGrad.addColorStop(0, '#2b0a0d');
      bgGrad.addColorStop(0.6, '#180406');
      bgGrad.addColorStop(1, '#0a0203');
    } else {
      // Stark Cyan
      bgGrad.addColorStop(0, '#031726');
      bgGrad.addColorStop(0.5, '#042238');
      bgGrad.addColorStop(1, '#020b12');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Futuristic HUD Grid Lines & Glowing Circular Accent
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Glowing Arc Core behind headline
    const cx = width / 2;
    const cy = height * 0.45;
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.4);
    glow.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, width * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Badge Sticker
    ctx.save();
    const badgeX = 30;
    const badgeY = height * 0.15;
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = 'rgba(220, 38, 38, 0.6)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, 140, 32, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Chakra Petch", sans-serif';
    ctx.fillText(`★ ${mediaPackage.thumbnail.badgeText || 'MUST WATCH'}`, badgeX + 16, badgeY + 21);
    ctx.restore();

    // Headline Text
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Chakra Petch", sans-serif';
    ctx.shadowColor = 'rgba(6, 182, 212, 0.9)';
    ctx.shadowBlur = 18;
    const textY = height * 0.48;

    // Word wrap headline
    const words = mediaPackage.thumbnail.headline.split(' ');
    let line = '';
    let curY = textY;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 60 && n > 0) {
        ctx.fillText(line.toUpperCase(), 30, curY);
        line = words[n] + ' ';
        curY += 38;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.toUpperCase(), 30, curY);

    // Subtitle Text
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText(mediaPackage.thumbnail.subtext.toUpperCase(), 30, curY + 36);

    // Footer Watermark
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(`PRODUCED BY J.A.R.V.I.S. • ${platform.toUpperCase()}`, 30, height - 20);
    ctx.restore();
  }, [mediaPackage, platform]);

  // Download rendered thumbnail
  const handleDownloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${mediaPackage.platform}_thumbnail_${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  // Copy Caption to Clipboard
  const handleCopyCaption = () => {
    const fullText = `${mediaPackage.hook}\n\n${mediaPackage.caption}\n\n${formatHashtags(mediaPackage.hashtags)}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Audio preview of script narration
  const handlePlayNarration = () => {
    if (isPlayingNarration) {
      window.speechSynthesis?.cancel();
      setIsPlayingNarration(false);
      return;
    }
    const fullSpeech = mediaPackage.script.map((s) => s.narration).join('. ');
    setIsPlayingNarration(true);
    onSpeak(fullSpeech);
    setTimeout(() => setIsPlayingNarration(false), 12000);
  };

  // Queue to J.A.R.V.I.S. Schedule
  const handleQueueSchedule = () => {
    const time = mediaPackage.recommendedPostingTime || '16:00';
    onScheduleUpload(
      `Publish ${platform.toUpperCase()} Video: ${mediaPackage.title.slice(0, 30)}...`,
      time,
      `Upload prepared video with rendered thumbnail and hashtags for ${platform}.`
    );
  };

  const limits = PLATFORM_LIMITS[platform];
  const charValidation = validateCaptionLength(mediaPackage.caption, platform);

  const getPlatformStudioUrl = () => {
    switch (platform) {
      case 'youtube':
        return 'https://studio.youtube.com/';
      case 'tiktok':
        return 'https://www.tiktok.com/creator-center/upload';
      case 'instagram':
        return 'https://www.instagram.com/';
      case 'twitter':
        return 'https://twitter.com/compose/tweet';
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border border-cyan-900/40 rounded-xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-cyan-950">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud text-lg sm:text-xl font-bold tracking-wide text-slate-100 uppercase">
              Multi-Platform Video & Media Forge
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Automated video scripts, high-CTR thumbnails, viral captions & scheduled platform dispatch
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs font-mono">
          {(['tiktok', 'youtube', 'instagram', 'twitter'] as PlatformType[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPlatform(p);
                handleGenerate(topic, p);
              }}
              className={`px-3 py-1 rounded-md capitalize transition-all ${
                platform === p
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label={`Select ${p} platform`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Prompt Generator Bar */}
      <div className="my-3.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter video topic, website feature, or campaign concept..."
            className="flex-1 bg-slate-950 border border-cyan-900/50 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            aria-label="Video campaign topic input"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
            aria-label="Forge media package"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Forge Content</span>
          </button>
        </div>

        {/* Quick Inspiration Chips */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-cyan-400" />
            <span>Topics:</span>
          </span>
          <div className="flex items-center gap-1 flex-nowrap">
            {INSPIRATION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setTopic(chip);
                  handleGenerate(chip, platform);
                }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-900/60 hover:border-cyan-500/80 text-[11px] font-mono text-slate-300 hover:text-cyan-200 whitespace-nowrap transition-all"
                aria-label={`Select topic ${chip}`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Thumbnail Canvas + Captions & Video Script */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Thumbnail Studio & Canvas (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>High-CTR Thumbnail Studio</span>
              </span>
              <span className="text-slate-400">{mediaPackage.thumbnail.aspectRatio}</span>
            </div>

            {/* Thumbnail Canvas Viewport */}
            <div className="my-3 flex items-center justify-center bg-slate-950 rounded-lg p-2 border border-slate-800/80 overflow-hidden max-h-72">
              <canvas
                ref={canvasRef}
                className="max-h-64 object-contain rounded shadow-lg border border-cyan-900/30"
              />
            </div>

            {/* Thumbnail Controls */}
            <div className="space-y-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Headline</label>
                  <input
                    type="text"
                    value={mediaPackage.thumbnail.headline}
                    onChange={(e) =>
                      setMediaPackage((prev) => ({
                        ...prev,
                        thumbnail: { ...prev.thumbnail, headline: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                    aria-label="Thumbnail headline input"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Badge</label>
                  <input
                    type="text"
                    value={mediaPackage.thumbnail.badgeText}
                    onChange={(e) =>
                      setMediaPackage((prev) => ({
                        ...prev,
                        thumbnail: { ...prev.thumbnail, badgeText: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                    aria-label="Thumbnail badge text input"
                  />
                </div>
              </div>

              <button
                onClick={handleDownloadThumbnail}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 font-mono text-xs font-semibold transition-all shadow-sm"
                aria-label="Download rendered thumbnail PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Thumbnail (.PNG)</span>
              </button>
            </div>
          </div>

          {/* Action Bridge: Schedule upload in J.A.R.V.I.S. */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-cyan-950 flex items-center justify-between">
            <div className="text-xs font-mono">
              <div className="text-slate-300 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recommended: {mediaPackage.recommendedPostingTime || '16:00'}</span>
              </div>
              <p className="text-[10px] text-slate-500">Optimal posting window for {platform}</p>
            </div>
            <button
              onClick={handleQueueSchedule}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              aria-label="Queue upload in J.A.R.V.I.S. schedule"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Queue in Schedule</span>
            </button>
          </div>
        </div>

        {/* Right: Video Script Reel & Platform Captions (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Viral Caption Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="text-slate-300 font-semibold uppercase flex items-center gap-1.5">
                <span>{platform} Caption & Viral Hook</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">
                  {charValidation.length} / {limits.maxCharacters} chars
                </span>
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-[11px] transition-all"
                  aria-label="Copy caption to clipboard"
                >
                  {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCaption ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Hook Highlight */}
            <div className="my-2.5 p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-900/50">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block mb-0.5">
                First 3-Second Viral Hook:
              </span>
              <p className="text-xs font-medium text-slate-200 italic">{mediaPackage.hook}</p>
            </div>

            {/* Caption Body */}
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans mb-3">
              {mediaPackage.caption}
            </p>

            {/* Hashtag Chips */}
            <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-slate-800/80">
              {mediaPackage.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-950 text-[11px] font-mono text-cyan-300 border border-slate-800"
                >
                  #{tag.replace(/^#/, '')}
                </span>
              ))}
            </div>
          </div>

          {/* Video Script & Reel Timeline */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Video Reel Script ({mediaPackage.script.length} Scenes)</span>
              </span>

              <button
                onClick={handlePlayNarration}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700"
                aria-label="Play script narration voiceover"
              >
                {isPlayingNarration ? (
                  <Pause className="w-3 h-3 text-cyan-400 animate-pulse" />
                ) : (
                  <Play className="w-3 h-3 text-cyan-400" />
                )}
                <span>{isPlayingNarration ? 'Stop Audio' : 'Preview Voiceover'}</span>
              </button>
            </div>

            {/* Script Scene Breakdown */}
            <div className="mt-2.5 space-y-2 max-h-48 overflow-y-auto pr-1">
              {mediaPackage.script.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs flex items-start gap-2.5"
                >
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold">
                    {scene.timestamp}
                  </span>
                  <div className="flex-1">
                    <div className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                      {scene.scene}
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5">{scene.narration}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Open Platform Dispatch Button */}
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Ready to publish? Open creator dashboard:
              </span>
              <a
                href={getPlatformStudioUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                aria-label={`Open ${platform} Studio upload page`}
              >
                <span>Launch {platform} Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
