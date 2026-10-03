"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { sendContact, type ContactState } from "@/app/actions";
import { OBJETS, validateContact, type ContactErrors } from "@/lib/contact";
import { track } from "@/lib/track";

const initial: ContactState = { ok: false };

export function ContactForm() {
  const [state, action] = useActionState(sendContact, initial);
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState<ContactErrors | null>(null);
  const errors = local ?? state.errors ?? {};

  const done = useRef<HTMLDivElement>(null);

  useEffect(() => { if (state.ok) { track("message-envoye"); done.current?.focus({ preventScroll: true }); } }, [state.ok]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, data = new FormData(form);
    const found = validateContact(String(data.get("email")), String(data.get("message")));
    if (found.email || found.message) {
      setLocal(found);
      form.querySelector<HTMLElement>(found.email ? "#f-mail" : "#f-msg")?.focus();
      return;
    }
    setLocal(null);
    startTransition(() => action(data));
  }

  if (state.ok) return <div className="done" id="done" role="status" tabIndex={-1} ref={done}><h3 className="d">Message reçu, à bientôt !</h3></div>;

  return (
    <form className="form" id="form" noValidate action={action} onSubmit={onSubmit}>
      <div className="hp" aria-hidden="true"><label>Laissez ce champ vide<input name="confirmation" tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" data-bwignore /></label></div>
      <div className="two">
        <div className="field"><label htmlFor="f-nom">Nom et prénom <span>(facultatif)</span></label><input id="f-nom" name="nom" autoComplete="name" /></div>
        <div className="field"><label htmlFor="f-ent">Entreprise <span>(facultatif)</span></label><input id="f-ent" name="entreprise" autoComplete="organization" /></div>
      </div>
      <div className="two">
        <div className="field"><label htmlFor="f-mail">Email</label><input id="f-mail" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} aria-describedby="e-mail" /><div className="e" id="e-mail">{errors.email}</div></div>
        <div className="field">
          <label htmlFor="f-objet">Objet <span>(facultatif)</span></label>
          <select id="f-objet" name="objet" defaultValue="">
            <option value="">Choisir</option>
            {OBJETS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="field field--grow"><label htmlFor="f-msg">Message</label><textarea id="f-msg" name="message" required aria-invalid={!!errors.message} aria-describedby="e-msg" /><div className="e" id="e-msg">{errors.message}</div></div>
      <p className="form-error" role="alert">{state.error}</p>
      <div className="form-foot">
        <button className="btn btn--solid" type="submit" disabled={pending}>{pending ? "Envoi…" : "Envoyer le message"}</button>
        <span className="rgpd">Vos informations servent uniquement à répondre à votre demande.</span>
      </div>
    </form>
  );
}
