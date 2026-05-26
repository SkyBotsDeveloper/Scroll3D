import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import { PipelineProgressSimple } from "./PipelineProgressSimple";
import { StatusBadge } from "./StatusBadge";

interface PromptHeroProps {
  prompt: string;
  result: MockPipelineResult | null;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onExport: () => void;
}

const examples = [
  "Create a cinematic SaaS landing page for an AI analytics platform",
  "Build a luxury real estate website with 3D scroll sections",
  "Make a futuristic portfolio with glowing motion scenes",
  "Create a product launch page with cinematic scroll storytelling"
];

const quickTypes = [
  "SaaS",
  "Portfolio",
  "Real estate",
  "Product launch",
  "Agency",
  "Luxury brand"
];

export function PromptHero({
  prompt,
  result,
  onPromptChange,
  onGenerate,
  onEdit,
  onPreview,
  onExport
}: PromptHeroProps) {
  const complete = result?.status === "completed";

  return (
    <section className="consumerHero" aria-labelledby="consumer-hero-title">
      <div className="consumerHeroCopy">
        <div className="inlineCluster">
          <StatusBadge tone="warning">Mock generation</StatusBadge>
          <span className="miniBadge">Developer preview</span>
        </div>
        <h1 id="consumer-hero-title">Generate cinematic 3D websites from a prompt.</h1>
        <p className="subtitle">
          Describe the site, review the draft, make quick edits, and download a ZIP when
          it looks right.
        </p>
      </div>

      <div className="promptComposer">
        <div className="promptInputShell">
          <label className="field promptField">
            <span>What should Scroll3D create?</span>
            <textarea
              className="compactTextarea promptTextarea"
              value={prompt}
              onChange={(event) => {
                onPromptChange(event.target.value);
              }}
              placeholder="Describe the 3D website you want to build..."
            />
          </label>
          <button
            type="button"
            className="primaryButton primaryCta promptGenerateButton"
            onClick={onGenerate}
          >
            Generate website
          </button>
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

        <div className="consumerActionRow compactActionRow">
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

        <div className="examplePromptGrid" aria-label="Example prompts">
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

        <p className="statusText">
          Developer preview uses safe mock generation. Real providers can be configured
          later in Advanced tools.
        </p>
      </div>

      <div className="consumerGenerationCard">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Generation</p>
            <h2>{complete ? "Website draft ready" : "Ready when you are"}</h2>
          </div>
          <StatusBadge tone={complete ? "ok" : "neutral"}>
            {complete ? "Generated" : "Waiting"}
          </StatusBadge>
        </div>
        <PipelineProgressSimple result={result} />
        {complete ? (
          <div className="consumerActionRow">
            <button type="button" className="primaryButton" onClick={onEdit}>
              Edit website
            </button>
            <button type="button" className="secondaryButton" onClick={onPreview}>
              Preview website
            </button>
            <button type="button" className="secondaryButton" onClick={onExport}>
              Export ZIP
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
