"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ribbon } from "@/lib/ribbon";
import { riseFooter } from "@/lib/rise-footer";

const HOLD_TESTIMONIALS = 0.5;

function showHoveredServiceOnRibbon(list: HTMLElement, signal: AbortSignal) {
  list.querySelectorAll("li").forEach(li => li.addEventListener("pointerenter", () => ribbon.setWords([li.dataset.word!]), { signal }));
  list.addEventListener("pointerleave", () => ribbon.setWords(null), { signal });
}

function stackMethodCards(meth: HTMLElement) {
  const steps = gsap.utils.toArray<HTMLElement>(".step");
  meth.classList.add("is-pinned");
  gsap.set(steps.slice(1), { yPercent: 118 });
  const HOLD = 0.6, MOVE = 1;
  const tl = gsap.timeline({ scrollTrigger: { trigger: meth, start: "top top", end: () => "+=" + innerHeight * 0.75 * (steps.length - 1) * (HOLD + MOVE), pin: true, scrub: 0.8, invalidateOnRefresh: true,
    snap: { snapTo: "labelsDirectional", duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: "power2.out" } } });
  tl.addLabel("carte-0", 0);
  steps.forEach((step, i) => {
    if (!i) return;
    const t = (i - 1) * (HOLD + MOVE) + HOLD;
    tl.to(step, { yPercent: 0, ease: "power1.inOut", duration: MOVE }, t)
      .to(steps[i - 1].firstElementChild, { scale: 0.94, rotateX: -5, ease: "power1.inOut", duration: MOVE }, t)
      .addLabel("carte-" + i, t + MOVE);
  });
  tl.to({}, { duration: HOLD });
}

function settleOnto(section: Element) {
  ScrollTrigger.create({ trigger: section, start: "top 40%", end: "top top",
    snap: { snapTo: (value, self) => (self && self.direction > 0 ? 1 : value), duration: { min: 0.25, max: 0.6 }, delay: 0.08, ease: "power2.out" } });
}

function holdTestimonials(section: HTMLElement) {
  section.classList.add("is-pinned");
  if (section.offsetHeight > innerHeight + 1) { section.classList.remove("is-pinned"); return; }
  settleOnto(section);
  ScrollTrigger.create({ trigger: section, start: "top top", end: () => "+=" + innerHeight * HOLD_TESTIMONIALS, pin: true, invalidateOnRefresh: true });
}

function pinContactUnderFooter(finale: Element, foot: Element) {
  settleOnto(finale);
  finale.classList.add("is-pinned");
  riseFooter(finale, "top top", foot);
}

function animateOnScroll() {
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 900px)" }, ctx => {
    const { motion, wide } = ctx.conditions!;
    const meth = document.getElementById("methode")!, finale = document.querySelector(".finale")!, foot = document.querySelector("footer")!;
    const testimonials = document.getElementById("temoignages");

    if (motion) stackMethodCards(meth);
    if (motion && wide && testimonials) holdTestimonials(testimonials);
    if (motion && wide) pinContactUnderFooter(finale, foot);
    ScrollTrigger.create({ onUpdate: self => ribbon.kick(self.getVelocity() / 2600) });

    return () => {
      meth.classList.remove("is-pinned"); finale.classList.remove("is-pinned");
      testimonials?.classList.remove("is-pinned");
    };
  });
  return mm;
}

function scrollSmoothlyToAnchors(signal: AbortSignal, reduce: boolean) {
  document.addEventListener("click", e => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
    const el = a && document.getElementById(a.hash.slice(1));
    if (!a || !el || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const pin = ScrollTrigger.getAll().find(t => t.pin && (t.pin === el || t.pin.contains(el)));
    const top = a.hash === "#top" ? 0 : pin ? pin.start : el.getBoundingClientRect().top + scrollY;
    scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    if (!el.hasAttribute("tabindex")) el.tabIndex = -1;
    el.focus({ preventScroll: true });
  }, { signal, capture: true });
}

function hidePillNearOtherBookingButtons() {
  const pill = document.getElementById("pill")!;
  const seen = new Set<Element>();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    pill.classList.toggle("is-off", seen.size > 0);
  });
  [document.querySelector(".hero .cta-row")!, document.getElementById("contact")!, document.querySelector("footer")!].forEach(el => io.observe(el));
  return () => { io.disconnect(); pill.classList.add("is-off"); };
}

export function ScrollEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
    const listeners = new AbortController(), { signal } = listeners;
    const list = document.querySelector<HTMLElement>(".svc-list")!;

    if (fine) showHoveredServiceOnRibbon(list, signal);
    const animations = animateOnScroll();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "instant" }));
    scrollSmoothlyToAnchors(signal, reduce);
    const stopPill = hidePillNearOtherBookingButtons();

    return () => { animations.revert(); listeners.abort(); stopPill(); };
  }, []);

  return null;
}
