export function restoreScrollOnReload() {
  const key = `scroll-y:${location.pathname}`;
  const [nav] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  const save = () => { try { sessionStorage.setItem(key, String(Math.round(scrollY))); } catch {} };
  let saved = 0;
  try { saved = Number(sessionStorage.getItem(key)); sessionStorage.removeItem(key); } catch {}

  history.scrollRestoration = "manual";
  if (saved && !location.hash && nav?.type !== "navigate") requestAnimationFrame(() => scrollTo({ top: saved, behavior: "instant" }));
  addEventListener("pagehide", save);
  return () => removeEventListener("pagehide", save);
}
