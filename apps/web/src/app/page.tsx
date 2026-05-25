const phaseItems = [
  "Phase 1: Core schema completed",
  "Phase 2: Providers, agents, runtime foundations completed",
  "Phase 3: Provider registry and queued pipeline completed",
  "Phase 4: Provider selection, real adapter scaffolds, and persistent checkpoints",
  "Creator: Siddhartha Abhimanyu",
  "Telegram: @iflexelite",
  "Instagram: elite.sid"
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Phase 4</p>
        <h1 id="home-title">Scroll3D</h1>
        <p className="subtitle">Open-source AI 3D website builder</p>
        <div className="status" aria-label="Current Phase 4 status">
          <span className="statusDot" aria-hidden="true" />
          Provider selection and persistent checkpoints foundation
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
