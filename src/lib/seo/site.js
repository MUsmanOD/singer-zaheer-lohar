const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zaheerlohar.com";

export const siteUrl = configuredSiteUrl.replace(/\/$/, "");
export const artistName = "Zaheer Lohar";
export const artistDescription = "Zaheer Lohar is a Pakistani folk singer, songwriter, and performer from Lahore, known for Punjabi and Saraiki music, heartfelt songs, and live performances.";

// Keep this list focused on genuine topics covered by the site. Search engines
// reward relevance and clear page content more than repeated keyword variants.
export const artistKeywords = [
  "Zaheer Lohar",
  "Zaheer Lohar singer",
  "Singer Zaheer Lohar",
  "Zaheer Lohar official",
  "Zaheer Lohar music",
  "Zaheer Lohar songs",
  "Zaheer Lohar latest songs",
  "Zaheer Lohar new songs",
  "Zaheer Lohar folk singer",
  "Zaheer Lohar Pakistani singer",
  "Zaheer Lohar Punjabi singer",
  "Zaheer Lohar Saraiki singer",
  "Zaheer Lohar Records",
  "Zaheer Lohar official music",
  "Zaheer Lohar YouTube",
  "Pakistani singer",
  "Pakistani musician",
  "Pakistani vocalist",
  "Pakistani folk singer",
  "Pakistani folk artist",
  "Pakistani music artist",
  "Pakistani songwriter",
  "Pakistani recording artist",
  "Pakistani male singer",
  "South Asian singer",
  "folk music artist",
  "Punjabi singer",
  "Punjabi folk singer",
  "Punjabi music",
  "Punjabi folk music",
  "Punjabi songs",
  "Punjabi folk songs",
  "Punjabi new songs",
  "Punjabi latest songs",
  "Punjabi music artist",
  "Punjabi vocalist",
  "Punjabi songwriter",
  "Punjabi singer Pakistan",
  "Pakistani Punjabi singer",
  "Saraiki singer",
  "Saraiki folk singer",
  "Saraiki music",
  "Saraiki folk music",
  "Saraiki songs",
  "Saraiki folk songs",
  "Saraiki new songs",
  "Saraiki latest songs",
  "Saraiki music artist",
  "Saraiki vocalist",
  "Saraiki songwriter",
  "Saraiki singer Pakistan",
  "Pakistani Saraiki singer",
  "Pakistani music",
  "Pakistani songs",
  "Pakistani folk music",
  "Pakistani folk songs",
  "Pakistan music industry",
  "Pakistani music videos",
  "Pakistani songs 2026",
  "new Pakistani songs",
  "latest Pakistani songs",
  "folk songs Pakistan",
  "traditional Pakistani music",
  "traditional folk music",
  "South Asian folk music",
  "desi folk music",
  "Lahore singer",
  "Lahore folk singer",
  "Lahore Pakistani singer",
  "Punjabi singer Lahore",
  "Saraiki singer Lahore",
  "Punjab Pakistan singer",
  "Punjab folk singer",
  "Pakistani artist Lahore",
  "Lahore music artist",
  "folk vocalist",
  "folk music singer",
  "traditional singer Pakistan",
  "Pakistani cultural music",
  "Punjabi cultural music",
  "Saraiki cultural music",
  "Pakistani traditional singer",
  "Punjabi traditional singer",
  "Saraiki traditional singer",
  "Pakistani live singer",
  "Pakistani stage singer",
  "folk music performer",
  "Pakistani music performer"
];

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path.startsWith("/") ? path : `/${path}`, siteUrl).toString();
}

export function createPageMetadata({ title, description, path = "/", keywords = [], image = "/images/banner.png", imageAlt = `${artistName} official artist website`, imageWidth = 1774, imageHeight = 887 }) {
  const url = absoluteUrl(path);
  const allKeywords = [...new Set([...artistKeywords, ...keywords])];
  const fullTitle = `${title} — ${artistName}`;

  return {
    title,
    description,
    keywords: allKeywords,
    authors: [{ name: artistName, url: siteUrl }],
    creator: artistName,
    publisher: artistName,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      url,
      siteName: artistName,
      locale: "en_PK",
      images: [{ url: absoluteUrl(image), width: imageWidth, height: imageHeight, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(image)],
    },
  };
}
