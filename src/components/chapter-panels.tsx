import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { aboutStack, contacts, type Dictionary } from "@/content/portfolio";

const contactIcons = { GitHub: FiGithub, LinkedIn: FiLinkedin, Email: FiMail };

export default function ChapterPanels({ copy }: { copy: Dictionary }) {
  return (
    <>
      <section id="about" data-panel className="shot about-shot" aria-labelledby="about-heading">
        <header className="about-header">
          <p className="eyebrow">{copy.labels.about}</p>
          <h2 id="about-heading" tabIndex={-1}>{copy.headline}</h2>
          <p className="about-stack">{aboutStack}</p>
          <p className="about-sector">{copy.aboutSector}</p>
        </header>
        <div className="about-copy">
          {copy.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>
      <section id="experience" data-panel className="shot experience-shot" aria-labelledby="experience-heading">
        <p className="eyebrow">{copy.labels.experience} · 2023–2026</p>
        <h2 id="experience-heading" tabIndex={-1}>Santander Tecnología Argentina</h2>
        <div className="experience-list">
          {copy.experience.map(({ period, highlights }) => (
            <article className="experience-role" key={period}>
              <div className="role-heading">
                <h3>Software Engineer</h3>
                <p>{period}</p>
              </div>
              <ul role="list">
                {highlights.map(({ title, body }) => (
                  <li key={title}><strong>{title}</strong><p>{body}</p></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section id="contact" data-panel className="shot end-shot" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="contact-intro" tabIndex={-1}>{copy.contactIntro}</h2>
        <div className="credits">
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
      </section>
    </>
  );
}
