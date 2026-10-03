import { testimonials } from "@/content/testimonials";

export function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <section className="sec tem" id="temoignages">
      <div className="wrap">
        <h2 className="d h2">Ce qu&apos;ils en disent</h2>
        <ul className="quotes">
          {testimonials.map(t => (
            <li key={t.name}>
              <figure>
                <blockquote>{t.quote}</blockquote>
                <figcaption>{t.name}, {t.role}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
