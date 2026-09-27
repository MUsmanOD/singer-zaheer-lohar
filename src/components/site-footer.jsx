import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SocialFooterCallout } from "@/components/social/social-channels";

const footerLinks = [
  { href: "/about-us", label: "About" },
  { href: "/music", label: "Music" },
  { href: "/playlists", label: "Playlists" },
  { href: "/promotion", label: "Promotion" },
  { href: "/follow", label: "Follow along" },
  { href: "/booking", label: "Booking" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__main">
        <div className="site-footer__identity">
          <Link className="wordmark wordmark--footer" href="/">
            <Image className="wordmark__logo wordmark__logo--footer" src="/images/logo/logo.png" alt="" width={66} height={66} />
            <span className="wordmark__copy">
            <span className="wordmark__name">Zaheer Lohar</span>
            <span className="wordmark__descriptor">Singer · Songwriter</span>
            </span>
          </Link>
          <p>Thank you for listening, sharing, and being here.</p>
        </div>
        <nav className="site-footer__links" aria-label="Footer navigation"><span>Explore</span>{footerLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}<a href="mailto:hello@zaheerlohar.com">Email <ArrowUpRight size={12} /></a></nav>
        <SocialFooterCallout />
      </div>
      <div className="page-shell site-footer__bottom">
        <span>© {new Date().getFullYear()} Zaheer Lohar</span>
        <span className="site-footer__credits">
          Photography: <a href="https://unsplash.com/photos/performer-with-long-hair-and-mustache-sings-into-a-microphone-vH_jlRAddXI" target="_blank" rel="noreferrer">Max Ovcharenko</a> and <a href="https://unsplash.com/photos/singer-performing-on-stage-with-audience-recording-5uViRC7YoVg" target="_blank" rel="noreferrer">Les Taylor</a> / Unsplash · Video: <a href="https://www.pexels.com/video/a-man-singing-on-the-stage-9006072/" target="_blank" rel="noreferrer">Yan Krukau</a> / Pexels
        </span>
      </div>
    </footer>
  );
}
