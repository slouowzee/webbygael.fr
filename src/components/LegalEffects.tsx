"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { riseFooter } from "@/lib/rise-footer";

export function LegalEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", () => {
      const end = document.querySelector(".legal-end")!, foot = end.querySelector("footer")!;
      end.classList.add("is-pinned");
      riseFooter(end, "bottom bottom", foot);
      return () => end.classList.remove("is-pinned");
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return null;
}
