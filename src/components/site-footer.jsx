import Link from "next/link";

const footerLinks = [
  { href: "/about-us", label: "About" },
  { href: "/contact-us", label: "Contact" },
  { href: "/booking", label: "Booking" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__main">
        <div className="site-footer__identity">
          <Link className="wordmark wordmark--footer" href="/">
            <span className="wordmark__name">Zaheer Lohar</span>
            <span className="wordmark__descriptor">Singer · Songwriter</span>
          </Link>
          <p>Thank you for listening.</p>
        </div>
        <nav className="site-footer__links" aria-label="Footer navigation">
          {footerLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          <Link href="mailto:hello@zaheerlohar.com">Email</Link>
        </nav>
      </div>
      <div className="page-shell site-footer__bottom">
        <span>© {new Date().getFullYear()} Zaheer Lohar</span>
        <span>
          Photography: <a href="https://unsplash.com/photos/performer-with-long-hair-and-mustache-sings-into-a-microphone-vH_jlRAddXI" target="_blank" rel="noreferrer">Max Ovcharenko</a> and <a href="https://unsplash.com/photos/singer-performing-on-stage-with-audience-recording-5uViRC7YoVg" target="_blank" rel="noreferrer">Les Taylor</a> / Unsplash · Video: <a href="https://www.pexels.com/video/a-man-singing-on-the-stage-9006072/" target="_blank" rel="noreferrer">Yan Krukau</a> / Pexels
        </span>
      </div>
    </footer>
  );
}
