"use client";

import { useEffect, useMemo, useState } from "react";
import type { Scroll3DProject } from "@scroll3d/core";
import { AdvancedToolsPanel, type AdvancedTab } from "./AdvancedToolsPanel";
import { AdvancedDrawer } from "./AdvancedDrawer";
import { CompactStatusBar } from "./CompactStatusBar";
import { PrimaryPreview } from "./PrimaryPreview";
import { PromptHero } from "./PromptHero";
import { SimpleEditPanel } from "./SimpleEditPanel";
import { SimpleExportPanel } from "./SimpleExportPanel";
import { StatusBadge } from "./StatusBadge";
import { WorkflowStepper } from "./WorkflowStepper";
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
import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import { runMockPromptPipeline } from "../lib/mock-pipeline-client";
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
import type { ConsumerWorkflowStep } from "../lib/workflow-state";

export function DeveloperPreviewApp() {
  const [activeStep, setActiveStep] = useState<ConsumerWorkflowStep>("prompt");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedTab, setAdvancedTab] = useState<AdvancedTab>("settings");
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

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const storedJson = readStorageValue(projectJsonStorageKey);

      if (storedJson) {
        const storedValidation = validateProjectJson(storedJson);
        setProjectJson(storedJson);
        setValidation(storedValidation);

        if (storedValidation.ok && storedValidation.project) {
          setAppliedProject(storedValidation.project);
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

  function handleValidate() {
    setValidation(validateProjectJson(projectJson));
  }

  function handleApplyJson() {
    const nextValidation = validateProjectJson(projectJson);
    setValidation(nextValidation);

    if (nextValidation.ok && nextValidation.project) {
      setAppliedProject(nextValidation.project);
      setDownloadStatus("Valid project applied and preview refreshed.");
    }
  }

  function handleVisualProjectChange(nextProject: Scroll3DProject) {
    const nextJson = formatProjectJson(nextProject);
    const nextValidation = validateProjectJson(nextJson);

    setAppliedProject(nextProject);
    setProjectJson(nextJson);
    setValidation(nextValidation);
    setDownloadStatus("Changes saved. Preview and export are refreshed.");
  }

  function handleGenerate() {
    setActiveStep("generate");
    const result = runMockPromptPipeline(appliedProject, prompt, settings);
    setPipelineResult(result);

    if (result.status === "completed" && result.project) {
      applyGeneratedProject(result.project);
      setActiveStep("edit");
      setDownloadStatus("Website generated. Edit the content or preview it.");
    } else {
      setDownloadStatus(result.warnings[0] ?? "Generation failed.");
      setActiveStep("prompt");
    }
  }

  function applyGeneratedProject(nextProject: Scroll3DProject) {
    const nextJson = formatProjectJson(nextProject);
    const nextValidation = validateProjectJson(nextJson);

    setAppliedProject(nextProject);
    setProjectJson(nextJson);
    setValidation(nextValidation);
  }

  function handleReset() {
    setProjectJson(sampleProjectJson);
    setAppliedProject(sampleProject);
    setValidation(validateProjectJson(sampleProjectJson));
    setPipelineResult(null);
    setActiveStep("prompt");
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

  return (
    <main className="page consumerAppPage">
      <header className="consumerTopNav" aria-label="Scroll3D header">
        <div className="brandLockup">
          <span className="logoMark">S3D</span>
          <div>
            <strong>Scroll3D</strong>
            <span>Generate cinematic 3D websites from a prompt.</span>
          </div>
        </div>
        <div className="consumerNavActions">
          <StatusBadge tone="warning">Mock generation</StatusBadge>
          <button
            type="button"
            className="secondaryButton"
            onClick={() => {
              setActiveStep("export");
            }}
          >
            Export
          </button>
          <button
            type="button"
            className="secondaryButton"
            aria-expanded={advancedOpen}
            onClick={() => {
              setAdvancedOpen((current) => !current);
            }}
          >
            Advanced
          </button>
        </div>
      </header>

      <WorkflowStepper activeStep={activeStep} onStepChange={setActiveStep} />

      <section className="consumerWorkspace" aria-label="Scroll3D normal workflow">
        <div className="consumerControlColumn">
          {activeStep === "prompt" || activeStep === "generate" ? (
            <PromptHero
              prompt={prompt}
              result={pipelineResult}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              onEdit={() => {
                setActiveStep("edit");
              }}
              onPreview={() => {
                setActiveStep("preview");
              }}
            />
          ) : null}

          {activeStep === "edit" ? (
            <SimpleEditPanel
              project={appliedProject}
              onChange={handleVisualProjectChange}
              onPreview={() => {
                setActiveStep("preview");
              }}
            />
          ) : null}

          {activeStep === "preview" ? (
            <section className="consumerPanel" aria-labelledby="preview-step-title">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Preview</p>
                  <h2 id="preview-step-title">Review the website</h2>
                  <p className="statusText">
                    The preview is sandboxed for safety. Generated file details are
                    available in Advanced.
                  </p>
                </div>
              </div>
              <div className="consumerActionRow">
                <button
                  type="button"
                  className="primaryButton"
                  onClick={() => {
                    setActiveStep("export");
                  }}
                >
                  Continue to export
                </button>
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => {
                    setActiveStep("edit");
                  }}
                >
                  Edit more
                </button>
              </div>
            </section>
          ) : null}

          {activeStep === "export" ? (
            <SimpleExportPanel
              exportResult={exportResult}
              bundle={bundle}
              status={downloadStatus}
              onDownloadZip={() => {
                void handleDownloadZip();
              }}
              onViewFiles={() => {
                openAdvanced("files");
              }}
            />
          ) : null}
        </div>

        <PrimaryPreview
          exportResult={exportResult}
          bundle={bundle}
          srcDoc={previewSrcDoc}
          onViewFiles={() => {
            openAdvanced("files");
          }}
        />
      </section>

      <CompactStatusBar
        validation={validation}
        fileCount={bundle?.files.length ?? 0}
        status={downloadStatus}
      />

      <AdvancedDrawer
        open={advancedOpen}
        onToggle={() => {
          setAdvancedOpen((current) => !current);
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
      </AdvancedDrawer>
    </main>
  );
}
