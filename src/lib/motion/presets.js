// Motion targets and timings live here so page components keep their existing markup.
export const REVEAL_PRESETS = [
  {
    selector: ".artist-hero__copy, .playlist-hero__copy, .music-hero__copy, .follow-hero__copy, .page-intro",
    from: { autoAlpha: 0, y: 24 },
    duration: 0.9,
  },
  {
    selector: ".playlist-hero-feature, .music-hero-feature, .playlist-hero-art, .music-hero-art, .follow-hero__visual, .playlist-detail-cover, .about-story__art, .home-about__media",
    from: { autoAlpha: 0, y: 28, scale: 0.975, rotationX: 4 },
    duration: 0.95,
  },
  {
    selector: ".section-heading, .home-about__copy, .home-awards__heading, .home-section-heading, .follow-section__heading, .music-library__toolbar, .playlist-section-heading, .playlist-detail-copy, .about-story__copy, .booking-page__aside, .booking-page__form, .promotion-aside, .promotion-form-wrap, .follow-page__closer, .home-booking__copy, .home-booking__action, .site-footer__main",
    from: { autoAlpha: 0, y: 22 },
    duration: 0.8,
  },
  {
    selector: "h1, h2, h3, h4, h5, h6",
    from: { autoAlpha: 0, y: 14 },
    duration: 0.72,
  },
  {
    selector: ".latest-song-card, .popular-song-card, .home-playlist-card, .social-channel-card, .playlist-card, .playlist-video-card, .music-card, .event-card, .about-gallery__item",
    from: { autoAlpha: 0, y: 24, scale: 0.985 },
    duration: 0.75,
    stagger: 0.055,
  },
  {
    selector: ".reveal",
    from: { autoAlpha: 0, y: 20 },
    duration: 0.75,
  },
];

export const DEPTH_SELECTOR = ".playlist-hero-feature, .music-hero-feature";
