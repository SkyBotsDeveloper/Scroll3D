import type { ExportResult, StaticExportBundle } from "@scroll3d/exporter/browser";
import type { Scroll3DProject } from "@scroll3d/core";
import { SceneEditorPanel } from "./SceneEditorPanel";
import { SimpleEditPanel } from "./SimpleEditPanel";
import { SimpleExportPanel } from "./SimpleExportPanel";

export type InspectorPanel = "scene" | "edit" | "export";

interface RightInspectorProps {
  project: Scroll3DProject;
  hasGenerated: boolean;
  activePanel: InspectorPanel;
  selectedSceneId: string;
  exportResult: ExportResult;
  bundle: StaticExportBundle | undefined;
  status: string;
  onPanelChange: (panel: InspectorPanel) => void;
  onSelectScene: (sceneId: string) => void;
  onProjectChange: (project: Scroll3DProject) => void;
  onPreview: () => void;
  onDownloadZip: () => void;
  onViewFiles: () => void;
}

export function RightInspector({
  project,
  hasGenerated,
  activePanel,
  selectedSceneId,
  exportResult,
  bundle,
  status,
  onPanelChange,
  onSelectScene,
  onProjectChange,
  onPreview,
  onDownloadZip,
  onViewFiles
}: RightInspectorProps) {
  return (
    <aside className="rightInspector" aria-labelledby="inspector-title">
      <div className="inspectorHeader">
        <div>
          <p className="eyebrow">Director</p>
          <h2 id="inspector-title">Scene controls</h2>
        </div>
        <div
          className="inspectorTabs threeTabs"
          role="tablist"
          aria-label="Inspector tools"
        >
          <button
            type="button"
            className={activePanel === "scene" ? "tabButton active" : "tabButton"}
            onClick={() => {
              onPanelChange("scene");
            }}
          >
            Scene
          </button>
          <button
            type="button"
            className={activePanel === "edit" ? "tabButton active" : "tabButton"}
            onClick={() => {
              onPanelChange("edit");
            }}
          >
            Style
          </button>
          <button
            type="button"
            className={activePanel === "export" ? "tabButton active" : "tabButton"}
            onClick={() => {
              onPanelChange("export");
            }}
          >
            Export
          </button>
        </div>
      </div>

      {!hasGenerated ? (
        <div className="inspectorEmptyState">
          <strong>Generate a website to start editing.</strong>
          <span>
            The edit and export controls become active after Scroll3D creates a website
            draft.
          </span>
        </div>
      ) : activePanel === "edit" ? (
        <SimpleEditPanel
          project={project}
          onChange={onProjectChange}
          onPreview={onPreview}
        />
      ) : activePanel === "scene" ? (
        <SceneEditorPanel
          project={project}
          selectedSceneId={selectedSceneId}
          onSelectScene={onSelectScene}
          onChange={onProjectChange}
          onPreview={onPreview}
        />
      ) : (
        <SimpleExportPanel
          exportResult={exportResult}
          bundle={bundle}
          status={status}
          onDownloadZip={onDownloadZip}
          onViewFiles={onViewFiles}
        />
      )}
    </aside>
  );
}
