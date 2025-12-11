
export enum AppTab {
  THUMBNAIL_DOWNLOADER = 'THUMBNAIL_DOWNLOADER',
  THUMBNAIL_GENERATOR = 'THUMBNAIL_GENERATOR',
  CHANNEL_ANALYSIS = 'CHANNEL_ANALYSIS',
  SCRIPT_GENERATOR = 'SCRIPT_GENERATOR',
  INSTAGRAM_TOOLS = 'INSTAGRAM_TOOLS',
  SEO_TOOLS = 'SEO_TOOLS',
}

export interface AnalysisResult {
  estimatedMonthlyRevenue: string;
  pros: string[];
  cons: string[];
  audiencePersona: string;
  contentStrategy: string[];
  growthScore: number;
}

export interface ScriptResult {
  title: string;
  hook: string;
  body: string;
  cta: string;
  postingPlan: {
    day: string;
    action: string;
  }[];
}

export interface InstagramRepurposeResult {
  reelScript: {
    hook: string;
    scenes: string[];
    audioSuggestion: string;
  };
  carouselPlan: {
    slideNumber: number;
    title: string;
    content: string;
  }[];
  caption: string;
  hashtags: string[];
  visualPrompt: string; 
}

export interface SeoTrendsResult {
  trendingTopics: string[];
  highCtrTitles: {
    template: string;
    example: string;
    whyItWorks: string;
  }[];
}

export interface ChannelIdentityResult {
  strategicNames: {
    name: string;
    reason: string;
  }[];
  channelTags: string[];
}
