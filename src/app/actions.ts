"use server";

import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { createBooking, fetchSlots } from "@/lib/cal";
import { allowRequest, OBJETS, validateContact, type ContactErrors, validateBooking } from "@/lib/contact";
import { site } from "@/lib/site";

export type ContactState = { ok: boolean; errors?: ContactErrors; error?: string };

const TOO_MANY = "Hopopop, y'a un peu trop de trafic par là, revenez plus tard...";
const BOOKING_FAILED = "La réservation n'a pas abouti. Ce créneau vient peut-être d'être pris : choisissez-en un autre.";
const clientIp = async () => (await headers()).get("x-forwarded-for")?.split(",").at(-1)?.trim() || "inconnue";
const line = (v: FormDataEntryValue | string | null, max: number) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export async function sendContact(_prev: ContactState, data: FormData): Promise<ContactState> {
  if (data.get("confirmation")) return { ok: true };

  const email = line(data.get("email"), 254);
  const message = String(data.get("message") ?? "").trim().slice(0, 5000);
  const errors = validateContact(email, message);
  if (errors.email || errors.message) return { ok: false, errors };

  if (!allowRequest(await clientIp())) return { ok: false, error: TOO_MANY };

  const nom = line(data.get("nom"), 200), entreprise = line(data.get("entreprise"), 200);
  const objet = OBJETS.find(o => o === data.get("objet")) ?? "Contact";
  const port = Number(process.env.SMTP_PORT);
  try {
    await nodemailer
      .createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
      .sendMail({
        from: { name: site.name, address: process.env.SMTP_USER! },
        to: process.env.CONTACT_TO,
        replyTo: email,
        subject: `[${objet}] ${nom || email}`,
        text: `Nom : ${nom || "non renseigné"}\nEntreprise : ${entreprise || "non renseignée"}\nEmail : ${email}\nObjet : ${objet}\n\n${message}`,
      });
  } catch (e) {
    console.error("Envoi du formulaire de contact impossible", e);
    return { ok: false, error: `Oups, le pigeon voyageur qui transportait votre message s'est égaré, réessayez en rechargeant la page ou écrivez-moi directement à ${site.email}.` };
  }
  return { ok: true };
}

export type SlotsResult = { ok: true; slots: Record<string, string[]> } | { ok: false };

export async function getSlots(month: string): Promise<SlotsResult> {
  if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return { ok: false };
  if (!allowRequest(`slots:${await clientIp()}`, 30)) return { ok: false };
  try {
    return { ok: true, slots: await fetchSlots(month) };
  } catch (e) {
    console.error("Lecture des disponibilités impossible", e);
    return { ok: false };
  }
}

export type BookingResult = { ok: boolean; errors?: { name?: string; email?: string }; error?: string };

export async function bookVisio(input: { start: string; name: string; email: string; trap?: string }): Promise<BookingResult> {
  if (!input || typeof input.start !== "string") return { ok: false, error: BOOKING_FAILED };
  if (input.trap) return { ok: true };

  const name = line(input.name, 200), email = line(input.email, 254);
  const errors = validateBooking(name, email);
  if (errors.name || errors.email) return { ok: false, errors };
  if (Number.isNaN(Date.parse(input.start))) return { ok: false, error: BOOKING_FAILED };

  if (!allowRequest(`visio:${await clientIp()}`, 2)) return { ok: false, error: TOO_MANY };

  try {
    await createBooking(input.start, name, email);
  } catch (e) {
    console.error("Réservation impossible", e);
    return { ok: false, error: BOOKING_FAILED };
  }
  return { ok: true };
}
