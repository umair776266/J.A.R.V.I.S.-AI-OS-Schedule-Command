export type PlatformType = 'youtube' | 'tiktok' | 'instagram' | 'twitter';

export interface ThumbnailConfig {
  headline: string;
  subtext: string;
  badgeText: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  theme: 'stark_cyan' | 'neon_gold' | 'cyber_purple' | 'crimson_alert';
}

export interface PlatformLimitInfo {
  maxCharacters: number;
  maxHashtags: number;
  recommendedAspect: '16:9' | '9:16' | '1:1';
  bestPostingHours: string[];
}

export const PLATFORM_LIMITS: Record<PlatformType, PlatformLimitInfo> = {
  youtube: {
    maxCharacters: 5000,
    maxHashtags: 15,
    recommendedAspect: '16:9',
    bestPostingHours: ['14:00', '16:00', '19:00'],
  },
  tiktok: {
    maxCharacters: 2200,
    maxHashtags: 8,
    recommendedAspect: '9:16',
    bestPostingHours: ['12:00', '15:00', '20:00'],
  },
  instagram: {
    maxCharacters: 2200,
    maxHashtags: 30,
    recommendedAspect: '9:16',
    bestPostingHours: ['11:00', '14:00', '18:00'],
  },
  twitter: {
    maxCharacters: 280,
    maxHashtags: 4,
    recommendedAspect: '16:9',
    bestPostingHours: ['09:00', '13:00', '17:00'],
  },
};

export function formatHashtags(tags: string[]): string {
  return tags
    .map((tag) => {
      const clean = tag.replace(/^[#\s]+/, '').trim();
      return clean ? `#${clean}` : '';
    })
    .filter(Boolean)
    .join(' ');
}

export function validateCaptionLength(caption: string, platform: PlatformType): {
  isValid: boolean;
  length: number;
  remaining: number;
} {
  const limit = PLATFORM_LIMITS[platform].maxCharacters;
  const length = caption.length;
  return {
    isValid: length <= limit,
    length,
    remaining: limit - length,
  };
}

export function generateLocalMediaPackage(topic: string, platform: PlatformType) {
  const cleanTopic = topic.trim() || 'My Website Platform';
  
  const hooks: Record<PlatformType, string> = {
    tiktok: `Stop scrolling! Here is how ${cleanTopic} is changing everything you know in 2026. 🚀`,
    youtube: `Complete walkthrough: How to master ${cleanTopic} and 10x your automated productivity today.`,
    instagram: `The secret behind building ${cleanTopic} from scratch... details inside! ✨`,
    twitter: `I just automated ${cleanTopic}. Here's the exact blueprint you need to know: 🧵👇`,
  };

  const hashtags: Record<PlatformType, string[]> = {
    tiktok: ['fyp', 'tech', 'productivity', 'coding', 'viral', 'ai'],
    youtube: ['TechTutorial', 'Automation', 'Productivity', 'WebApp', 'TechTrends2026'],
    instagram: ['techcreator', 'codinglife', 'webdevelopment', 'softwareengineer', 'entrepreneur'],
    twitter: ['buildinpublic', 'webdev', 'tech', 'ai'],
  };

  return {
    topic: cleanTopic,
    platform,
    hook: hooks[platform],
    script: [
      { timestamp: '0:00', scene: 'Hook & Problem Statement', narration: `Most people struggle with ${cleanTopic}. Here's the truth.` },
      { timestamp: '0:15', scene: 'Key Demonstration', narration: `Watch how this automated workflow executes tasks with zero friction.` },
      { timestamp: '0:35', scene: 'Results & Metrics', narration: `We saw an immediate 300% boost in daily efficiency.` },
      { timestamp: '0:50', scene: 'Call to Action', narration: `Drop a comment below and check the link in bio to try it now.` },
    ],
    hashtags: hashtags[platform],
    thumbnail: {
      headline: cleanTopic.toUpperCase().slice(0, 24),
      subtext: 'FULLY AUTOMATED IN 2026',
      badgeText: 'MUST WATCH',
      aspectRatio: PLATFORM_LIMITS[platform].recommendedAspect,
      theme: 'stark_cyan' as const,
    },
  };
}
