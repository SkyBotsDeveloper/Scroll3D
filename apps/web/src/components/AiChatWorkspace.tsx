import type { Scroll3DProject } from "@scroll3d/core";
import type { StaticExportBundle } from "@scroll3d/exporter/browser";
import {
  cinematicGenerationPhases,
  type CinematicGenerationPhase
} from "../lib/cinematic-generation";
import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import {
  getMotionPreset,
  getNarrativeRole,
  getProjectScenes
} from "../lib/scene-metadata";
import type { InspectorPanel } from "./RightInspector";

interface AiChatWorkspaceProps {
  project: Scroll3DProject;
  prompt: string;
  modeLabel: string;
  result: MockPipelineResult | null;
  activePhase: CinematicGenerationPhase;
  activePhaseIndex: number;
  isGenerating: boolean;
  hasGenerated: boolean;
  selectedSceneId: string;
  status: string;
  bundle: StaticExportBundle | undefined;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  onNewProject: () => void;
  onOpenTools: (panel: InspectorPanel) => void;
  onOpenSettings: () => void;
  onSelectScene: (sceneId: string) => void;
  onDownloadZip: () => void;
}

const examplePrompts = [
  "Create a cinematic SaaS landing page for an AI analytics platform",
  "Build a luxury real estate website with 3D scroll scenes",
  "Make a futuristic portfolio with glowing motion sections"
];

const refinementPrompts = [
  "Make the hero more premium",
  "Shorten the pricing section",
  "Add a stronger final CTA"
];

export function AiChatWorkspace({
  project,
  prompt,
  modeLabel,
  result,
  activePhase,
  activePhaseIndex,
  isGenerating,
  hasGenerated,
  selectedSceneId,
  status,
  bundle,
  onPromptChange,
  onGenerate,
  onNewProject,
  onOpenTools,
  onOpenSettings,
  onSelectScene,
  onDownloadZip
}: AiChatWorkspaceProps) {
  const scenes = getProjectScenes(project);
  const canGenerate = prompt.trim().length > 0 && !isGenerating;

  return (
    <section className="aiChatWorkspace" aria-label="AI chat workspace">
      <header className="aiChatHeader">
        <div>
          <span className="modeLine">{modeLabel}</span>
          <h1>Tell Scroll3D what to build.</h1>
        </div>
        <button type="button" className="quietIconButton" onClick={onOpenSettings}>
          Advanced
        </button>
      </header>

      <div className="chatMessages" aria-live="polite">
        <article className="chatMessage assistantMessage">
          <span className="chatAvatar">S3D</span>
          <div className="chatBubble">
            <p>
              Describe the cinematic website you want. I will create a mock website
              draft, keep the preview on the right, and leave advanced setup hidden
              until you need it.
            </p>
            {!hasGenerated && !isGenerating ? (
              <div className="chatChipRow" aria-label="Example prompts">
                {examplePrompts.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="chatSuggestionChip"
                    onClick={() => {
                      onPromptChange(example);
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </article>

        {prompt.trim() ? (
          <article className="chatMessage userMessage">
            <div className="chatBubble">
              <p>{prompt}</p>
            </div>
          </article>
        ) : null}

        {(isGenerating || result) && (
          <article className="chatMessage assistantMessage">
            <span className="chatAvatar">AI</span>
            <div className="chatBubble">
              <div className="generationMessageHeader">
                <strong>
                  {isGenerating ? activePhase.title : "Website draft ready"}
                </strong>
                <span>{isGenerating ? activePhase.previewLabel : "Mock preview"}</span>
              </div>
              <div className="chatProgressList">
                {cinematicGenerationPhases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className={[
                      "chatProgressStep",
                      index < activePhaseIndex || (!isGenerating && result)
                        ? "done"
                        : "",
                      index === activePhaseIndex && isGenerating ? "active" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span />
                    <p>{phase.shortLabel}</p>
                  </div>
                ))}
              </div>
              <p className="chatSmallText">{status}</p>
            </div>
          </article>
        )}

        {hasGenerated ? (
          <article className="chatMessage assistantMessage">
            <span className="chatAvatar">S3D</span>
            <div className="chatBubble">
              <div className="generationMessageHeader">
                <strong>{project.name}</strong>
                <span>{String(bundle?.files.length ?? 0)} export files ready</span>
              </div>
              <p>
                The draft is ready. Use the preview on the right, refine scenes from
                chat, or open focused edit/export tools only when needed.
              </p>
              <div className="chatActionGrid">
                <button
                  type="button"
                  className="primaryButton"
                  onClick={() => {
                    onOpenTools("scene");
                  }}
                >
                  Edit scenes
                </button>
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => {
                    onOpenTools("edit");
                  }}
                >
                  Theme & text
                </button>
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={onDownloadZip}
                >
                  Download ZIP
                </button>
              </div>
            </div>
          </article>
        ) : null}

        {hasGenerated ? (
          <article className="chatMessage assistantMessage compactMessage">
            <span className="chatAvatar">SC</span>
            <div className="chatBubble">
              <div className="generationMessageHeader">
                <strong>Scene requests</strong>
                <span>{String(scenes.length)} scenes</span>
              </div>
              <div className="sceneRequestList">
                {scenes.map((scene) => {
                  const role = getNarrativeRole(scene.metadata.narrativeRole);
                  const motion = getMotionPreset(scene.metadata.motionPreset);

                  return (
                    <button
                      key={scene.id}
                      type="button"
                      className={
                        scene.id === selectedSceneId
                          ? "sceneRequestChip active"
                          : "sceneRequestChip"
                      }
                      onClick={() => {
                        onSelectScene(scene.id);
                        onOpenTools("scene");
                      }}
                    >
                      <strong>{scene.metadata.title}</strong>
                      <span>
                        {role?.label ?? scene.metadata.narrativeRole} ·{" "}
                        {motion?.label ?? scene.metadata.motionPreset}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </article>
        ) : null}
      </div>

      <form
        className="chatComposer"
        onSubmit={(event) => {
          event.preventDefault();
          if (canGenerate) {
            onGenerate();
          }
        }}
      >
        <div className="composerToolbar">
          <button
            type="button"
            className="composerToolButton"
            onClick={() => {
              onPromptChange(
                `${prompt}\n\nUse a strong cinematic opening hook.`.trim()
              );
            }}
          >
            + Direction
          </button>
          <button type="button" className="composerToolButton" onClick={onNewProject}>
            New draft
          </button>
        </div>
        <label className="srOnly" htmlFor="ai-chat-prompt">
          Describe the cinematic website you want
        </label>
        <textarea
          id="ai-chat-prompt"
          className="chatPromptInput"
          value={prompt}
          onChange={(event) => {
            onPromptChange(event.target.value);
          }}
          placeholder="Describe the 3D website you want to build..."
          rows={4}
        />
        <div className="composerFooter">
          <div className="chatChipRow" aria-label="Refinement suggestions">
            {refinementPrompts.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="chatSuggestionChip subtle"
                onClick={() => {
                  onPromptChange(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <button type="submit" className="primaryButton" disabled={!canGenerate}>
            {isGenerating
              ? "Generating..."
              : hasGenerated
                ? "Refine draft"
                : "Generate website"}
          </button>
        </div>
      </form>
    </section>
  );
}
