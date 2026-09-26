function YouTubeIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="artist-hero__social-icon">
      <path
        fill="#ff0033"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12s0-3.9-.5-5.8Z"
      />
      <path fill="#fff" d="m9.6 15.5 6.2-3.5-6.2-3.5v7Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="artist-hero__social-icon">
      <defs>
        <linearGradient id="instagram-glyph" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffb13d" />
          <stop offset="48%" stopColor="#ec397c" />
          <stop offset="100%" stopColor="#7650d9" />
        </linearGradient>
      </defs>
      <rect
        x="2.6"
        y="2.6"
        width="18.8"
        height="18.8"
        rx="5.6"
        fill="none"
        stroke="url(#instagram-glyph)"
        strokeWidth="2.1"
      />
      <circle cx="12" cy="12" r="4.35" fill="none" stroke="url(#instagram-glyph)" strokeWidth="2.1" />
      <circle cx="17.75" cy="6.35" r="1.25" fill="#f05a78" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="artist-hero__social-icon">
      <path
        fill="#1877f2"
        d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"
      />
    </svg>
  );
}

const audience = [
  { platform: "YouTube", count: "1M+", Icon: YouTubeIcon },
  { platform: "Instagram", count: "10,000+", Icon: InstagramIcon },
  { platform: "Facebook", count: "39,000+", Icon: FacebookIcon },
];

export function HomeHeroSocials() {
  return (
    <ul className="artist-hero__social" aria-label="Social media followers">
      {audience.map(({ platform, count, Icon }) => (
        <li className="artist-hero__social-item" key={platform}>
          <span className="artist-hero__social-platform">
            <Icon />
            <span>{platform}</span>
          </span>
          <span className="artist-hero__social-count">{count}</span>
          <span className="artist-hero__social-label">Followers</span>
        </li>
      ))}
    </ul>
  );
}
