"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Scroll3DProject } from "@scroll3d/core";
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelRef,
  type LayoutStorage
} from "react-resizable-panels";
import { AdvancedToolsPanel, type AdvancedTab } from "./AdvancedToolsPanel";
import { AiChatWorkspace } from "./AiChatWorkspace";
import { CodeWorkspace } from "./CodeWorkspace";
import { GlobalSettingsCenter } from "./GlobalSettingsCenter";
import { PrimaryPreview } from "./PrimaryPreview";
import { RightInspector, type InspectorPanel } from "./RightInspector";
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
  const [contextPanel, setContextPanel] = useState<InspectorPanel | null>(null);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("preview");
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
  const chatPanelRef = usePanelRef();
  const workspaceLayoutStorage = useMemo<LayoutStorage>(
    () => ({
      getItem(key) {
        if (typeof window === "undefined") {
          return null;
        }

        return window.localStorage.getItem(key);
      },
      setItem(key, value) {
        if (typeof window === "undefined") {
          return;
        }

        window.localStorage.setItem(key, value);
      }
    }),
    []
  );
  const workspaceLayoutPersistence = useDefaultLayout({
    id: "scroll3d-two-panel-layout-v1",
    panelIds: ["ai-chat", "workspace-stage"],
    storage: workspaceLayoutStorage
  });

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

  useEffect(() => {
    if (previewFocusMode) {
      chatPanelRef.current?.collapse();
    } else {
      chatPanelRef.current?.expand();
    }
  }, [chatPanelRef, previewFocusMode]);

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
    setContextPanel(null);
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
    setContextPanel(null);
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

  return (
    <main
      className={
        previewFocusMode
          ? "page aiTwoPanelPage previewFocusMode"
          : "page aiTwoPanelPage"
      }
    >
      <header className="aiTwoPanelTopbar" aria-label="Scroll3D workspace header">
        <div className="brandLockup">
          <span className="logoMark">S3D</span>
          <div>
            <strong>Scroll3D</strong>
            <span>{hasFinalDraft ? appliedProject.name : "AI creative workspace"}</span>
          </div>
        </div>

        <div className="consumerNavActions">
          <span className="modeLine">
            {settings.allowMockFallback ? "Developer preview" : modeLabel}
          </span>
          <button
            type="button"
            className="primaryButton"
            onClick={() => {
              if (hasFinalDraft) {
                void handleDownloadZip();
              } else {
                handleGenerate();
              }
            }}
          >
            {hasFinalDraft ? "Download ZIP" : "Generate"}
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
        className={
          previewFocusMode ? "aiTwoPanelShell previewFocusMode" : "aiTwoPanelShell"
        }
        aria-label="Scroll3D AI builder workspace"
      >
        <Group
          className="twoPanelGroup"
          defaultLayout={workspaceLayoutPersistence.defaultLayout}
          id="scroll3d-two-panel-layout-v1"
          onLayoutChanged={workspaceLayoutPersistence.onLayoutChanged}
          orientation="horizontal"
          resizeTargetMinimumSize={{ coarse: 34, fine: 14 }}
        >
          <Panel
            id="ai-chat"
            className="workspaceResizablePanel aiChatResizablePanel"
            collapsible
            collapsedSize="5%"
            defaultSize="34%"
            minSize="27%"
            maxSize="44%"
            panelRef={chatPanelRef}
          >
            <AiChatWorkspace
              project={appliedProject}
              prompt={prompt}
              modeLabel={settings.allowMockFallback ? `${modeLabel} + mock` : modeLabel}
              result={pipelineResult}
              activePhase={generationPhase}
              activePhaseIndex={generationPhaseIndex}
              isGenerating={isGenerating}
              hasGenerated={hasFinalDraft}
              selectedSceneId={selectedSceneId}
              status={downloadStatus}
              bundle={bundle}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              onNewProject={handleReset}
              onOpenTools={setContextPanel}
              onSelectScene={(sceneId) => {
                setSelectedSceneId(sceneId);
                setWorkspaceView("preview");
              }}
              onOpenSettings={() => {
                openAdvanced("providers");
              }}
              onDownloadZip={() => {
                void handleDownloadZip();
              }}
            />
          </Panel>

          <Separator
            className="workspaceResizeHandle"
            aria-label="Resize chat and preview"
          />

          <Panel
            id="workspace-stage"
            className="workspaceResizablePanel creativeStagePanel"
            defaultSize="66%"
            minSize="54%"
          >
            <section className="creativeStage" aria-label="Preview and code workspace">
              <header className="creativeStageHeader">
                <div>
                  <span className="modeLine">
                    {workspaceView === "preview" ? "Preview" : "Code"}
                  </span>
                  <strong>
                    {workspaceView === "preview"
                      ? "Website preview"
                      : "Generated files"}
                  </strong>
                </div>
                <div className="creativeStageActions">
                  <WorkspaceViewSwitcher
                    activeView={workspaceView}
                    onViewChange={setWorkspaceView}
                  />
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={() => {
                      setContextPanel("edit");
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={() => {
                      setContextPanel("export");
                    }}
                  >
                    Export
                  </button>
                </div>
              </header>
              <div className="creativeStageViewport">
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
              </div>
            </section>
          </Panel>
        </Group>
      </section>

      {contextPanel ? (
        <div className="contextualToolOverlay" role="dialog" aria-modal="true">
          <button
            type="button"
            className="contextualToolScrim"
            aria-label="Close contextual tools"
            onClick={() => {
              setContextPanel(null);
            }}
          />
          <div className="contextualToolDrawer">
            <button
              type="button"
              className="contextualCloseButton"
              onClick={() => {
                setContextPanel(null);
              }}
            >
              Close
            </button>
            <RightInspector
              project={appliedProject}
              hasGenerated={hasFinalDraft}
              activePanel={contextPanel}
              selectedSceneId={selectedSceneId}
              exportResult={exportResult}
              bundle={bundle}
              status={downloadStatus}
              focusMode={false}
              onPanelChange={(panel) => {
                setContextPanel(panel);
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
          </div>
        </div>
      ) : null}

      {settingsCenter}
    </main>
  );
}
