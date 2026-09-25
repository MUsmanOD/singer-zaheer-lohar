"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export function MotionRuntime({ children }) {
  const rootRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return undefined;

    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      smoothWheel: true,
    });
    const updateScrollTrigger = () => ScrollTrigger.update();
    const updateScroll = (time) => lenis.raf(time * 1000);
    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(updateScroll);
    gsap.ticker.lagSmoothing(0);

    const context = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              once: true,
            },
          },
        );
      });
    }, rootRef);

    return () => {
      context.revert();
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(updateScroll);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [pathname]);

  return <div className="motion-root" ref={rootRef}>{children}</div>;
}
