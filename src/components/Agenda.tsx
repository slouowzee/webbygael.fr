"use client";

import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { bookVisio, getSlots, type BookingResult } from "@/app/actions";
import { validateBooking } from "@/lib/contact";
import { monthAt } from "@/lib/dates";
import { site } from "@/lib/site";
import { track } from "@/lib/track";

const TZ = "Europe/Paris";
type Slots = Record<string, string[]>;
type Step = "date" | "time" | "who" | "done";

const pad = (n: number) => String(n).padStart(2, "0");
const todayParis = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
const noon = (day: string) => new Date(`${day}T12:00:00Z`);
const fmt = (day: string, o: Intl.DateTimeFormatOptions) => noon(day).toLocaleDateString("fr-FR", { ...o, timeZone: "UTC" });
const long = (day: string) => fmt(day, { weekday: "long", day: "numeric", month: "long" });
const time = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const never = () => () => {};
const MAX_RETRIES = 2, RETRY_DELAY = 4000;
const dropErrors = (cache: Record<string, Slots | "error">) => Object.fromEntries(Object.entries(cache).filter(([, v]) => v !== "error"));

const Arrow = ({ left }: { left?: boolean }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d={left ? "M13 8H3M7 4 3 8l4 4" : "M3 8h10M9 4l4 4-4 4"} /></svg>
);

