export function PageIntro({ eyebrow, title, description }) {
  return (
    <header className="page-intro page-shell reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="type-heading">{title}</h1>
      {description ? <p className="page-intro__description type-copy">{description}</p> : null}
    </header>
  );
}
