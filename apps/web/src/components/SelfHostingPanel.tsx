import type { StaticExportBundle } from "@scroll3d/exporter/browser";

interface SelfHostingPanelProps {
  bundle: StaticExportBundle | undefined;
  exportReady: boolean;
  onDownloadZip: () => void;
}

const deploymentTargets = [
  {
    name: "Vercel",
    fit: "Fast static previews and team handoff",
    steps: ["Download ZIP", "Extract files", "Import or upload the static folder"]
  },
  {
    name: "Netlify",
    fit: "Drag-and-drop static deployment",
    steps: ["Download ZIP", "Extract files", "Drop the folder into Netlify"]
  },
  {
    name: "Cloudflare Pages",
    fit: "Global static hosting with strong cache behavior",
    steps: ["Download ZIP", "Extract files", "Upload through Pages or connect a repo"]
  },
  {
    name: "GitHub Pages",
    fit: "Open-source project demos",
    steps: ["Download ZIP", "Extract files", "Publish the static files from a branch"]
  },
  {
    name: "Self-hosted nginx",
    fit: "Full control on your own server",
    steps: ["Download ZIP", "Extract files", "Serve the folder as static files"]
  }
];

const expectedFiles = [
  "index.html",
  "styles.css",
  "scroll-engine.js",
  "project.json",
  "frame-manifest.json",
  "assets/manifest.json",
  "README.md"
];

export function SelfHostingPanel({
  bundle,
  exportReady,
  onDownloadZip
}: SelfHostingPanelProps) {
  const paths = new Set(bundle?.files.map((file) => file.path) ?? []);

  return (
    <section className="selfHostingPanel" aria-labelledby="self-hosting-title">
      <div className="sectionHeader splitHeader">
        <div>
          <p className="eyebrow">Self-hosting</p>
          <h3 id="self-hosting-title">Export once, host anywhere</h3>
          <p className="statusText">
            Scroll3D exports a portable static website. No backend, runtime server, or
            hosted Scroll3D service is required for the generated site.
          </p>
        </div>
        <button
          type="button"
          className="primaryButton"
          disabled={!exportReady}
          onClick={onDownloadZip}
        >
          Download ZIP
        </button>
      </div>

      <div className="exportPortabilityGrid">
        {expectedFiles.map((path) => (
          <div key={path} className="runtimeStatusCard">
            <span>{path}</span>
            <strong>{paths.has(path) ? "included" : "planned"}</strong>
            <small>Static export file</small>
          </div>
        ))}
      </div>

      <div className="deploymentTargetGrid">
        {deploymentTargets.map((target) => (
          <article key={target.name} className="deploymentTargetCard">
            <div>
              <strong>{target.name}</strong>
              <span>{target.fit}</span>
            </div>
            <ol>
              {target.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      <div className="secretRefHelp">
        <div>
          <p className="eyebrow">Portable by design</p>
          <h4>No secrets in generated websites</h4>
          <p>
            Provider configs, secret references, local runtime plans, and model download
            plans stay outside exported sites. The ZIP contains static files that can be
            hosted independently.
          </p>
        </div>
      </div>
    </section>
  );
}
