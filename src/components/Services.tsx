import { services } from "@/content/services";

export function Services() {
  return (
    <section className="sec wrap" id="services">
      <div className="svc">
        <div>
          <h2 className="d h2">Vous avez besoin…</h2>
          <ul className="svc-list">
            {services.map((s) => (
              <li key={s.word} data-word={s.word}>
                <span className="name">{s.name}</span>
                <span className="desc">{s.desc}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="slot svc-slot" data-slot data-rx=".95" data-rz=".25" />
      </div>
    </section>
  );
}
