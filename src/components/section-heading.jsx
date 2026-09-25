export function SectionHeading({ eyebrow, title, description, id }) {
  return (
    <div className="section-heading reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="type-heading" id={id}>{title}</h2>
      {description ? <p className="section-heading__description type-copy">{description}</p> : null}
    </div>
  );
}
