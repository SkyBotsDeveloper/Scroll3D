import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import { PipelineProgressSimple } from "./PipelineProgressSimple";
import { StatusBadge } from "./StatusBadge";

interface LandingPromptSurfaceProps {
  prompt: string;
  result: MockPipelineResult | null;
  modeLabel: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  onOpenSettings: () => void;
}

const examples = [
  "Create a cinematic SaaS landing page for an AI analytics platform",
  "Build a luxury real estate website with 3D scroll scenes",
  "Make a futuristic portfolio with glowing motion sections"
];

const quickTypes = [
  "SaaS",
  "Portfolio",
  "Real estate",
  "Product launch",
  "Agency",
  "Luxury brand"
];

export function LandingPromptSurface({
  prompt,
  result,
  modeLabel,
  onPromptChange,
  onGenerate,
  onOpenSettings
}: LandingPromptSurfaceProps) {
  return (
    <section className="cinematicLanding" aria-labelledby="landing-title">
      <header className="landingHeader">
        <div className="brandLockup">
          <span className="logoMark">S3D</span>
          <div>
            <strong>Scroll3D</strong>
            <span>AI workspace for cinematic websites</span>
          </div>
        </div>
        <button type="button" className="secondaryButton" onClick={onOpenSettings}>
          Settings
        </button>
      </header>

      <div className="landingPromptShell">
        <div className="landingCopy">
          <div className="inlineCluster">
            <StatusBadge tone="warning">Developer preview</StatusBadge>
            <span className="miniBadge">{modeLabel} / mock generation</span>
          </div>
          <h1 id="landing-title">Create a cinematic 3D website from one prompt.</h1>
          <p className="subtitle">
            Describe the site you want. Scroll3D will prepare a website draft, preview,
            edit controls, and static ZIP export.
          </p>
        </div>

        <div className="landingComposer">
          <label className="field promptField">
            <span>Prompt</span>
            <textarea
              className="compactTextarea landingPromptTextarea"
              value={prompt}
              onChange={(event) => {
                onPromptChange(event.target.value);
              }}
              placeholder="Describe the 3D website you want to build..."
            />
          </label>

          <div className="landingComposerActions">
            <button
              type="button"
              className="primaryButton landingGenerateButton"
              disabled={!prompt.trim()}
              onClick={onGenerate}
            >
              Generate website
            </button>
            <button
              type="button"
              className="secondaryButton"
              onClick={() => {
                onPromptChange(examples[0] ?? "");
              }}
            >
              Try example
            </button>
          </div>
        </div>

        <div className="quickTypeList" aria-label="Quick website types">
          {quickTypes.map((type) => (
            <button
              key={type}
              type="button"
              className="quickTypeChip"
              onClick={() => {
                onPromptChange(`Create a cinematic ${type.toLowerCase()} website`);
              }}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="landingExampleGrid" aria-label="Example prompts">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              className="examplePromptCard"
              onClick={() => {
                onPromptChange(example);
              }}
            >
              {example}
            </button>
          ))}
        </div>

        {result ? (
          <div className="landingProgressCard">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Generation</p>
                <h2>Preparing your workspace</h2>
              </div>
              <StatusBadge tone={result.status === "completed" ? "ok" : "warning"}>
                {result.status}
              </StatusBadge>
            </div>
            <PipelineProgressSimple result={result} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
