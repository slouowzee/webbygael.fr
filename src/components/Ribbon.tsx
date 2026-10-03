"use client";

import { useEffect, useRef } from "react";
import { ribbon } from "@/lib/ribbon";

type Three = typeof import("three");
type Pose = { x: number; y: number; s: number; rx: number; rz: number; m: number };
const KEYS = ["x", "y", "s", "rx", "rz", "m"] as const;
const DEFAULT_WORDS = ["SITES", "APPLIS", "BOUTIQUES", "OUTILS"];

function start(THREE: Three, canvas: HTMLCanvasElement, base: string[]) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  let INK = css("--ink"), PAPER = css("--paper");
  const VIOLET = css("--violet");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.z = 8;
  const HALF_H = Math.tan(THREE.MathUtils.degToRad(17.5)) * 8;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc6e0, 1.25));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7); sun.position.set(3, 5, 6); scene.add(sun);

  const W = 4096, H = 288;
  const tc = document.createElement("canvas"); tc.width = W; tc.height = H;
  const ctx = tc.getContext("2d")!;
  const tex = new THREE.CanvasTexture(tc);
  tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  function paint(words: string[]) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    let F = H * 0.6;
    const setFont = () => { ctx.font = `800 ${F}px Archivo, Arial, sans-serif`; try { ctx.fontStretch = "expanded"; } catch {} };
    const unit = () => words.reduce((a, w) => a + ctx.measureText(w).width + F * 0.95, 0);
    setFont();
    let u = unit();
    const n = Math.max(1, Math.round(W / u));
    if (n === 1 && u > W) { F *= W / u; setFont(); u = unit(); }
    ctx.scale(W / (n * u), 1);
    ctx.textBaseline = "middle";
    let x = 0; const gap = F * 0.95;
    for (let i = 0; i < n; i++) for (const w of words) {
      ctx.fillStyle = PAPER; ctx.fillText(w, x + gap * 0.18, H / 2 + F * 0.05);
      x += ctx.measureText(w).width + gap;
      ctx.beginPath(); ctx.arc(x - gap * 0.32, H / 2, F * 0.2, 0, Math.PI * 2);
      ctx.lineWidth = F * 0.075; ctx.strokeStyle = VIOLET; ctx.stroke();
    }
    tex.needsUpdate = true;
  }
  let current = base;
  paint(current);
  document.fonts?.load("800 100px Archivo").then(() => paint(current)).catch(() => {});
  ribbon.setWords = words => { current = words || base; paint(current); };
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => { INK = css("--ink"); PAPER = css("--paper"); paint(current); };
  scheme.addEventListener("change", onScheme);

  const U = 360, V = 16, R = 2.3, HW = 0.5;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= U; i++) {
    const u = i / U, a = u * Math.PI * 2, ph = u * Math.PI * 2;
    for (let j = 0; j <= V; j++) {
      const v = (j / V * 2 - 1) * HW, r = R + v * Math.cos(ph);
      pos.push(r * Math.cos(a), v * Math.sin(ph) + 0.3 * Math.sin(2 * a), r * Math.sin(a));
      uv.push(u, j / V);
    }
  }
  for (let i = 0; i < U; i++) for (let j = 0; j < V; j++) {
    const a = i * (V + 1) + j, b = a + V + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const twisted = Float32Array.from(pos), posAttr = geo.getAttribute("position");
  function shape(m: number) {
    const hw = HW * (1 - 0.55 * m), out = posAttr.array; let n = 0;
    for (let i = 0; i <= U; i++) {
      const a = i / U * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      for (let j = 0; j <= V; j++, n += 3) {
        const r = R + (j / V * 2 - 1) * hw;
        out[n] = twisted[n] + (r * ca - twisted[n]) * m;
        out[n + 1] = twisted[n + 1] * (1 - m);
        out[n + 2] = twisted[n + 2] + (r * sa - twisted[n + 2]) * m;
      }
    }
    posAttr.needsUpdate = true; geo.computeVertexNormals();
  }
  const frontMat = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.22, roughness: 0.42, metalness: 0.05, side: THREE.FrontSide });
  const backMat = new THREE.MeshStandardMaterial({ color: VIOLET, roughness: 0.5, side: THREE.BackSide });
  const ring = new THREE.Group(); ring.add(new THREE.Mesh(geo, frontMat), new THREE.Mesh(geo, backMat));
  const rig = new THREE.Group(); rig.add(ring); scene.add(rig);

  const slots = [...document.querySelectorAll<HTMLElement>("[data-slot]")].map(el => ({ el, rx: +el.dataset.rx!, rz: +el.dataset.rz!, k: +(el.dataset.k ?? 0) || 1, m: "flat" in el.dataset ? 1 : 0 }));
  type Slot = (typeof slots)[number];
  const slotA = slots.find(sl => sl.el.closest("#contact")) ?? slots.find(sl => sl.m === 0), slotB = slots.find(sl => sl.m === 1), footEl = document.querySelector("footer")!;
  const pose: Pose = { x: 0, y: 0, s: 0, rx: 0.6, rz: 0, m: 0 };
  let shaped = 0;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  let halfW = 1, vel = 0, last = performance.now(), drawn = true;

  function target(slot: Slot, offscreen?: boolean): Pose | null {
    const r = slot.el.getBoundingClientRect();
    if (!r.width || (!offscreen && (r.bottom < 0 || r.top > innerHeight))) return null;
    const bw = r.width / innerWidth * 2 * halfW, bh = r.height / innerHeight * 2 * HALF_H;
    const ext = 2 * ((R + HW) * Math.abs(Math.sin(slot.rx)) + (HW + 0.3) * Math.abs(Math.cos(slot.rx)));
    return {
      x: ((r.left + r.width / 2) / innerWidth * 2 - 1) * halfW,
      y: -((r.top + r.height / 2) / innerHeight * 2 - 1) * HALF_H,
      s: Math.min(bw / (2 * (R + HW)), bh / ext) * 0.94 * slot.k, rx: slot.rx, rz: slot.rz, m: slot.m,
    };
  }
  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    halfW = HALF_H * camera.aspect;
  }
  ribbon.kick = v => { vel = Math.max(-3, Math.min(3, v)); };
  const onMove = (e: PointerEvent) => { ptr.tx = e.clientX / innerWidth * 2 - 1; ptr.ty = e.clientY / innerHeight * 2 - 1; };
  addEventListener("resize", resize); resize();
  if (fine && !reduce) addEventListener("pointermove", onMove, { passive: true });

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    let t: Pose | null = null, onPath = false;
    const fr = footEl.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight - fr.top) / Math.min(innerHeight, fr.height || 1)));
    canvas.style.zIndex = p > 0.001 ? "5" : "0";
    const b = p > 0 && slotB ? target(slotB, true) : null;
    if (b) {
      const a = (slotA && target(slotA, true)) || { ...b, s: 0, m: 0, rx: 0.6 }, e = p * p * (3 - 2 * p);
      t = { ...b }; for (const key of KEYS) t[key] = a[key] + (b[key] - a[key]) * e;
      t.s *= 1 + 1.5 * Math.sin(Math.PI * e);
      onPath = true;
    } else for (const slot of slots) { const c = target(slot); if (c && (!t || Math.abs(c.y) < Math.abs(t.y))) t = c; }
    const k = reduce ? 1 : 1 - Math.pow(0.0012, dt);
    if (t) {
      if (onPath) Object.assign(pose, t);
      else {
        if (pose.s < 0.02) { pose.x = t.x; pose.y = t.y; }
        for (const key of KEYS) pose[key] += (t[key] - pose[key]) * (key === "m" || key === "rx" ? k * 0.55 : k);
      }
      if (Math.abs(pose.m - shaped) > 0.002) { shaped = pose.m < 0.004 ? 0 : pose.m > 0.996 ? 1 : pose.m; shape(shaped); }
    } else pose.s += -pose.s * k;
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    vel *= 0.93;
    rig.visible = pose.s > 0.005;
    rig.position.set(pose.x, pose.y, 0);
    rig.scale.setScalar(Math.max(pose.s, 0.0001));
    rig.rotation.set(pose.rx + ptr.y * 0.22 * (1 - pose.m), 0, pose.rz + ptr.x * 0.16 * (1 - pose.m));
    if (!reduce) ring.rotation.y -= dt * (0.22 + vel * 1.4);
    if (rig.visible || drawn) renderer.render(scene, camera);
    drawn = rig.visible;
  }
  const onVisibility = () => { last = performance.now(); renderer.setAnimationLoop(document.hidden ? null : frame); };
  renderer.setAnimationLoop(frame);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    renderer.setAnimationLoop(null);
    removeEventListener("resize", resize);
    removeEventListener("pointermove", onMove);
    document.removeEventListener("visibilitychange", onVisibility);
    scheme.removeEventListener("change", onScheme);
    ribbon.setWords = () => {}; ribbon.kick = () => {};
    geo.dispose(); tex.dispose(); frontMat.dispose(); backMat.dispose(); renderer.dispose();
  };
}

export function Ribbon({ words = DEFAULT_WORDS }: { words?: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wordsKey = words.join("|");

  useEffect(() => {
    const canvas = ref.current!;
    let stop = () => {}, dead = false;
    import("three").then(THREE => {
      if (dead) return;
      try { stop = start(THREE, canvas, wordsKey.split("|")); }
      catch { canvas.hidden = true; document.documentElement.classList.add("no-gl"); }
    });
    return () => { dead = true; stop(); };
  }, [wordsKey]);

  return <canvas id="ribbon" ref={ref} aria-hidden="true" />;
}
