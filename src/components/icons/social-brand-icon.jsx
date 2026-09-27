import {
  faApple,
  faFacebookF,
  faInstagram,
  faSoundcloud,
  faSpotify,
  faThreads,
  faTiktok,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const ICONS = {
  youtube: faYoutube,
  instagram: faInstagram,
  tiktok: faTiktok,
  spotify: faSpotify,
  facebook: faFacebookF,
  x: faXTwitter,
  soundcloud: faSoundcloud,
  appleMusic: faApple,
  threads: faThreads,
};

export function SocialBrandIcon({ platform, size = 20, className, title }) {
  const brand = ICONS[platform];
  if (!brand) return null;
  const [width, height, , , path] = brand.icon;

  return (
    <svg
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      className={className}
      role={title ? "img" : undefined}
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      focusable="false"
    >
      <path d={path} />
    </svg>
  );
}
