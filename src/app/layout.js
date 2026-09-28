import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import { artistDescription, artistKeywords, artistName, siteUrl } from "@/lib/seo/site";
import "./globals.css";
import "./motion.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const headingFont = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${artistName} — Singer & Songwriter`,
    template: `%s — ${artistName}`,
  },
  description: artistDescription,
  keywords: artistKeywords,
  applicationName: `${artistName} official website`,
  category: "music",
  referrer: "origin-when-cross-origin",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: `${artistName} — Singer & Songwriter`,
    description: artistDescription,
    type: "website",
    url: siteUrl,
    siteName: artistName,
    locale: "en_PK",
    images: [{ url: "/images/banner.png", width: 1774, height: 887, alt: `${artistName} performing` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${artistName} — Singer & Songwriter`,
    description: artistDescription,
    images: ["/images/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: { icon: "/images/logo/logo.png", apple: "/images/logo/logo.png" },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "htXX3gt7vmS4qlaa1lY8a8-u-egd3MvN9uihJtH3tYs",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" cz-shortcut-listen="true">{children}</body>
    </html>
  );
}
