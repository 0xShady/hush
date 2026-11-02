import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  youtube: {
    enabled: true,
    landingPage: '',
    features: {
      hideShorts: false,
      hideSidebarRecs: false,
      hideEndScreen: false,
      commentsBeeside: false,
      hideHomeFeed: false,
      disableAutoplay: false,
      showDislikeCount: false,
      hideSubscriptions: false,
      hidePlayables: false,
    },
  },
  instagram: {
    enabled: true,
    landingPage: '',
    features: {
      hideReels: false,
      hideStories: false,
      hideSuggested: false,
      hideAds: false,
      hideReelsInFeed: false,
    },
  },
  twitter: {
    enabled: true,
    landingPage: '',
    features: {
      defaultToFollowing: false,
      hideTrending: false,
      hideWhoToFollow: false,
      hideAds: false,
      hideGrok: false,
    },
  },
  reddit: {
    enabled: true,
    landingPage: '',
    features: {
      hideAds: false,
      hideAwards: false,
      hidePremiumUpsell: false,
      disableVideoAutoplay: false,
      hideGames: false,
    },
  },
  linkedin: {
    enabled: true,
    landingPage: '',
    features: {
      hidePeopleYouMayKnow: false,
      hideAds: false,
      hidePuzzles: false,
      hidePremiumUpsell: false,
    },
  },
};
