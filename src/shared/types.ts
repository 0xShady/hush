export type PlatformKey = 'youtube' | 'instagram' | 'twitter' | 'reddit' | 'linkedin';

export type PlatformSettings = {
  enabled: boolean;
  landingPage: string; // empty string = no redirect
  features: Record<string, boolean>;
};

export type Settings = Record<PlatformKey, PlatformSettings>;

export const PLATFORM_KEYS: PlatformKey[] = [
  'youtube',
  'instagram',
  'twitter',
  'reddit',
  'linkedin',
];
