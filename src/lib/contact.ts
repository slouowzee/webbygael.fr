export const OBJETS = ["Demande de devis", "Demande de renseignement", "Stage", "Autre demande"] as const;

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactErrors = { email?: string; message?: string };

export function validateContact(email: string, message: string): ContactErrors {
  const errors: ContactErrors = {};
  if (!EMAIL.test(email)) errors.email = "Adresse incomplète (ex. nom@exemple.fr).";
  if (!message.trim()) errors.message = "Écrivez quelques lignes sur votre demande.";
  return errors;
}

export type BookingErrors = { name?: string; email?: string };

export function validateBooking(name: string, email: string): BookingErrors {
  const errors: BookingErrors = {};
  if (!name.trim()) errors.name = "Indiquez votre nom.";
  if (!EMAIL.test(email)) errors.email = "Adresse incomplète (ex. nom@exemple.fr).";
  return errors;
}

const MAX = 5, WINDOW = 10 * 60 * 1000, SWEEP_AT = 2000;
const hits = new Map<string, number[]>();

export function allowRequest(key: string, max = MAX, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter(t => now - t < WINDOW);
  if (recent.length >= max) { hits.set(key, recent); return false; }
  hits.set(key, [...recent, now]);
  if (hits.size > SWEEP_AT) for (const [other, times] of hits) if (now - times[times.length - 1] >= WINDOW) hits.delete(other);
  return true;
}
