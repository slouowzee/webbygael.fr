import gsap from "gsap";

export function riseFooter(trigger: Element, start: string, foot: Element) {
  gsap.set(foot, { yPercent: 100 });
  return gsap.timeline({ scrollTrigger: { trigger, start, end: () => "+=" + innerHeight * 1.2, pin: true, scrub: 0.6, invalidateOnRefresh: true,
    snap: { snapTo: "labels", duration: { min: 0.25, max: 0.7 }, delay: 0.06, ease: "power2.out" } } })
    .addLabel("avant", 0)
    .to(foot, { yPercent: 0, ease: "power1.inOut", duration: 1 }, 0.35)
    .addLabel("pied", 1.35);
}
