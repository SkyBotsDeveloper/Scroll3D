const phaseItems = [
  "Monorepo foundation",
  "Core project schemas",
  "Validation helpers",
  "Sample project fixture",
  "Next.js placeholder app"
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Phase 1</p>
        <h1 id="home-title">Scroll3D</h1>
        <p className="subtitle">Open-source AI 3D website builder</p>
        <div className="status" aria-label="Current Phase 1 status">
          <span className="statusDot" aria-hidden="true" />
          Phase 1 foundation in progress
        </div>
      </section>

      <section className="panel" aria-labelledby="status-title">
        <h2 id="status-title">Current Status</h2>
        <ul>
          {phaseItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
