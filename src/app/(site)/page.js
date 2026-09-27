import { getImageProps } from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AboutSection } from "@/components/home/about-section";
import { AwardsSection } from "@/components/home/awards-section";
import { BookingCallout } from "@/components/home/booking-callout";
import { LatestSongs } from "@/components/home/latest-songs";
import { PlaylistPreview } from "@/components/home/playlist-preview";
import { PopularSongs } from "@/components/home/PopularSongs";
import { HomeFollowSection } from "@/components/home/follow-section";
import { SocialChannels } from "@/components/social/social-channels";

const bannerAlt = "Zaheer Lohar performing with a microphone beneath warm stage lights";

const { props: desktopBannerProps } = getImageProps({
  src: "/images/banner.png",
  alt: bannerAlt,
  width: 1774,
  height: 887,
  sizes: "100vw",
});

const {
  props: { srcSet: mobileBannerSrcSet },
} = getImageProps({
  src: "/images/banner-mobile.png",
  alt: bannerAlt,
  width: 1024,
  height: 1536,
  sizes: "100vw",
});

export const metadata = {
  title: "Singer & Songwriter",
  description: "Discover Zaheer Lohar’s songs, curated playlists, and the stories behind the music.",
};

export default function Home() {
  return (
    <main>
      <section className="artist-hero" aria-labelledby="home-title">
        <picture className="artist-hero__picture">
          <source media="(max-width: 640px)" srcSet={mobileBannerSrcSet} sizes="100vw" />
          <img
            {...desktopBannerProps}
            alt={bannerAlt}
            loading="eager"
            fetchPriority="high"
            className="artist-hero__background"
          />
        </picture>
        <div className="artist-hero__overlay" aria-hidden="true" />
        <div className="artist-hero__inner page-shell">
          <div className="artist-hero__copy reveal">
            <div className="artist-hero__details">
              <p className="eyebrow">Singer · Songwriter · Performer</p>
              <h1 className="type-heading" id="home-title">Zaheer Lohar<span className="artist-hero__period">.</span></h1>
              <p className="artist-hero__tagline type-subheading">Stories carried by song.</p>
              <p className="artist-hero__intro type-copy">
                Punjabi folk and contemporary music, rooted in feeling and made to be shared.
              </p>
            </div>
            <div className="artist-hero__actions">
              <Button asChild className="button-dark">
                <Link href="/playlists">Explore the music</Link>
              </Button>
              <Link className="text-link" href="/booking">Book a show</Link>
            </div>
            <SocialChannels variant="hero" />
          </div>
        </div>
      </section>
      <AboutSection />
      <AwardsSection />
      <LatestSongs />
      <PopularSongs />
      <HomeFollowSection />
      <PlaylistPreview />
      <BookingCallout />
    </main>
  );
}
