import type { PlatformKey } from "./types";

type FeatureMeta = { key: string; label: string; info: string };
type LandingOption = { value: string; label: string };

export type PlatformConfig = {
  name: string;
  short?: string;
  features: FeatureMeta[];
  landingOptions: LandingOption[];
};

export const ENABLE_INFO = "Turn every Hush change on or off for this site. Turning it off restores the page as the site made it.";
export const LANDING_INFO = "Opening the site's home page sends you here instead. Also used when Hush blocks a page, like Shorts or Reels.";

export const PLATFORM_CONFIG: Record<PlatformKey, PlatformConfig> = {
  youtube: {
    name: "YouTube",
    features: [
      { key: "hideShorts", label: "Hide Shorts", info: "Removes Shorts shelves from Home, Subscriptions and search, the Shorts menu entry, and sends Shorts pages to your landing page." },
      { key: "hideSidebarRecs", label: "Hide Sidebar Recommendations", info: "Removes the recommended videos next to (or under) the player on watch pages." },
      { key: "hideEndScreen", label: "Hide End Screen", info: "Removes the grid of suggested videos and the clickable cards shown when a video ends." },
      { key: "commentsBeside", label: "Comments Beside Video", info: "Moves comments to the right of the player in their own scrolling panel; recommendations move under the video." },
      { key: "hideHomeFeed", label: "Hide Home Feed", info: "Empties the Home page grid so it no longer suggests videos." },
      { key: "disableAutoplay", label: "Disable Autoplay", info: "Turns off YouTube's autoplay switch and hides it, so the next video does not start by itself." },
      { key: "showDislikeCount", label: "Show Dislike Count", info: "Shows an estimated dislike count from the Return YouTube Dislike service. The video ID is sent to that service." },
      { key: "hideSubscriptions", label: "Hide Subscriptions in Sidebar", info: "Removes the Subscriptions section (the channels you follow) from the left menu." },
      { key: "hidePlayables", label: "Hide Games (Playables)", info: "Removes the Playables games entry from the menu and the games shelves from Home." },
    ],
    landingOptions: [
      { value: "", label: "None" },
      { value: "/feed/subscriptions", label: "Subscriptions" },
      { value: "/feed/you", label: "You" },
      { value: "/feed/history", label: "History" },
    ],
  },
  instagram: {
    name: "Instagram",
    features: [
      { key: "hideReels", label: "Hide Reels Tab", info: "Removes the Reels link and sends Reels pages to your landing page." },
      { key: "hideStories", label: "Hide Stories Bar", info: "Removes the row of stories at the top of the feed." },
      { key: "hideSuggested", label: "Hide Suggested Posts and Accounts", info: "Collapses posts Instagram suggests from accounts you do not follow, and hides the Suggested for you accounts in the sidebar." },
      { key: "hideAds", label: "Hide Ads", info: "Collapses sponsored posts in the feed." },
      { key: "hideReelsInFeed", label: "Hide Reels in Feed", info: "Removes Reels from the feed. Photos and other videos stay." },
    ],
    landingOptions: [
      { value: "", label: "None" },
      { value: "/direct/inbox/", label: "Inbox" },
      { value: "/explore/", label: "Explore" },
    ],
  },
  twitter: {
    name: "Twitter / X",
    short: "X",
    features: [
      { key: "defaultToFollowing", label: "Default to Following Feed", info: "Opens the Following timeline instead of For you each time you go to Home. You can still switch back by hand." },
      { key: "hideTrending", label: "Hide Trending Sidebar", info: "Removes the trending topics and news cards from the right column." },
      { key: "hideWhoToFollow", label: "Hide Who to Follow", info: "Removes the account suggestions card from the right column." },
      { key: "hideAds", label: "Hide Promoted Tweets", info: "Hides tweets labeled as ads in your timelines." },
      { key: "hideGrok", label: "Hide Grok Button", info: "Removes Grok from the menu, the floating Grok drawer and the Grok button on each tweet." },
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
      { key: "hideAds", label: "Hide Promoted Posts", info: "Hides promoted posts in feeds and ads between comments and in the sidebar." },
      { key: "hideAwards", label: "Hide Awards", info: "Hides award icons and gold badges on posts and comments." },
      { key: "hidePremiumUpsell", label: "Hide Premium Upsells", info: "Hides banners and buttons that advertise Reddit Premium." },
      { key: "disableVideoAutoplay", label: "Disable Video Autoplay", info: "Stops videos from playing by themselves while you scroll. Clicking play still works." },
      { key: "hideGames", label: "Hide Games on Reddit", info: "Removes the Games on Reddit section from the left sidebar." },
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
      { key: "hidePeopleYouMayKnow", label: "Hide People You May Know", info: "Removes follow and connection suggestions, like Add to your feed, from the sidebar and the feed." },
      { key: "hideAds", label: "Hide Promoted Posts", info: "Hides posts labeled Promoted in the feed and the ad slot in the right sidebar." },
      { key: "hidePuzzles", label: "Hide Today's Puzzles", info: "Removes the LinkedIn games card (Zip, Queens, Sudoku and others) from the right sidebar." },
      { key: "hidePremiumUpsell", label: "Hide Premium Upsells", info: "Hides Premium offers in the sidebar and the Premium button in the top bar." },
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
