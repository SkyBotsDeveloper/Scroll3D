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
}

const examples = [
  "Create a cinematic SaaS landing page for an AI analytics tool",
  "Build a luxury real estate website with 3D scroll sections",
  "Make a futuristic portfolio with glowing motion scenes"
];

export function PromptHero({
  prompt,
  result,
  onPromptChange,
  onGenerate,
  onEdit,
  onPreview
}: PromptHeroProps) {
  const complete = result?.status === "completed";

  return (
    <section className="consumerHero" aria-labelledby="consumer-hero-title">
      <div className="consumerHeroCopy">
        <div className="inlineCluster">
          <StatusBadge tone="warning">Developer preview: mock generation</StatusBadge>
          <span className="miniBadge">Local/API/Hybrid in Advanced</span>
        </div>
        <h1 id="consumer-hero-title">Generate cinematic 3D websites from a prompt.</h1>
        <p className="subtitle">
          Type the website you want, preview the generated site, edit the copy and
          theme, then export clean static HTML, CSS, and JavaScript.
        </p>
      </div>

      <div className="promptComposer">
        <label className="field">
          <span>What should Scroll3D create?</span>
          <textarea
            className="compactTextarea promptTextarea"
            value={prompt}
            onChange={(event) => {
              onPromptChange(event.target.value);
            }}
            placeholder="Describe a cinematic website..."
          />
        </label>

        <div className="consumerActionRow">
          <button
            type="button"
            className="primaryButton primaryCta"
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
          Export clean static HTML/CSS/JS. Local/API/Hybrid modes live in Advanced.
        </p>
      </div>

      <div className="consumerGenerationCard">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Generation</p>
            <h2>{complete ? "Website ready" : "Ready when you are"}</h2>
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
          </div>
        ) : null}
      </div>
    </section>
  );
}
