// UI metadata: display names, feature labels, landing-page options per platform.
// Mirrors the Feature Map in CLAUDE.md. Single source for popup rendering.

import type { PlatformKey } from "./types";

export type FeatureMeta = { key: string; label: string };
export type LandingOption = { value: string; label: string };

export type PlatformConfig = {
  name: string;
  features: FeatureMeta[];
  landingOptions: LandingOption[];
};

export const PLATFORM_CONFIG: Record<PlatformKey, PlatformConfig> = {
  youtube: {
    name: "YouTube",
    features: [
      { key: "hideShorts", label: "Hide Shorts" },
      { key: "hideSidebarRecs", label: "Hide Sidebar Recommendations" },
      { key: "hideEndScreen", label: "Hide End Screen" },
      { key: "commentsBeeside", label: "Comments Beside Video" },
      { key: "hideHomeFeed", label: "Hide Home Feed" },
      { key: "disableAutoplay", label: "Disable Autoplay" },
      { key: "showDislikeCount", label: "Show Dislike Count" },
    ],
    landingOptions: [
      { value: "", label: "None" },
      { value: "/feed/subscriptions", label: "Subscriptions" },
      { value: "/feed/library", label: "Library" },
      { value: "/feed/history", label: "History" },
    ],
  },
  instagram: {
    name: "Instagram",
    features: [
      { key: "hideReels", label: "Hide Reels Tab" },
      { key: "hideStories", label: "Hide Stories Bar" },
      { key: "hideSuggested", label: "Hide Suggested Posts" },
      { key: "hideAds", label: "Hide Ads" },
      { key: "hideReelsInFeed", label: "Hide Reels in Feed" },
    ],
    landingOptions: [
      { value: "", label: "None" },
      { value: "/direct/inbox/", label: "Inbox" },
      { value: "/explore/", label: "Explore" },
    ],
  },
  twitter: {
    name: "Twitter / X",
    features: [
      { key: "defaultToFollowing", label: "Default to Following Feed" },
      { key: "hideTrending", label: "Hide Trending Sidebar" },
      { key: "hideWhoToFollow", label: "Hide Who to Follow" },
      { key: "hideAds", label: "Hide Promoted Tweets" },
      { key: "hideGrok", label: "Hide Grok Button" },
    ],
    landingOptions: [
      { value: "", label: "None" },
      { value: "/home", label: "For You" },
      { value: "/i/bookmarks", label: "Bookmarks" },
      { value: "/messages", label: "Messages" },
    ],
  },
  reddit: {
    name: "Reddit",
    features: [
      { key: "hideAds", label: "Hide Promoted Posts" },
      { key: "hideAwards", label: "Hide Awards" },
      { key: "hidePremiumUpsell", label: "Hide Premium Upsells" },
      { key: "disableVideoAutoplay", label: "Disable Video Autoplay" },
    ],
    landingOptions: [
      { value: "", label: "None" },
      { value: "/r/popular", label: "Popular" },
      { value: "/r/all", label: "All" },
      { value: "/saved", label: "Saved" },
    ],
  },
  linkedin: {
    name: "LinkedIn",
    features: [
      { key: "hidePeopleYouMayKnow", label: "Hide People You May Know" },
      { key: "hideAds", label: "Hide Promoted Posts" },
      { key: "hideNewsActivity", label: "Hide News & Activity" },
      { key: "hideLearning", label: "Hide Learning Suggestions" },
      { key: "hideAddToProfile", label: "Hide Add to Profile Nudges" },
      { key: "hideCelebrate", label: "Hide Celebrate Prompts" },
      { key: "hidePremiumUpsell", label: "Hide Premium Upsells" },
    ],
    landingOptions: [
      { value: "", label: "None" },
      { value: "/my-network/", label: "My Network" },
      { value: "/jobs/", label: "Jobs" },
      { value: "/messaging/", label: "Messaging" },
      { value: "/notifications/", label: "Notifications" },
    ],
  },
};
