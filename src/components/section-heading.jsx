export function SectionHeading({ eyebrow, title, description, id, className = "" }) {
  return (
    <div className={`section-heading reveal ${className}`.trim()}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="type-heading" id={id}>{title}</h2>
      {description ? <p className="section-heading__description type-copy">{description}</p> : null}
    </div>
  );
}
