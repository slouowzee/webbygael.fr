import type { CSSProperties } from "react";
import { steps } from "@/content/steps";

export function Method() {
  return (
    <section className="sec meth" id="methode">
      <div className="wrap meth-in">
        <h2 className="d h2">On s&apos;y prend comme ça</h2>
        <div className="stack">
          {steps.map((s, i) => (
            <article className="step" key={s.title} style={{ "--i": i } as CSSProperties}>
              <div className="step-in">
                <div><h3 className="d">{s.title}</h3><p>{s.text}</p></div>
                <span className="n">Étape {i + 1} sur {steps.length}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
