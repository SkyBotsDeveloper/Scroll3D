const phaseItems = [
  "Phase 1: Core schema completed",
  "Phase 2: Providers, agents, and runtime contracts completed",
  "Provider abstraction for local/API/hybrid modes",
  "Sequential local runtime queue foundation",
  "Mock multi-agent pipeline"
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Phase 2</p>
        <h1 id="home-title">Scroll3D</h1>
        <p className="subtitle">Open-source AI 3D website builder</p>
        <div className="status" aria-label="Current Phase 2 status">
          <span className="statusDot" aria-hidden="true" />
          Providers, agents, and runtime contracts completed
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
