import { Award } from "lucide-react";

export function AwardsSection() {
  return <section className="home-awards" aria-labelledby="home-awards-title"><div className="page-shell home-awards__inner">
    <div className="home-awards__heading"><p className="eyebrow"><Award size={13} /> Recognition</p><h2 id="home-awards-title">Awards &amp; milestones</h2></div>
    <div className="home-awards__note"><span>01 / 01</span><p>Official awards and career milestones will be shared here as they’re announced.</p></div>
  </div></section>;
}
