const phaseItems = [
  "Phase 1: Core schema completed",
  "Phase 2: Providers, agents, runtime foundations completed",
  "Phase 3: Provider registry and queued pipeline completed",
  "Phase 4: Provider selection and persistent checkpoints completed",
  "Phase 5: Scroll-frame engine completed",
  "Creator: Siddhartha Abhimanyu",
  "Telegram: @iflexelite",
  "Instagram: elite.sid"
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Phase 5</p>
        <h1 id="home-title">Scroll3D</h1>
        <p className="subtitle">Open-source AI 3D website builder</p>
        <div className="status" aria-label="Current Phase 5 status">
          <span className="statusDot" aria-hidden="true" />
          Scroll-frame canvas playback foundation
        </div>
      </section>

      <section className="flow" aria-label="Scroll engine flow">
        <span>Scroll progress</span>
        <span aria-hidden="true">-&gt;</span>
        <span>Frame index</span>
        <span aria-hidden="true">-&gt;</span>
        <span>Canvas render</span>
        <span aria-hidden="true">-&gt;</span>
        <span>Cinematic 3D feel</span>
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
