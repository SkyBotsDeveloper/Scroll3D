"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Scroll3DProject } from "@scroll3d/core";
import { AdvancedToolsPanel, type AdvancedTab } from "./AdvancedToolsPanel";
import { CodeWorkspace } from "./CodeWorkspace";
import { CompactStatusBar } from "./CompactStatusBar";
import { GlobalSettingsCenter } from "./GlobalSettingsCenter";
import { LandingPromptSurface } from "./LandingPromptSurface";
import { PrimaryPreview } from "./PrimaryPreview";
import { RightInspector, type InspectorPanel } from "./RightInspector";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { WorkspaceViewSwitcher, type WorkspaceView } from "./WorkspaceViewSwitcher";
import { createProjectZipBlob } from "../lib/browser-zip";
import { getDirtyState } from "../lib/editor-state";
import {
  createFilePreview,
  createPreviewSrcDoc,
  exportProjectToBundle,
  getBundleFile,
  getDefaultSelectedFile
} from "../lib/export-client";
import { downloadBlob } from "../lib/download";
import {
  cinematicGenerationPhases,
  getCinematicGenerationPhase,
  type PreviewDevice
} from "../lib/cinematic-generation";
import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import { runMockPromptPipeline } from "../lib/mock-pipeline-client";
import { getFirstSceneId, getSceneById } from "../lib/scene-metadata";
import {
  formatProjectJson,
  sampleProject,
  sampleProjectJson
} from "../lib/sample-project";
import { getVisibleSectionCount } from "../lib/section-utils";
import {
  createPlaceholderSystemScan,
  createBrowserSystemScan
} from "../lib/system-scan-client";
import {
  appendExportHistory,
  clearProjectStorage,
  readExportHistory,
  readStorageValue,
  selectedFileStorageKey,
  projectJsonStorageKey,
  writeStorageValue,
  type ExportHistoryItem
} from "../lib/storage";
import {
  loadSettings,
  saveSettings,
  type Scroll3DSettings
} from "../lib/settings-state";
import type { SystemScanResult } from "../lib/model-recommendations";
import { validateProjectJson, type ProjectValidationResult } from "../lib/validation";

