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
  "Phase 13: Model manager planning and runtime handshake completed",
  "Phase 14: Consumer workflow rebuild completed",
  "Phase 15: AI builder workspace polish completed",
  "Phase 16: UI quality pass completed",
  "Phase 17: Provider/plugin setup and self-hosting foundation completed",
  "Phase 18: AI-native workspace UX rebuild completed",
  "Phase 19: Cinematic generation workspace experience completed",
  "Phase 20: Cinematic scene editor foundation completed",
  "Phase 21: Premium AI workspace redesign completed",
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
