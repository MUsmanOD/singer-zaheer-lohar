"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { DEPTH_SELECTOR, REVEAL_PRESETS } from "@/lib/motion/presets";

gsap.registerPlugin(ScrollTrigger);

const REVEAL_SELECTOR = REVEAL_PRESETS.map(({ selector }) => selector).join(", ");
const HEADING_SELECTOR = "h1, h2, h3, h4, h5, h6";
const LETTER_TARGET_SELECTOR = "[data-letter], .heading-letter";
const NO_HEADING_MOTION_SELECTOR = ".playlist-card__title-row h2, .playlist-video-card__copy h3, .playlist-detail-copy h1, .latest-song-card__copy h3, .popular-song-card__copy h3, .home-playlist-card__copy h3, .music-card__copy h2";

function siblingDelay(element, stagger = 0) {
  if (!stagger || !element.parentElement) return 0;
  const siblings = Array.from(element.parentElement.children).filter((item) => item.matches(REVEAL_SELECTOR));
  return Math.max(0, Math.min(siblings.indexOf(element), 3)) * stagger;
}

function setupMotion(root) {
  const registered = new WeakSet();
  const activeTweens = new Set();
  const motionTargets = new Set();
  const depthCleanups = new Map();
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function startingState(preset) {
    return finePointer ? preset.from : { ...preset.from, y: Math.min(preset.from.y || 0, 14), scale: 1, rotationX: 0 };
  }

  function reveal(element) {
    if (element.matches(NO_HEADING_MOTION_SELECTOR)) return;
    const preset = REVEAL_PRESETS.find(({ selector }) => element.matches(selector));
    if (!preset) return;
    const tween = gsap.fromTo(element, startingState(preset), {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: finePointer ? preset.duration : Math.min(preset.duration, 0.58),
      delay: finePointer ? siblingDelay(element, preset.stagger) : 0,
      ease: "power3.out",
      overwrite: "auto",
      onComplete: () => {
        activeTweens.delete(tween);
        gsap.set(element, { clearProps: "opacity,visibility,transform,willChange" });
      },
    });
    activeTweens.add(tween);
    if (element.matches(HEADING_SELECTOR)) {
      element.querySelectorAll(LETTER_TARGET_SELECTOR).forEach((letter, index) => {
        const letterTween = gsap.fromTo(letter, { autoAlpha: 0, y: "45%" }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.52,
          delay: 0.16 + Math.min(index, 28) * 0.028,
          ease: "power3.out",
          overwrite: "auto",
          onComplete: () => {
            activeTweens.delete(letterTween);
            gsap.set(letter, { clearProps: "opacity,visibility,transform,willChange" });
          },
        });
        activeTweens.add(letterTween);
        motionTargets.add(letter);
      });
    }
  }

  function prepareHeading(element) {
    if (element.dataset.headingLetters === "true" && element.dataset.headingText === element.textContent) return;
    element.querySelectorAll(".heading-letter").forEach((letter) => letter.replaceWith(document.createTextNode(letter.textContent || "")));
    const originalText = element.textContent || "";
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent?.trim()) textNodes.push(node);
    }
    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      Array.from(textNode.textContent || "").forEach((character) => {
        const letter = document.createElement("span");
        letter.className = "heading-letter";
        letter.dataset.letter = "true";
        letter.textContent = character === " " ? "\u00a0" : character;
        fragment.appendChild(letter);
      });
      textNode.replaceWith(fragment);
    });
    if (!element.getAttribute("aria-label")) element.setAttribute("aria-label", originalText);
    element.dataset.headingLetters = "true";
    element.dataset.headingText = element.textContent;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      reveal(entry.target);
    }
  }, { rootMargin: "0px 0px -7% 0px", threshold: 0.01 });

  function setupDepth(element) {
    if (!finePointer || depthCleanups.has(element)) return;
    const toX = gsap.quickTo(element, "rotationX", { duration: 0.5, ease: "power3.out" });
    const toY = gsap.quickTo(element, "rotationY", { duration: 0.5, ease: "power3.out" });
    const onMove = (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      toX(-y * 5);
      toY(x * 5);
    };
    const onLeave = () => {
      toX(0);
      toY(0);
    };
    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave);
    depthCleanups.set(element, () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(element);
      gsap.set(element, { clearProps: "rotationX,rotationY" });
    });
  }

  function register(element) {
    if (!(element instanceof HTMLElement)) return;
    if (element.matches(NO_HEADING_MOTION_SELECTOR)) return;
    if (element.matches(HEADING_SELECTOR)) prepareHeading(element);
    if (element.matches(REVEAL_SELECTOR) && !registered.has(element)) {
      registered.add(element);
      motionTargets.add(element);
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom < 0) return;
      if (bounds.top < window.innerHeight * 0.9) reveal(element);
      else {
        const preset = REVEAL_PRESETS.find(({ selector }) => element.matches(selector));
        gsap.set(element, startingState(preset));
        observer.observe(element);
      }
    }
    if (element.matches(DEPTH_SELECTOR)) setupDepth(element);
  }

  function scan(node) {
    if (!(node instanceof Element)) return;
    register(node);
    node.querySelectorAll(REVEAL_SELECTOR).forEach(register);
    node.querySelectorAll(DEPTH_SELECTOR).forEach(setupDepth);
  }

  scan(root);
  const mutations = new MutationObserver((records) => {
    for (const record of records) record.addedNodes.forEach(scan);
  });
  mutations.observe(root, { childList: true, subtree: true });

  let lenis;
  let updateScroll;
  let updateScrollTrigger;
  if (finePointer) {
    lenis = new Lenis({ autoRaf: false, anchors: true, smoothWheel: true, lerp: 0.12, wheelMultiplier: 0.9 });
    updateScrollTrigger = () => ScrollTrigger.update();
    updateScroll = (time) => lenis.raf(time * 1000);
    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(updateScroll);
  }

  const heroImage = root.querySelector(".artist-hero__background");
  let heroParallax;
  if (finePointer && heroImage) {
    heroParallax = gsap.fromTo(heroImage, { yPercent: -2, scale: 1.08 }, {
      yPercent: 7,
      scale: 1.08,
      ease: "none",
      scrollTrigger: { trigger: ".artist-hero", start: "top top", end: "bottom top", scrub: 0.8 },
    });
  }

  return () => {
    mutations.disconnect();
    observer.disconnect();
    activeTweens.forEach((tween) => tween.kill());
    motionTargets.forEach((element) => gsap.set(element, { clearProps: "opacity,visibility,transform,willChange" }));
    depthCleanups.forEach((cleanup) => cleanup());
    heroParallax?.scrollTrigger?.kill();
    heroParallax?.kill();
    if (heroImage) gsap.set(heroImage, { clearProps: "transform" });
    if (lenis) {
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(updateScroll);
      lenis.destroy();
    }
  };
}

export function MotionRuntime({ children }) {
  const rootRef = useRef(null);
  const pathname = usePathname();
  const scrollInitialized = useRef(false);

  // Take control of restoration before Lenis and ScrollTrigger read the
  // viewport. Without this, a browser can restore a tiny previous offset on
  // a hard refresh and the Home hero appears to start slightly scrolled.
  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (!scrollInitialized.current) {
      scrollInitialized.current = true;
      const navigation = window.performance.getEntriesByType("navigation")[0];
      const isInitialHome = window.location.pathname === "/" && !window.location.hash;
      const isFreshLoad = navigation?.type === "reload" || navigation?.type === "navigate";

      if (isInitialHome && isFreshLoad) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        // A second frame covers browsers that apply restoration after the
        // first layout pass.
        window.requestAnimationFrame(() => window.scrollTo(0, 0));
      }
    }

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    const syncPreference = () => {
      cleanup();
      cleanup = preference.matches || !rootRef.current ? () => {} : setupMotion(rootRef.current);
    };
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => {
      preference.removeEventListener("change", syncPreference);
      cleanup();
    };
  }, [pathname]);

  return <div className="motion-root" ref={rootRef}>{children}</div>;
}
