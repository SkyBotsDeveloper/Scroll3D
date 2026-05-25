import type { PlaybackMode, Scroll3DProject } from "@scroll3d/core";
import {
  updatePlaybackMode,
  updateReducedMotionFallbackAlt,
  updateSceneName,
  updateScrollLength
} from "../lib/project-updates";

interface ScrollSceneEditorProps {
  project: Scroll3DProject;
  onChange: (project: Scroll3DProject) => void;
}

const playbackModes: PlaybackMode[] = ["scroll", "scrub", "hybrid"];

export function ScrollSceneEditor({ project, onChange }: ScrollSceneEditorProps) {
  const fallback = project.scene.reducedMotionFallback;

  return (
    <section className="editorSection" aria-labelledby="scene-editor-title">
      <div className="sectionHeader">
        <p className="eyebrow">Scroll scene</p>
        <h3 id="scene-editor-title">Playback and frame sets</h3>
      </div>

      <div className="twoColumnFields">
        <label className="field">
          <span>Scene name</span>
          <input
            value={project.scene.name}
            onChange={(event) => {
              onChange(updateSceneName(project, event.target.value));
            }}
          />
        </label>

        <label className="field">
          <span>Playback mode</span>
          <select
            value={project.scene.playbackMode}
            onChange={(event) => {
              onChange(updatePlaybackMode(project, event.target.value as PlaybackMode));
            }}
          >
            {playbackModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Scroll length</span>
        <input
          type="number"
          min={1}
          value={project.scene.scrollLength}
          onChange={(event) => {
            onChange(updateScrollLength(project, Number(event.target.value)));
          }}
        />
      </label>

      <div className="frameSetList" aria-label="Frame sets">
        {project.scene.frameSets.map((frameSet) => (
          <div key={frameSet.id} className="frameSetItem">
            <strong>{frameSet.target}</strong>
            <span>
              {String(frameSet.frameCount)} frames, {String(frameSet.width)} x{" "}
              {String(frameSet.height)}, {frameSet.format}
            </span>
            <small>{frameSet.basePath}</small>
          </div>
        ))}
      </div>

      <div className="readonlyGrid">
        <div>
          <span>Fallback type</span>
          <strong>{fallback.type}</strong>
        </div>
        {fallback.type !== "none" ? (
          <>
            <div>
              <span>Fallback source</span>
              <strong>{fallback.src}</strong>
            </div>
            <label className="field">
              <span>Fallback alt</span>
              <input
                value={fallback.alt ?? ""}
                onChange={(event) => {
                  onChange(updateReducedMotionFallbackAlt(project, event.target.value));
                }}
              />
            </label>
          </>
        ) : null}
      </div>
    </section>
  );
}
