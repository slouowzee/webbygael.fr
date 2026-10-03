import { nextMonthStart } from "./dates";

const API = "https://api.cal.com/v2";
export const TZ = "Europe/Paris";

const event = () => ({ username: process.env.CAL_USERNAME, eventTypeSlug: process.env.CAL_EVENT_SLUG });
const headers = (version: string) => ({
  "cal-api-version": version,
  "Content-Type": "application/json",
});

export async function fetchSlots(month: string): Promise<Record<string, string[]>> {
  const { username, eventTypeSlug } = event();
  if (!username || !eventTypeSlug) throw new Error("CAL_USERNAME ou CAL_EVENT_SLUG manquant");
  const q = new URLSearchParams({ username, eventTypeSlug, start: `${month}-01`, end: nextMonthStart(month), timeZone: TZ });
  const res = await fetch(`${API}/slots?${q}`, { headers: headers("2024-09-04"), cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Cal.com slots ${res.status} ${(await res.text()).slice(0, 300)}`);
  const { data } = (await res.json()) as { data: Record<string, { start: string }[]> };
  return Object.fromEntries(Object.entries(data).filter(([day]) => day.startsWith(month)).map(([day, slots]) => [day, slots.map(s => s.start)]));
}

export async function createBooking(start: string, name: string, email: string) {
  const res = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: headers("2026-02-25"),
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({ ...event(), start: new Date(start).toISOString(), attendee: { name, email, timeZone: TZ, language: "fr" } }),
  });
  if (!res.ok) throw new Error(`Cal.com bookings ${res.status} ${(await res.text()).slice(0, 300)}`);
}