export function Agenda() {
  const today = useSyncExternalStore(never, todayParis, () => null);
  const [offset, setOffset] = useState(0);
  const [cache, setCache] = useState<Record<string, Slots | "error">>({});
  const [step, setStep] = useState<Step>("date");
  const [picked, setPicked] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<BookingResult>({ ok: false });
  const [pending, startTransition] = useTransition();
  const wheel = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const panel = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const retries = useRef<Record<string, number>>({});
  const [booked, setBooked] = useState<{ day: string; start: string } | null>(null);

  const base = today ? monthAt(today, offset) : null;
  const y = base?.y ?? 0, m = base?.m ?? 0, month = base?.key ?? "";
  const loaded = cache[month];
  const slots = loaded && loaded !== "error" ? loaded : {};
  const times = (picked && slots[picked]) || [];
  const slot = times[Math.min(index, times.length - 1)];

  useEffect(() => {
    if (!month) return;
    if (cache[month] === "error") {
      if ((retries.current[month] ?? 0) > MAX_RETRIES) return;
      const retry = setTimeout(() => setCache(dropErrors), RETRY_DELAY);
      return () => clearTimeout(retry);
    }
    if (cache[month]) return;
    let dead = false;
    getSlots(month).catch(() => ({ ok: false as const })).then(r => {
      if (dead) return;
      if (!r.ok) retries.current[month] = (retries.current[month] ?? 0) + 1;
      setCache(c => ({ ...c, [month]: r.ok ? r.slots : "error" }));
    });
    return () => { dead = true; };
  }, [month, cache]);

  const clampIndex = (i: number) => Math.max(0, Math.min(times.length - 1, i));
  const rowH = () => (wheel.current?.firstElementChild as HTMLElement | null)?.offsetHeight ?? 44;
  const placeWheel = useEffectEvent(() => wheel.current?.scrollTo({ top: index * rowH() }));

  useEffect(() => {
    if (step === "time") placeWheel();
    if (!moved.current) return;
    const inPanel = (selector: string) => panel.current?.querySelector<HTMLElement>(selector);
    const target = { time: wheel.current, date: inPanel('.cal-grid [aria-pressed="true"]'), who: inPanel("#v-nom"), done: inPanel(".cal-done") }[step];
    target?.focus({ preventScroll: true });
  }, [step, picked]);

  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const goTo = (i: number) => wheel.current?.scrollTo({ top: i * rowH(), behavior: reduce() ? "auto" : "smooth" });
  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => { if (wheel.current) setIndex(clampIndex(Math.round(wheel.current.scrollTop / rowH()))); });
  };
  const onKey = (e: KeyboardEvent) => {
    const by = ({ ArrowDown: 1, ArrowUp: -1, PageDown: 4, PageUp: -4 } as Record<string, number>)[e.key];
    if (!by) return;
    e.preventDefault(); goTo(clampIndex(index + by));
  };

  function book(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget), name = String(data.get("name")).trim(), email = String(data.get("email")).trim();
    const errors = validateBooking(name, email);
    if (errors.name || errors.email) { setResult({ ok: false, errors }); return; }
    startTransition(async () => {
      const r = await bookVisio({ start: slot, name, email, trap: String(data.get("confirmation") ?? "") });
      setResult(r);
      if (r.ok) { track("visio-reservee"); setBooked({ day: picked!, start: slot }); setStep("done"); setCache(c => { const rest = { ...c }; delete rest[month]; return rest; }); }
    });
  }

  const lead = base ? (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7 : 0;
  const days = base ? new Date(Date.UTC(y, m + 1, 0)).getUTCDate() : 0;
  let note = result.error ?? "";
  if (loaded === "error") note = `Impossible d'afficher les disponibilités pour le moment. Écrivez-moi à ${site.email}.`;
  if (step === "done") note = "";

  return (
    <>
      <div className="cal" ref={panel} onClickCapture={() => { moved.current = true; }}>
        <div className="cal-step" id="cal-date" hidden={step !== "date"}>
          <p className="cal-title">Choisissez une date</p>
          <div className="cal-nav">
            <button type="button" aria-label="Mois précédent" disabled={offset <= 0} onClick={() => { setCache(dropErrors); setOffset(o => o - 1); }}><Arrow left /></button>
            <strong aria-live="polite">{base && fmt(`${month}-01`, { month: "long", year: "numeric" })}</strong>
            <button type="button" aria-label="Mois suivant" disabled={!base} onClick={() => { setCache(dropErrors); setOffset(o => o + 1); }}><Arrow /></button>
          </div>
          <div className="cal-grid" role="group" aria-label="Choisir un jour" aria-busy={!loaded}>
            {["L", "M", "M", "J", "V", "S", "D"].map((w, i) => <span key={i} aria-hidden="true">{w}</span>)}
            {Array.from({ length: lead }, (_, i) => <i key={`v${i}`} />)}
            {Array.from({ length: days }, (_, i) => {
              const day = `${month}-${pad(i + 1)}`;
              return (
                <button key={day} type="button" disabled={!slots[day]?.length} aria-label={long(day)} aria-pressed={day === picked}
                  onClick={() => { setPicked(day); setIndex(0); setResult({ ok: false }); setStep("time"); }}>{i + 1}</button>
              );
            })}
          </div>
        </div>

        <div className="cal-step cal-step--center" id="cal-time" hidden={step !== "time"}>
          <div className="cal-nav cal-nav--time">
            <button type="button" aria-label={picked ? `Changer de date (date choisie : ${long(picked)})` : "Changer de date"} onClick={() => setStep("date")}><Arrow left /></button>
            <strong>{picked && cap(long(picked))}</strong>
            <span aria-hidden="true" />
          </div>
          <div className="wheel-wrap">
            <div className="wheel" ref={wheel} role="listbox" aria-label="Choisir un horaire" tabIndex={0} onScroll={onScroll} onKeyDown={onKey}>
              {times.map((t, i) => <button key={t} type="button" role="option" aria-selected={t === slot} tabIndex={-1} onClick={() => goTo(i)}>{time(t)}</button>)}
            </div>
          </div>
          <button className="btn btn--light" type="button" onClick={() => setStep("who")}>{slot ? `Réserver à ${time(slot)}` : ""}</button>
        </div>

        {step === "done" && booked && (
          <div className="cal-step cal-step--center cal-done" role="status" tabIndex={-1}>
            <span className="cal-check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7.5" /></svg></span>
            <h4 className="d">Visio réservée !</h4>
            <p className="cal-when">{cap(long(booked.day))} à {time(booked.start)}</p>
            <p>La confirmation arrive par email.</p>
          </div>
        )}

        {step === "who" && picked && (
          <form className="cal-step" id="cal-who" noValidate onSubmit={book}>
            <div className="cal-nav cal-nav--time">
              <button type="button" aria-label="Changer d'horaire" onClick={() => setStep("time")}><Arrow left /></button>
              <strong>{cap(long(picked))} à {time(slot)}</strong>
              <span aria-hidden="true" />
            </div>
            <div className="hp" aria-hidden="true"><label>Laissez ce champ vide<input name="confirmation" tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" data-bwignore /></label></div>
            <div className="field"><label htmlFor="v-nom">Nom et prénom</label><input id="v-nom" name="name" autoComplete="name" required aria-invalid={!!result.errors?.name} aria-describedby="e-v-nom" /><div className="e" id="e-v-nom">{result.errors?.name}</div></div>
            <div className="field"><label htmlFor="v-mail">Email</label><input id="v-mail" name="email" type="email" autoComplete="email" required aria-invalid={!!result.errors?.email} aria-describedby="e-v-mail" /><div className="e" id="e-v-mail">{result.errors?.email}</div></div>
            <button className="btn btn--light" type="submit" disabled={pending}>{pending ? "Réservation…" : "Confirmer la visio"}</button>
          </form>
        )}
      </div>
      <p className="note" id="visio-note" aria-live="polite">{note}</p>
    </>
  );
}
