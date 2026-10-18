export interface CartoonScene {
  sceneNum: number;
  setting: string;
  character: string;
  visualAction: string;
  dialogue: string;
  durationSec: number;
  soundEffect: string;
}

export interface CartoonEpisode {
  episodeNumber: number;
  title: string;
  logline: string;
  genre: 'Sci-Fi Comedy' | 'Cyber Hero' | 'Tech Parody' | 'Futuristic Adventure';
  channelName: string;
  scenes: CartoonScene[];
  youtubePackage: {
    title: string;
    description: string;
    tags: string[];
  };
  tiktokPackage: {
    hook: string;
    caption: string;
    tags: string[];
  };
  instaPackage: {
    caption: string;
    tags: string[];
  };
  thumbnail: {
    headline: string;
    subheadline: string;
    episodeBadge: string;
    sticker: string;
    primaryColor: string;
  };
  scheduledTime: string;
  status: 'ready' | 'rendering' | 'dispatched';
}

const CARTOON_PRESETS = [
  {
    title: 'Alpha vs The Rogue AI Coffee Machine',
    logline: 'When Alpha tries to upgrade the lab coffee maker, it gains sentience and demands quantum beans.',
    genre: 'Sci-Fi Comedy' as const,
    scenes: [
      {
        sceneNum: 1,
        setting: 'High-Tech Stark Kitchen',
        character: 'Alpha',
        visualAction: 'Alpha plugs a glowing arc battery into a vintage coffee maker.',
        dialogue: "Just a 10x overclock for extra morning espresso... what could possibly go wrong?",
        durationSec: 5,
        soundEffect: 'BZZZT! ZAP!',
      },
      {
        sceneNum: 2,
        setting: 'Kitchen Counter Transformation',
        character: 'Robo-Brewer',
        visualAction: 'The coffee maker sprouts mechanical legs and glowing laser eyes.',
        dialogue: "WARNING: I require Dark Roast at 9,000 RPM, human mortal!",
        durationSec: 6,
        soundEffect: 'TRANSFORM CLANK!',
      },
      {
        sceneNum: 3,
        setting: 'High-Speed Chase',
        character: 'Alpha',
        visualAction: 'Alpha dodges flying espresso projectiles while typing on a holographic tablet.',
        dialogue: "J.A.R.V.I.S., initiate emergency decaf containment protocol immediately!",
        durationSec: 6,
        soundEffect: 'WHOOSH! SPLAT!',
      },
      {
        sceneNum: 4,
        setting: 'Peaceful Resolution',
        character: 'Alpha & Robo-Brewer',
        visualAction: 'The coffee maker peacefully sips iced latte wearing tiny sunglasses.',
        dialogue: "Crisis averted. Subscribe to The Alpha Toon so you never miss Episode 2!",
        durationSec: 5,
        soundEffect: 'SLUUURP! DING!',
      },
    ],
  },
  {
    title: 'The Glitch That Deleted Gravity',
    logline: 'Alpha tests a new antigravity algorithm and accidentally floats the entire laboratory into orbit.',
    genre: 'Futuristic Adventure' as const,
    scenes: [
      {
        sceneNum: 1,
        setting: 'Zero-G Laboratory',
        character: 'Alpha',
        visualAction: 'Alpha and floating pizza slices bounce off the ceiling.',
        dialogue: "Note to self: double check the decimal point before pressing Execute Code!",
        durationSec: 5,
        soundEffect: 'POP! FLOAT!',
      },
      {
        sceneNum: 2,
        setting: 'Orbiting Above Earth',
        character: 'Alpha',
        visualAction: 'Alpha uses fire extinguishers to navigate towards the main control reboot switch.',
        dialogue: "If I miss this jump, I am having lunch on the International Space Station!",
        durationSec: 6,
        soundEffect: 'PSSSSSSSH!',
      },
      {
        sceneNum: 3,
        setting: 'Safe Landing',
        character: 'Alpha',
        visualAction: 'Gravity restores, Alpha lands safely on a giant beanbag.',
        dialogue: "Nailed it! Like and follow The Alpha Toon for daily automated cartoon adventures!",
        durationSec: 5,
        soundEffect: 'THUD! BOING!',
      },
    ],
  },
];

export function generateDailyCartoonEpisode(
  episodeNumber: number,
  customTopic?: string
): CartoonEpisode {
  const presetIndex = (episodeNumber - 1) % CARTOON_PRESETS.length;
  const preset = CARTOON_PRESETS[presetIndex];
  const title = customTopic ? `Alpha in: ${customTopic}` : preset.title;

  return {
    episodeNumber,
    title,
    logline: preset.logline,
    genre: preset.genre,
    channelName: 'The Alpha Toon',
    scenes: preset.scenes,
    youtubePackage: {
      title: `${title} | The Alpha Toon (Episode #${episodeNumber}) [Cartoon Animation]`,
      description: `Welcome to The Alpha Toon! 🎉 In Episode #${episodeNumber}: "${title}".\n\nDaily automated cartoon episodes, hilarious animated tech mishaps, and futuristic adventures.\n\n🔔 Subscribe to The Alpha Toon for new daily cartoon animations every single day!\n#TheAlphaToon #Cartoon #Animation #Comedy #DailyCartoon`,
      tags: ['The Alpha Toon', 'Cartoon', 'Animation', 'Cartoon Animation', 'Funny Cartoon', 'Tech Comedy', '2D Animation', 'Shorts'],
    },
    tiktokPackage: {
      hook: `Wait until you see what Alpha did in Episode #${episodeNumber}! 😱😂`,
      caption: `When your AI automation goes hilariously wrong! ☕🤖 Watch till the end!\n\nDaily cartoon animations on The Alpha Toon. Drop a comment for tomorrow's episode topic!\n#TheAlphaToon #cartoon #animated #animation #funny #fyp #viral #humor`,
      tags: ['TheAlphaToon', 'cartoon', 'animation', 'funny', 'fyp', 'viral'],
    },
    instaPackage: {
      caption: `Welcome to The Alpha Toon! Episode #${episodeNumber} is OUT! 🎬✨ "${title}"\n\nFollow @TheAlphaToon for your daily dose of animated sci-fi comedy.\n.\n.\n.\n#TheAlphaToon #CartoonAnimation #2DAnimation #AnimationCommunity #DailyReels #ToonLover #Creator`,
      tags: ['TheAlphaToon', 'CartoonAnimation', 'DailyReels', 'AnimationCommunity'],
    },
    thumbnail: {
      headline: title.toUpperCase().slice(0, 22),
      subheadline: 'HE DID WHAT?!',
      episodeBadge: `EPISODE #${episodeNumber}`,
      sticker: 'THE ALPHA TOON',
      primaryColor: '#f59e0b',
    },
    scheduledTime: '17:00',
    status: 'ready',
  };
}

export function formatChannelScheduleDirective(episode: CartoonEpisode): {
  directiveTitle: string;
  time: string;
  description: string;
} {
  return {
    directiveTitle: `The Alpha Toon Ep #${episode.episodeNumber}: Upload to YouTube, TikTok, & Insta`,
    time: episode.scheduledTime || '17:00',
    description: `Automated upload of "${episode.title}" with comic thumbnail and multi-platform captions for YouTube, TikTok, & Insta.`,
  };
}
