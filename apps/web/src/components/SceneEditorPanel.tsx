import { useMemo, useState } from "react";
import type { Scroll3DProject } from "@scroll3d/core";
import {
  getMotionPreset,
  getNarrativeRole,
  getProjectScenes,
  getSceneById,
  getSceneProgressLabel,
  getTransitionStyle,
  motionPresets,
  moveSceneToIndex,
  narrativeRoles,
  transitionStyles,
  updateSceneMetadata,
  type NarrativeRoleId,
  type SceneIntensity,
  type ScenePacing,
  type TransitionStyleId
} from "../lib/scene-metadata";

interface SceneEditorPanelProps {
  project: Scroll3DProject;
  selectedSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onChange: (project: Scroll3DProject) => void;
  onPreview: () => void;
}

const sceneTypes = ["hero", "feature", "pricing", "faq", "cta", "detail"];
const intensityOptions: SceneIntensity[] = ["quiet", "balanced", "high"];
const pacingOptions: ScenePacing[] = ["slow", "measured", "fast"];

export function SceneEditorPanel({
  project,
  selectedSceneId,
  onSelectScene,
  onChange,
  onPreview
}: SceneEditorPanelProps) {
  const scenes = useMemo(() => getProjectScenes(project), [project]);
  const selectedScene =
    getSceneById(project, selectedSceneId) ?? scenes[0] ?? undefined;
  const [dragSceneId, setDragSceneId] = useState("");

  if (!selectedScene) {
    return (
      <section className="sceneEditorPanel" aria-labelledby="scene-editor-title">
        <div className="inspectorEmptyState">
          <strong>No scenes found.</strong>
          <span>Generate or restore a project to begin directing scene flow.</span>
        </div>
      </section>
    );
  }

  const activeScene = selectedScene;
  const selectedMotion = getMotionPreset(activeScene.metadata.motionPreset);
  const selectedTransition = getTransitionStyle(activeScene.metadata.transitionStyle);
  const selectedRole = getNarrativeRole(activeScene.metadata.narrativeRole);

  function updateSelectedScene(patch: Parameters<typeof updateSceneMetadata>[2]) {
    onChange(updateSceneMetadata(project, activeScene.id, patch));
  }

  function moveSelectedScene(targetIndex: number) {
    const nextProject = moveSceneToIndex(project, activeScene.id, targetIndex);
    onChange(nextProject);
    onSelectScene(activeScene.id);
  }

  return (
    <section className="sceneEditorPanel" aria-labelledby="scene-editor-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Scene director</p>
          <h2 id="scene-editor-title">Sequence the story</h2>
          <p className="statusText">
            Reorder scenes, choose motion language, and guide the cinematic rhythm.
          </p>
        </div>
        <span className="inlineStat">
          Scene {getSceneProgressLabel(selectedScene, scenes.length)}
        </span>
      </div>

      <section className="sceneFocusCard" aria-label="Selected scene summary">
        <span className="sceneFocusThumbnail" aria-hidden="true" />
        <div>
          <div className="badgeRow">
            <span className="miniBadge">{selectedScene.metadata.sceneType}</span>
            <span
              className={selectedScene.visible ? "miniBadge ok" : "miniBadge muted"}
            >
              {selectedScene.visible ? "visible" : "hidden"}
            </span>
          </div>
          <strong>{selectedScene.metadata.title}</strong>
          <p>{selectedRole?.guidance}</p>
        </div>
      </section>

      <section className="sceneSequenceBoard" aria-labelledby="scene-sequence-title">
        <div className="sectionHeader">
          <h3 id="scene-sequence-title">Timeline order</h3>
          <p className="statusText">Drag scenes or use arrows to reshape the arc.</p>
        </div>
        <div className="sceneReorderList">
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              draggable
              className={[
                "sceneReorderCard",
                scene.id === selectedScene.id ? "active" : "",
                scene.id === dragSceneId ? "dragging" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                onSelectScene(scene.id);
              }}
              onDragStart={(event) => {
                setDragSceneId(scene.id);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", scene.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceId =
                  event.dataTransfer.getData("text/plain") || dragSceneId;

                if (sourceId) {
                  onChange(moveSceneToIndex(project, sourceId, index));
                  onSelectScene(sourceId);
                }

                setDragSceneId("");
              }}
              onDragEnd={() => {
                setDragSceneId("");
              }}
            >
              <span className="dragHandle" aria-hidden="true">
                ::
              </span>
              <span className="sceneOrderNumber">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <strong>{scene.metadata.title}</strong>
                <small>{getMotionPreset(scene.metadata.motionPreset)?.label}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="buttonRow compactActionRow">
          <button
            type="button"
            className="secondaryButton"
            disabled={selectedScene.order === 0}
            onClick={() => {
              moveSelectedScene(selectedScene.order - 1);
            }}
          >
            Move up
          </button>
          <button
            type="button"
            className="secondaryButton"
            disabled={selectedScene.order >= scenes.length - 1}
            onClick={() => {
              moveSelectedScene(selectedScene.order + 1);
            }}
          >
            Move down
          </button>
        </div>
      </section>

      <section className="sceneFormGrid" aria-label="Scene metadata controls">
        <label className="field highlightedField">
          <span>Scene title</span>
          <input
            value={selectedScene.metadata.title}
            onChange={(event) => {
              updateSelectedScene({ title: event.target.value });
            }}
          />
        </label>

        <label className="field">
          <span>Scene type</span>
          <select
            value={selectedScene.metadata.sceneType}
            onChange={(event) => {
              updateSelectedScene({ sceneType: event.target.value });
            }}
          >
            {sceneTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
            {!sceneTypes.includes(selectedScene.metadata.sceneType) ? (
              <option value={selectedScene.metadata.sceneType}>
                {selectedScene.metadata.sceneType}
              </option>
            ) : null}
          </select>
        </label>

        <label className="field">
          <span>Narrative role</span>
          <select
            value={selectedScene.metadata.narrativeRole}
            onChange={(event) => {
              updateSelectedScene({
                narrativeRole: event.target.value as NarrativeRoleId
              });
            }}
          >
            {narrativeRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Transition</span>
          <select
            value={selectedScene.metadata.transitionStyle}
            onChange={(event) => {
              updateSelectedScene({
                transitionStyle: event.target.value as TransitionStyleId
              });
            }}
          >
            {transitionStyles.map((transition) => (
              <option key={transition.id} value={transition.id}>
                {transition.label}
              </option>
            ))}
          </select>
        </label>

        <div className="motionPresetGrid" aria-label="Motion presets">
          {motionPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={
                preset.id === selectedScene.metadata.motionPreset
                  ? "motionPresetButton active"
                  : "motionPresetButton"
              }
              onClick={() => {
                updateSelectedScene({ motionPreset: preset.id });
              }}
            >
              <strong>{preset.label}</strong>
              <span>{preset.description}</span>
            </button>
          ))}
        </div>

        <div className="twoColumnFields">
          <label className="field">
            <span>Intensity</span>
            <select
              value={selectedScene.metadata.intensity}
              onChange={(event) => {
                updateSelectedScene({
                  intensity: event.target.value as SceneIntensity
                });
              }}
            >
              {intensityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Pacing</span>
            <select
              value={selectedScene.metadata.pacing}
              onChange={(event) => {
                updateSelectedScene({ pacing: event.target.value as ScenePacing });
              }}
            >
              {pacingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Timing beats</span>
          <input
            type="number"
            min={1}
            value={selectedScene.metadata.durationBeats}
            onChange={(event) => {
              updateSelectedScene({ durationBeats: Number(event.target.value) });
            }}
          />
        </label>

        <label className="field">
          <span>Asset placeholder</span>
          <input
            value={selectedScene.metadata.assetPlaceholder}
            onChange={(event) => {
              updateSelectedScene({ assetPlaceholder: event.target.value });
            }}
          />
        </label>

        <label className="field">
          <span>Director note</span>
          <textarea
            rows={4}
            value={selectedScene.metadata.directorNote}
            onChange={(event) => {
              updateSelectedScene({ directorNote: event.target.value });
            }}
          />
        </label>
      </section>

      <section className="sceneGuidanceCard" aria-label="Scene guidance">
        <div>
          <span className="miniBadge">{selectedMotion?.label}</span>
          <span className="miniBadge">{selectedTransition?.label}</span>
        </div>
        <p>{selectedMotion?.description}</p>
        <p>{selectedTransition?.description}</p>
      </section>

      <button type="button" className="primaryButton primaryCta" onClick={onPreview}>
        Preview scene direction
      </button>
    </section>
  );
}