export function DeveloperPreviewApp() {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedTab, setAdvancedTab] = useState<AdvancedTab>("providers");
  const [inspectorPanel, setInspectorPanel] = useState<InspectorPanel>("scene");
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("preview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhaseIndex, setGenerationPhaseIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState(() =>
    getFirstSceneId(sampleProject)
  );
  const [prompt, setPrompt] = useState(
    "Create a cinematic SaaS landing page for an AI analytics tool"
  );
  const [projectJson, setProjectJson] = useState(sampleProjectJson);
  const [appliedProject, setAppliedProject] = useState<Scroll3DProject>(sampleProject);
  const [validation, setValidation] = useState<ProjectValidationResult>(() =>
    validateProjectJson(sampleProjectJson)
  );
  const [selectedPath, setSelectedPath] = useState("");
  const [downloadStatus, setDownloadStatus] = useState(
    "Ready to generate, edit, preview, and export in this browser."
  );
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [settings, setSettings] = useState<Scroll3DSettings>(() => loadSettings());
  const [settingsMessage, setSettingsMessage] = useState(
    "Settings are local to this browser. Use secretRef values, not raw API keys."
  );
  const [systemScan, setSystemScan] = useState<SystemScanResult>(() =>
    createPlaceholderSystemScan()
  );
  const [pipelineResult, setPipelineResult] = useState<MockPipelineResult | null>(null);

  const exportResult = useMemo(
    () => exportProjectToBundle(appliedProject),
    [appliedProject]
  );
  const bundle = exportResult.bundle;
  const dirty = getDirtyState(projectJson, appliedProject);
  const visibleSectionCount = getVisibleSectionCount(appliedProject);
  const displaySelectedPath =
    selectedPath && getBundleFile(bundle, selectedPath)
      ? selectedPath
      : getDefaultSelectedFile(bundle);
  const previewSrcDoc = useMemo(() => createPreviewSrcDoc(bundle), [bundle]);
  const selectedFile = getBundleFile(bundle, displaySelectedPath);
  const filePreview = createFilePreview(selectedFile);
  const hasFinalDraft =
    !isGenerating && (draftReady || pipelineResult?.status === "completed");
  const hasWorkspace =
    isGenerating || draftReady || pipelineResult?.status === "completed";
  const previewFocusMode = previewFullscreen && workspaceView === "preview";
  const generationPhase = getCinematicGenerationPhase(generationPhaseIndex);
  const selectedScene =
    getSceneById(appliedProject, selectedSceneId) ??
    getSceneById(appliedProject, getFirstSceneId(appliedProject));
  const modeLabel =
    settings.mode === "api" ? "API" : settings.mode === "hybrid" ? "Hybrid" : "Local";
  const generationTimers = useRef<number[]>([]);

  function clearGenerationTimers() {
    for (const timer of generationTimers.current) {
      window.clearTimeout(timer);
    }

    generationTimers.current = [];
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const storedJson = readStorageValue(projectJsonStorageKey);

      if (storedJson) {
        const storedValidation = validateProjectJson(storedJson);
        setProjectJson(storedJson);
        setValidation(storedValidation);

        if (storedValidation.ok && storedValidation.project) {
          setAppliedProject(storedValidation.project);
          setDraftReady(storedJson !== sampleProjectJson);
        }
      }

      setSelectedPath(readStorageValue(selectedFileStorageKey) ?? "");
      setHistory(readExportHistory());
      setSettings(loadSettings());
      setSystemScan(createBrowserSystemScan());
    }, 0);

    return () => {
      window.clearTimeout(handle);
    };
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setValidation(validateProjectJson(projectJson));
      writeStorageValue(projectJsonStorageKey, projectJson);
    }, 250);

    return () => {
      window.clearTimeout(handle);
    };
  }, [projectJson]);

  useEffect(() => {
    if (selectedPath) {
      writeStorageValue(selectedFileStorageKey, selectedPath);
    }
  }, [selectedPath]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    return () => {
      clearGenerationTimers();
    };
  }, []);

  function handleValidate() {
    setValidation(validateProjectJson(projectJson));
  }

  function handleApplyJson() {
    const nextValidation = validateProjectJson(projectJson);
    setValidation(nextValidation);

    if (nextValidation.ok && nextValidation.project) {
      setAppliedProject(nextValidation.project);
      setDraftReady(true);
      setDownloadStatus("Valid project applied and preview refreshed.");
    }
  }

  function handleVisualProjectChange(nextProject: Scroll3DProject) {
    const nextJson = formatProjectJson(nextProject);
    const nextValidation = validateProjectJson(nextJson);

    setAppliedProject(nextProject);
    setProjectJson(nextJson);
    setValidation(nextValidation);
    setDraftReady(true);
    setSelectedSceneId((current) =>
      getSceneById(nextProject, current) ? current : getFirstSceneId(nextProject)
    );
    setDownloadStatus("Changes saved. Preview and export are refreshed.");
  }

  function handleGenerate() {
    clearGenerationTimers();
    setIsGenerating(true);
    setDraftReady(false);
    setGenerationPhaseIndex(0);
    setWorkspaceView("preview");
    setInspectorPanel("scene");
    setPreviewFullscreen(false);
    setPipelineResult(null);
    setDownloadStatus(
      cinematicGenerationPhases[0]?.directorNote ?? "Reading the creative brief."
    );

    const result = runMockPromptPipeline(appliedProject, prompt, settings);

    generationTimers.current = cinematicGenerationPhases.map((phase, index) =>
      window.setTimeout(() => {
        setGenerationPhaseIndex(index);
        setDownloadStatus(`${phase.title}: ${phase.directorNote}`);

        if (index === cinematicGenerationPhases.length - 1) {
          setPipelineResult(result);
          setIsGenerating(false);

          if (result.status === "completed" && result.project) {
            applyGeneratedProject(result.project);
            setDraftReady(true);
            setInspectorPanel("scene");
            setSelectedSceneId(getFirstSceneId(result.project));
            setDownloadStatus(
              "Website draft ready. Edit sections or download your ZIP."
            );
          } else {
            setDraftReady(false);
            setDownloadStatus(result.warnings[0] ?? "Generation failed.");
          }
        }
      }, phase.delayMs)
    );
  }

  function applyGeneratedProject(nextProject: Scroll3DProject) {
    const nextJson = formatProjectJson(nextProject);
    const nextValidation = validateProjectJson(nextJson);

    setAppliedProject(nextProject);
    setProjectJson(nextJson);
    setValidation(nextValidation);
    setSelectedSceneId((current) =>
      getSceneById(nextProject, current) ? current : getFirstSceneId(nextProject)
    );
  }

  function handleReset() {
    clearGenerationTimers();
    setProjectJson(sampleProjectJson);
    setAppliedProject(sampleProject);
    setValidation(validateProjectJson(sampleProjectJson));
    setPipelineResult(null);
    setIsGenerating(false);
    setGenerationPhaseIndex(0);
    setDraftReady(false);
    setInspectorPanel("scene");
    setWorkspaceView("preview");
    setSelectedSceneId(getFirstSceneId(sampleProject));
    setDownloadStatus("Sample project restored.");
  }

  async function handleDownloadZip() {
    try {
      setDownloadStatus("Creating ZIP in browser...");
      const zip = await createProjectZipBlob(appliedProject, "scroll3d-export.zip");
      downloadBlob(zip.blob, zip.filename);

      const nextHistory = appendExportHistory({
        id: String(Date.now()),
        fileCount: bundle?.files.length ?? 0,
        createdAt: new Date().toISOString()
      });

      setHistory(nextHistory);
      setDownloadStatus(`Downloaded ${zip.filename} (${String(zip.bytes)} B).`);
    } catch (error) {
      setDownloadStatus(
        error instanceof Error ? error.message : "ZIP download failed."
      );
    }
  }

  function handleClearStorage() {
    clearProjectStorage();
    setHistory([]);
    setSelectedPath(getDefaultSelectedFile(bundle));
    setDownloadStatus("Local project data cleared.");
  }

  function openAdvanced(tab: AdvancedTab) {
    setAdvancedTab(tab);
    setAdvancedOpen(true);
  }

  const settingsCenter = (
    <GlobalSettingsCenter
      open={advancedOpen}
      onClose={() => {
        setAdvancedOpen(false);
      }}
    >
      <AdvancedToolsPanel
        project={appliedProject}
        projectJson={projectJson}
        validation={validation}
        dirty={dirty}
        visibleSectionCount={visibleSectionCount}
        exportedFileCount={bundle?.files.length ?? 0}
        bundle={bundle}
        selectedPath={displaySelectedPath}
        filePreview={filePreview}
        settings={settings}
        scan={systemScan}
        settingsMessage={settingsMessage}
        pipelineResult={pipelineResult}
        downloadStatus={downloadStatus}
        history={history}
        exportReady={exportResult.success}
        activeTab={advancedTab}
        onTabChange={setAdvancedTab}
        onProjectChange={handleVisualProjectChange}
        onJsonChange={setProjectJson}
        onValidate={handleValidate}
        onApplyJson={handleApplyJson}
        onResetProject={handleReset}
        onSelectFile={setSelectedPath}
        onSettingsChange={setSettings}
        onScanChange={setSystemScan}
        onSettingsMessage={setSettingsMessage}
        onApplyPipelineProject={() => {
          if (pipelineResult?.project) {
            applyGeneratedProject(pipelineResult.project);
            setDownloadStatus("Generated project update applied.");
          }
        }}
        onDownloadZip={() => {
          void handleDownloadZip();
        }}
        onClearStorage={handleClearStorage}
      />
    </GlobalSettingsCenter>
  );

  if (!hasWorkspace) {
    return (
      <main className="page cinematicLandingPage">
        <LandingPromptSurface
          prompt={prompt}
          result={pipelineResult}
          modeLabel={settings.allowMockFallback ? `${modeLabel} + mock` : modeLabel}
          onPromptChange={setPrompt}
          onGenerate={handleGenerate}
          onOpenSettings={() => {
            openAdvanced("providers");
          }}
        />
        {settingsCenter}
      </main>
    );
  }

  return (
    <main
      className={
        previewFocusMode
          ? "page workspaceAppPage previewFocusMode"
          : "page workspaceAppPage"
      }
    >
      <header className="workspaceTopbar" aria-label="Scroll3D workspace header">
        <div className="brandLockup">
          <span className="logoMark">S3D</span>
          <div>
            <strong>Scroll3D</strong>
            <span>{appliedProject.name}</span>
          </div>
        </div>

        <WorkspaceViewSwitcher
          activeView={workspaceView}
          onViewChange={setWorkspaceView}
        />

        <div className="consumerNavActions">
          <span className="modeLine">
            {settings.allowMockFallback ? "Mock preview" : modeLabel}
          </span>
          <button
            type="button"
            className="primaryButton"
            onClick={() => {
              setInspectorPanel("export");
              setWorkspaceView("preview");
            }}
          >
            Export
          </button>
          <button
            type="button"
            className="secondaryButton"
            aria-expanded={advancedOpen}
            onClick={() => {
              openAdvanced("providers");
            }}
          >
            Advanced
          </button>
        </div>
      </header>

      <section
        className={[
          "cinematicWorkspaceShell",
          sidebarCollapsed ? "sidebarIsCollapsed" : "",
          previewFocusMode ? "previewFocusMode" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Scroll3D AI builder workspace"
      >
        <WorkspaceSidebar
          project={appliedProject}
          prompt={prompt}
          result={pipelineResult}
          activePhase={generationPhase}
          activePhaseIndex={generationPhaseIndex}
          isGenerating={isGenerating}
          selectedSceneId={selectedSceneId}
          collapsed={sidebarCollapsed}
          focusMode={previewFocusMode}
          onToggle={() => {
            setSidebarCollapsed((current) => !current);
          }}
          onSelectScene={(sceneId) => {
            setSelectedSceneId(sceneId);
            setInspectorPanel("scene");
            setWorkspaceView("preview");
          }}
          onRegenerate={handleGenerate}
          onNewProject={handleReset}
          onOpenSettings={() => {
            openAdvanced("providers");
          }}
        />

        <section className="workspaceMainStage" aria-label="Workspace main stage">
          {workspaceView === "preview" ? (
            <PrimaryPreview
              exportResult={exportResult}
              bundle={bundle}
              srcDoc={previewSrcDoc}
              projectName={appliedProject.name}
              hasGenerated={hasFinalDraft}
              isGenerating={isGenerating}
              generationPhase={generationPhase}
              activeScene={selectedScene}
              device={previewDevice}
              fullscreen={previewFullscreen}
              onDeviceChange={setPreviewDevice}
              onToggleFullscreen={() => {
                setPreviewFullscreen((current) => !current);
              }}
              onViewFiles={() => {
                setWorkspaceView("code");
              }}
              onDownloadZip={() => {
                void handleDownloadZip();
              }}
            />
          ) : (
            <CodeWorkspace
              bundle={bundle}
              selectedPath={displaySelectedPath}
              preview={filePreview}
              onSelectFile={setSelectedPath}
            />
          )}
        </section>

        <RightInspector
          project={appliedProject}
          hasGenerated={hasFinalDraft}
          activePanel={inspectorPanel}
          selectedSceneId={selectedSceneId}
          exportResult={exportResult}
          bundle={bundle}
          status={downloadStatus}
          focusMode={previewFocusMode}
          onPanelChange={(panel) => {
            setInspectorPanel(panel);
          }}
          onSelectScene={(sceneId) => {
            setSelectedSceneId(sceneId);
            setWorkspaceView("preview");
          }}
          onProjectChange={handleVisualProjectChange}
          onPreview={() => {
            setWorkspaceView("preview");
          }}
          onDownloadZip={() => {
            void handleDownloadZip();
          }}
          onViewFiles={() => {
            setWorkspaceView("code");
          }}
        />
      </section>

      <CompactStatusBar
        validation={validation}
        fileCount={hasFinalDraft ? (bundle?.files.length ?? 0) : 0}
        status={downloadStatus}
      />

      {settingsCenter}
    </main>
  );
}
