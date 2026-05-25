const phaseItems = [
  "Phase 1: Core schema completed",
  "Phase 2: Providers, agents, runtime foundations completed",
  "Phase 3: Provider registry, BYO API-key foundation, and queued pipeline runner",
  "Creator: Siddhartha Abhimanyu",
  "Telegram: @iflexelite",
  "Instagram: elite.sid"
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Phase 3</p>
        <h1 id="home-title">Scroll3D</h1>
        <p className="subtitle">Open-source AI 3D website builder</p>
        <div className="status" aria-label="Current Phase 3 status">
          <span className="statusDot" aria-hidden="true" />
          Registry-backed queued pipeline foundation
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
