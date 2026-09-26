import Image, { getImageProps } from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { YouTubePlaylist } from "@/components/youtube-playlist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const musicThemes = [
  {
    number: "01",
    title: "Original songs",
    description: "Personal stories, shaped into melodies that stay with you.",
    label: "The songwriter",
  },
  {
    number: "02",
    title: "Live favorites",
    description: "A warm, expressive set made for sharing the moment together.",
    label: "On stage",
  },
  {
    number: "03",
    title: "Acoustic moments",
    description: "A closer listen to the voice, the words, and the feeling behind them.",
    label: "Up close",
  },
];

const galleryImages = [
  {
    src: "/images/banner.png",
    alt: "Zaheer Lohar performing beneath warm stage lights",
    className: "home-gallery__item--feature",
  },
  {
    src: "https://images.unsplash.com/photo-1780510381141-f974c134f75c?auto=format&fit=crop&w=1800&q=85",
    alt: "A singer performing into a microphone on stage",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1772581383954-db992a9db9fa?auto=format&fit=crop&w=1500&q=85",
    alt: "Audience members enjoying a live music performance",
    className: "",
  },
];

const { props: songDesktopImageProps } = getImageProps({
  src: "/images/upcoming.jpg",
  alt: "Promotional banner for Judaiyaan by Zaheer Lohar",
  width: 1707,
  height: 282,
  sizes: "100vw",
});

export function HomePageSections() {
  return (
    <div className="home-sections">
      <section className="home-about section-space" id="about" aria-labelledby="home-about-title">
        <div className="page-shell home-about__layout">
          <div className="home-about__intro reveal">
            <h2 className="type-heading" id="home-about-title">ABOUT<br />US</h2>
            <p className="home-about__lead">A voice for the moments words can’t reach.</p>
            <p className="type-copy">
              Zaheer Lohar brings feeling and honesty to every performance. Rooted in the
              stories behind the songs, his music makes room for listeners to find a piece
              of their own story.
            </p>
          </div>
          <figure className="home-about__feature reveal">
            <Image
              src="/images/banner.png"
              alt="Zaheer Lohar performing beneath warm stage lights"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1000px) 58vw, 44vw"
              className="cover-image"
            />
          </figure>
          <div className="home-about__philosophy reveal">
            <div className="home-about__support-image">
              <Image
                src="/images/banner-mobile.png"
                alt="Zaheer Lohar singing into a microphone"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1000px) 42vw, 25vw"
                className="cover-image"
              />
            </div>
            <div className="home-about__philosophy-copy">
              <h3 className="type-heading">Our Philosophy</h3>
              <p className="type-copy">
                For Zaheer, music turns personal stories into shared moments. Each song is
                shaped by honesty, feeling, and the connection between a voice and its listeners.
              </p>
              <Link className="text-link" href="/about-us">Discover the story</Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="song-feature"
        id="latest-song"
        aria-labelledby="latest-song-title"
      >
        <picture className="song-feature__picture">
          <img {...songDesktopImageProps} className="song-feature__background" />
        </picture>
      </section>

      <section className="home-music section-space" id="popular-music" aria-labelledby="popular-music-title">
        <div className="page-shell">
          <SectionHeading
            title="Popular music"
            description="From carefully written originals to the feeling of a live set, explore the sounds at the heart of Zaheer’s music."
            id="popular-music-title"
          />
          <div className="home-music__grid" data-reveal-stagger>
            {musicThemes.map((theme) => (
              <Card className="home-music__card" data-stagger-item key={theme.number}>
                <CardHeader>
                  <span className="home-music__number">{theme.number}</span>
                  <CardTitle>{theme.title}</CardTitle>
                  <CardDescription>{theme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="home-music__label">{theme.label}</span>
                </CardContent>
                <CardFooter>
                  <Link className="text-link" href="#latest-song">Discover the sound</Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="home-video section-space" id="live" aria-labelledby="youtube-playlist-title">
        <div className="page-shell">
          <SectionHeading
            title="Watch on YouTube"
            description="Explore Zaheer Lohar’s songs and performances from the official YouTube playlist."
            id="youtube-playlist-title"
          />
          <YouTubePlaylist />
        </div>
      </section>

      <section className="home-gallery section-space" id="gallery" aria-labelledby="gallery-title">
        <div className="page-shell">
          <SectionHeading
            title="Gallery"
            description="A few frames from the lights, the stage, and the connection that makes a live show memorable."
            id="gallery-title"
          />
          <div className="home-gallery__grid" data-reveal-stagger>
            {galleryImages.map((image, index) => (
              <figure className={`home-gallery__item ${image.className}`} data-stagger-item key={image.src}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={index === 0 ? "(max-width: 640px) 100vw, 58vw" : "(max-width: 640px) 100vw, 28vw"}
                  className="cover-image"
                />
                <figcaption>Zaheer Lohar · Live moments</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="home-events section-space" id="events" aria-labelledby="events-title">
        <div className="page-shell home-events__layout">
          <div className="home-events__copy reveal">
            <h2 className="type-heading" id="events-title">Events</h2>
            <p className="type-copy">
              Upcoming public dates will be announced here as soon as they’re confirmed.
              For a private event or a performance inquiry, get in touch.
            </p>
            <Button asChild className="button-dark">
              <Link href="/booking">Ask about a performance</Link>
            </Button>
          </div>
          <Card className="home-events__card reveal">
            <CardHeader>
              <Badge variant="secondary">Upcoming dates</Badge>
              <CardTitle>Next show announcement</CardTitle>
              <CardDescription>Details will be shared here once confirmed.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="home-events__date-placeholder" aria-hidden="true" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="home-social section-space" id="social-media" aria-labelledby="social-title">
        <div className="page-shell home-social__inner reveal">
          <h2 className="type-heading" id="social-title">The music keeps moving.</h2>
          <p className="type-copy">
            New releases, moments from the road, and show announcements will be shared here
            as the next chapter unfolds.
          </p>
          <div className="home-social__topics" aria-label="Updates to come">
            <span>New music</span>
            <span>Live moments</span>
            <span>Show announcements</span>
          </div>
          <Button asChild variant="outline" className="button-outline">
            <Link href="/contact-us">Get in touch</Link>
          </Button>
        </div>
      </section>

      <section className="home-booking section-space" id="booking" aria-labelledby="booking-title">
        <div className="page-shell home-booking__inner reveal">
          <h2 className="type-heading" id="booking-title">Let’s make it a night to remember.</h2>
          <p className="type-copy">Bring Zaheer’s live sound to your stage, celebration, or special event.</p>
          <Button asChild className="button-light">
            <Link href="/booking">Enquire about booking</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
