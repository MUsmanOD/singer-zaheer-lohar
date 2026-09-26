import { getImageProps } from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HomePageSections } from "@/components/home-page-sections";
import { HomeHeroSocials } from "@/components/home-hero-socials";

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
  description: "Meet Zaheer Lohar, explore live performance footage, and inquire about a show.",
};

export default function Home() {
  return (
    <main>
      <section className="artist-hero" aria-labelledby="home-title">
        <picture className="artist-hero__picture">
          <source
            media="(max-width: 900px) and (orientation: portrait), (max-width: 640px)"
            srcSet={mobileBannerSrcSet}
            sizes="100vw"
          />
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
              <p className="artist-hero__tagline type-subheading">Songs that stay with you.</p>
              <p className="artist-hero__intro type-copy">
                A voice for the moments we can’t quite put into words.
                Step into the music, find a live show, or say hello.
              </p>
            </div>
            <div className="artist-hero__actions">
              <Button asChild className="button-dark">
                <Link href="#live">Watch live</Link>
              </Button>
              <Link className="text-link" href="/booking">Book a performance</Link>
            </div>
            <HomeHeroSocials />
          </div>
        </div>
      </section>
      <HomePageSections />
    </main>
  );
}
