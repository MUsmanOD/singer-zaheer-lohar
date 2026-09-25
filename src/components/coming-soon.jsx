export function ComingSoon({ id, level = "h2" }) {
  const Heading = level;

  return (
    <section id={id} className="coming-soon" aria-label="Coming soon">
      <Heading className="type-heading">Coming soon</Heading>
    </section>
  );
}
