"use client";

import { useEffect, useMemo, useState } from "react";
import type { Scroll3DProject } from "@scroll3d/core";
import { EditorTabs } from "./EditorTabs";
import { EditorToolbar } from "./EditorToolbar";
import { ExportActions } from "./ExportActions";
import { JsonSyncPanel } from "./JsonSyncPanel";
import { PhaseStatus } from "./PhaseStatus";
import { PreviewPane } from "./PreviewPane";
import { ProjectJsonEditor } from "./ProjectJsonEditor";
import { VisualEditor } from "./VisualEditor";
import { createProjectZipBlob } from "../lib/browser-zip";
import type { EditorTab } from "../lib/editor-state";
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
  formatProjectJson,
  sampleProject,
  sampleProjectJson
} from "../lib/sample-project";
import { getVisibleSectionCount } from "../lib/section-utils";
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
import { validateProjectJson, type ProjectValidationResult } from "../lib/validation";

export function DeveloperPreviewApp() {
  const [activeTab, setActiveTab] = useState<EditorTab>("visual");
  const [projectJson, setProjectJson] = useState(sampleProjectJson);
  const [appliedProject, setAppliedProject] = useState<Scroll3DProject>(sampleProject);
  const [validation, setValidation] = useState<ProjectValidationResult>(() =>
    validateProjectJson(sampleProjectJson)
  );
  const [selectedPath, setSelectedPath] = useState("");
  const [downloadStatus, setDownloadStatus] = useState(
    "Export runs entirely in this browser."
  );
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);

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

  function handleValidate() {
    setValidation(validateProjectJson(projectJson));
  }

  function handleApply() {
    const nextValidation = validateProjectJson(projectJson);
    setValidation(nextValidation);

    if (nextValidation.ok && nextValidation.project) {
      setAppliedProject(nextValidation.project);
      setDownloadStatus("Valid project applied and re-exported.");
    }
  }

  function handleVisualProjectChange(nextProject: Scroll3DProject) {
    const nextJson = formatProjectJson(nextProject);
    const nextValidation = validateProjectJson(nextJson);

    setAppliedProject(nextProject);
    setProjectJson(nextJson);
    setValidation(nextValidation);
    setDownloadStatus("Visual edit applied and export refreshed.");
  }

  function handleReset() {
    setProjectJson(sampleProjectJson);
    setAppliedProject(sampleProject);
    setValidation(validateProjectJson(sampleProjectJson));
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

  return (
    <main className="page appPage">
      <EditorToolbar
        project={appliedProject}
        validation={validation}
        dirty={dirty}
        fileCount={bundle?.files.length ?? 0}
        visibleSectionCount={visibleSectionCount}
      />

      <section className="flow" aria-label="Developer preview workflow">
        <span>Visual controls</span>
        <span aria-hidden="true">-&gt;</span>
        <span>Synced JSON</span>
        <span aria-hidden="true">-&gt;</span>
        <span>Static export</span>
        <span aria-hidden="true">-&gt;</span>
        <span>Preview and ZIP</span>
      </section>

      <section className="appShell" aria-label="Scroll3D developer preview">
        <aside className="leftPanel" aria-label="Editor panel">
          <EditorTabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === "visual" ? (
            <VisualEditor
              project={appliedProject}
              onChange={handleVisualProjectChange}
            />
          ) : null}
          {activeTab === "json" ? (
            <ProjectJsonEditor
              value={projectJson}
              validation={validation}
              onChange={setProjectJson}
              onValidate={handleValidate}
              onApply={handleApply}
              onReset={handleReset}
            />
          ) : null}
          {activeTab === "export" ? (
            <>
              <JsonSyncPanel
                dirty={dirty}
                validation={validation}
                visibleSectionCount={visibleSectionCount}
                exportedFileCount={bundle?.files.length ?? 0}
              />
              <ExportActions
                disabled={!exportResult.success}
                status={downloadStatus}
                history={history}
                onDownloadZip={() => {
                  void handleDownloadZip();
                }}
                onClearStorage={handleClearStorage}
              />
            </>
          ) : null}
        </aside>

        <PreviewPane
          exportResult={exportResult}
          srcDoc={previewSrcDoc}
          bundle={bundle}
          selectedPath={displaySelectedPath}
          filePreview={filePreview}
          onSelectFile={setSelectedPath}
        />
      </section>

      <PhaseStatus />
    </main>
  );
}
