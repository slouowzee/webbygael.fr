import { Agenda } from "@/components/Agenda";
import { ContactForm } from "@/components/ContactForm";

export function Contact() {
  return (
    <section className="talk wrap" id="contact">
      <div className="talk-head">
        <h2 className="d h2">On en parle ?</h2>
        <div className="slot" data-slot data-rx="-.62" data-rz="-.32" data-k="1.2" />
      </div>
      <div className="talk-grid">
        <div className="panel panel--visio">
          <div className="panel-head">
            <h3 className="d">Réserver une visio</h3>
            <p>30 minutes, gratuit et sans engagement. Réservation via Cal.com.</p>
          </div>
          <Agenda />
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3 className="d">Envoyer un message</h3>
            <p>Réponse sous 24 h.</p>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
