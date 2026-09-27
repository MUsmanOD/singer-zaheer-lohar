export const SOCIAL_CHANNELS = [
  { key: "youtube", label: "YouTube", countLabel: "Subscribers", placeholder: "https://youtube.com/@channel", description: "Music videos, live moments, and new releases.", hosts: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"] },
  { key: "instagram", label: "Instagram", countLabel: "Followers", placeholder: "https://instagram.com/profile", description: "A closer look at life around the music.", hosts: ["instagram.com", "www.instagram.com"] },
  { key: "tiktok", label: "TikTok", countLabel: "Followers", placeholder: "https://tiktok.com/@profile", description: "Short clips, sounds, and moments on the move.", hosts: ["tiktok.com", "www.tiktok.com"] },
  { key: "spotify", label: "Spotify", countLabel: "Monthly listeners", placeholder: "https://open.spotify.com/artist/…", description: "Stream the songs wherever you listen.", hosts: ["open.spotify.com", "spotify.com", "www.spotify.com"] },
  { key: "facebook", label: "Facebook", countLabel: "Followers", placeholder: "https://facebook.com/page", description: "Updates, announcements, and community news.", hosts: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com"] },
  { key: "x", label: "X", countLabel: "Followers", placeholder: "https://x.com/profile", description: "News and conversations from the road.", hosts: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"] },
  { key: "soundcloud", label: "SoundCloud", countLabel: "Followers", placeholder: "https://soundcloud.com/profile", description: "Discover tracks and independent releases.", hosts: ["soundcloud.com", "www.soundcloud.com"] },
  { key: "appleMusic", label: "Apple Music", countLabel: "Listeners", placeholder: "https://music.apple.com/artist/…", description: "Listen to the catalogue on Apple Music.", hosts: ["music.apple.com", "apple.co"] },
  { key: "threads", label: "Threads", countLabel: "Followers", placeholder: "https://threads.net/@profile", description: "Notes, updates, and everyday conversations.", hosts: ["threads.net", "www.threads.net"] },
];

export const DEFAULT_SOCIAL_LINKS = Object.fromEntries(
  SOCIAL_CHANNELS.map(({ key }) => [key, { url: "", followers: null }]),
);

export const SOCIAL_CHANNEL_BY_KEY = Object.fromEntries(
  SOCIAL_CHANNELS.map((channel) => [channel.key, channel]),
);
