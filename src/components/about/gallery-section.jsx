import Image from "next/image";

const GALLERY_ITEMS = [
  ["gallery-01.jpeg", "Zaheer Lohar performing with his traditional instrument"],
  ["gallery-02.jpeg", "Zaheer Lohar in a live performance"],
  ["gallery-03.jpeg", "Zaheer Lohar singing on stage"],
  ["gallery-04.jpeg", "Zaheer Lohar performing for an audience"],
  ["gallery-05.jpeg", "Zaheer Lohar in traditional dress"],
  ["gallery-06.jpeg", "Zaheer Lohar during a musical performance"],
  ["gallery-07.jpeg", "Zaheer Lohar with his traditional instrument"],
];

export function GallerySection() {
  return <section className="about-gallery page-shell" aria-label="Zaheer Lohar photo gallery">
    <div className="about-gallery__grid">
      {GALLERY_ITEMS.map(([src, alt], index) => <figure className={`about-gallery__item about-gallery__item--${index + 1}`} key={src}><Image src={`/images/gallery/${src}`} alt={alt} fill sizes="(max-width: 700px) 100vw, 25vw" /></figure>)}
    </div>
  </section>;
}
