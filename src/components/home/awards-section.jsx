import Image from "next/image";

export function AwardsSection() {
  return <section className="home-awards" aria-label="Recognition awards"><div className="page-shell home-awards__inner">
    <div className="home-awards__grid">
      <article className="home-award-card home-award-card--primary"><div className="home-award-card__image"><Image src="/images/awards/youtube-gold-record.jpg" alt="YouTube Gold Creator Award presented to Zaheer Lohar Records" fill sizes="(max-width: 700px) 80vw, 40vw" /></div></article>
      <article className="home-award-card home-award-card--secondary"><div className="home-award-card__image"><Image src="/images/awards/ptv-recognition.png" alt="PTV special recognition presented to singer Zaheer Lohar" fill sizes="(max-width: 700px) 80vw, 30vw" /></div></article>
    </div>
  </div></section>;
}
