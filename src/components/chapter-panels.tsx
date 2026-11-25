import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { aboutStack, contacts, type Dictionary } from "@/content/portfolio";

const contactIcons = { GitHub: FiGithub, LinkedIn: FiLinkedin, Email: FiMail };

function AboutCopy({ copy }: { copy: Dictionary }) {
  return <div className="about-copy">{copy.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>;
}

export function AboutDetails({ copy }: { copy: Dictionary }) {
  return (
    <>
      <div className="about-context">
        <p className="about-stack">{aboutStack}</p>
        <p className="about-sector">{copy.aboutSector}</p>
      </div>
      <AboutCopy copy={copy} />
    </>
  );
}

export function ContactLinks({ variant = "reading" }: { variant?: "reading" | "booth" }) {
  return (
    <div className="credits" data-variant={variant}>
      {contacts.map(({ label, detail, href }) => {
        const Icon = contactIcons[label];
        return (
          <a key={href} href={href}>
            <span className="contact-icon" aria-hidden="true"><Icon /></span>
            <span className="contact-label"><strong>{label}</strong><span className="contact-detail">{detail}</span></span>
            <FiArrowUpRight className="contact-arrow" aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}

export function ExperienceDetails({ copy, inDialog = false }: { copy: Dictionary; inDialog?: boolean }) {
  return (
    <>
      {!inDialog && <p className="eyebrow">{copy.labels.experience} · 2023–2026</p>}
      <h2 id={inDialog ? undefined : "experience/details"} tabIndex={inDialog ? undefined : -1}>
        Santander Tecnología Argentina
      </h2>
      <div className="experience-list">
        {copy.experience.map(({ period, highlights }, periodIndex) => (
          <article className="experience-role" key={period}>
            <div className="role-heading">
              <h3>Software Engineer</h3>
              <p>{period}</p>
            </div>
            <ul role="list">
              {highlights.map(({ title, body }, index) => {
                const anchor = `experience/${periodIndex}-${index}`;
                return (
                  <li id={inDialog ? undefined : anchor} data-panel-anchor={inDialog ? anchor : undefined} key={title} tabIndex={-1}>
                    <strong>{title}</strong><p>{body}</p>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}

export default function ChapterPanels({ copy }: { copy: Dictionary }) {
  return (
    <>
      <section id="about" className="reading-section about-shot" aria-labelledby="about/details">
        <h2 id="about/details" tabIndex={-1}>{copy.labels.about}</h2>
        <AboutCopy copy={copy} />
      </section>

      <section id="experience" className="reading-section experience-shot" aria-labelledby="experience/details">
        <ExperienceDetails copy={copy} />
      </section>

      <section id="contact" className="reading-section end-shot" aria-labelledby="contact/details">
        <h2 id="contact/details" className="contact-intro" tabIndex={-1}>{copy.contactIntro}</h2>
        <ContactLinks />
      </section>
    </>
  );
}
