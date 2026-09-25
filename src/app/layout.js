import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MotionRuntime } from "@/components/motion-runtime";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Zaheer Lohar — Singer & Songwriter",
    template: "%s — Zaheer Lohar",
  },
  description: "Singer and songwriter Zaheer Lohar. Explore live performances and book a show.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body   cz-shortcut-listen="true">
        <MotionRuntime>
          <SiteHeader />
          {children}
          <SiteFooter />
        </MotionRuntime>
      </body>
    </html>
  );
}
