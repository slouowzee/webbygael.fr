import Image from "next/image";
import { projects } from "@/content/projects";

export function Projects() {
  return (
    <section className="proj-sec" id="projets">
      <div className="wrap proj-head">
        <h2 className="d h2">Projets récents</h2>
      </div>
      <div className="proj-view">
        <div className="proj-track">
          {projects.map((p) => (
            <article className="proj" key={p.name}>
              <div className="proj-in">
                <a className="shot shot--img" href={p.href} target="_blank" rel="noopener">
                  {p.motion && <Image className="motion" src={p.motion} alt={p.alt} unoptimized />}
                  <Image className={p.motion ? "still" : undefined} src={p.image} alt={p.alt} sizes="(min-width: 900px) 78vw, 82vw" />
                </a>
                <div className="cap"><strong>{p.name}</strong><span className="soft">{p.kind}</span></div>
              </div>
            </article>
          ))}
          <article className="proj">
            <div className="proj-in">
              <a className="shot shot--line" href="#contact"><small>Le prochain</small><span className="big">Le vôtre ? →</span></a>
              <div className="cap"><strong>Votre projet</strong><span className="soft">On commence par 30 minutes</span></div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
