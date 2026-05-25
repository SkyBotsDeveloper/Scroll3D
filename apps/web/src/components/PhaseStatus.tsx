const phaseItems = [
  "Phase 1: Core schema completed",
  "Phase 2: Providers, agents, runtime foundations completed",
  "Phase 3: Provider registry and queued pipeline completed",
  "Phase 4: Provider selection and persistent checkpoints completed",
  "Phase 5: Scroll-frame engine completed",
  "Phase 6: Static exporter completed",
  "Phase 7: Disk and ZIP export completed",
  "Phase 8: Web export preview and download UI completed",
  "Phase 9: Visual editor controls completed",
  "Phase 10: Settings, runtime planning, and mock prompt workflow completed",
  "Phase 11: Premium dashboard UI/UX polish completed",
  "Phase 12: Provider connection and local runtime discovery completed",
  "Phase 13: Model manager planning and runtime handshake completed/in progress",
  "Creator: Siddhartha Abhimanyu",
  "Telegram: @iflexelite",
  "Instagram: elite.sid"
];

export function PhaseStatus() {
  return (
    <section className="panel" aria-labelledby="status-title">
      <h2 id="status-title">Current Status</h2>
      <ul>
        {phaseItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
