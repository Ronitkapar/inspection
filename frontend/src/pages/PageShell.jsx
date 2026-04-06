function PageShell({ eyebrow, title, description }) {
  return (
    <section className="hero-panel">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="hero-copy">{description}</p>
    </section>
  );
}

export default PageShell;
