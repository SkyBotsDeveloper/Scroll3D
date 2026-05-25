"use client";

import { useEffect, useMemo, useState } from "react";
import type { Scroll3DProject } from "@scroll3d/core";
import { ExportActions } from "./ExportActions";
import { ExportFileList } from "./ExportFileList";
import { ExportPreview } from "./ExportPreview";
import { PhaseStatus } from "./PhaseStatus";
import { ProjectJsonEditor } from "./ProjectJsonEditor";
import { createProjectZipBlob } from "../lib/browser-zip";
import {
  createFilePreview,
  createPreviewSrcDoc,
  exportProjectToBundle,
  getBundleFile,
  getDefaultSelectedFile
} from "../lib/export-client";
import { downloadBlob } from "../lib/download";
import { sampleProject, sampleProjectJson } from "../lib/sample-project";
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
      <section className="hero appHero" aria-labelledby="home-title">
        <p className="eyebrow">Developer Preview</p>
        <h1 id="home-title">Scroll3D</h1>
        <p className="subtitle">Open-source AI 3D website builder</p>
        <div className="status" aria-label="Current Phase 8 status">
          <span className="statusDot" aria-hidden="true" />
          Web export preview and ZIP download workflow
        </div>
      </section>

      <section className="flow" aria-label="Developer preview workflow">
        <span>Project JSON</span>
        <span aria-hidden="true">-&gt;</span>
        <span>Validate</span>
        <span aria-hidden="true">-&gt;</span>
        <span>Static export</span>
        <span aria-hidden="true">-&gt;</span>
        <span>Preview and ZIP</span>
      </section>

      <section className="workspaceGrid" aria-label="Scroll3D developer preview">
        <ProjectJsonEditor
          value={projectJson}
          validation={validation}
          onChange={setProjectJson}
          onValidate={handleValidate}
          onApply={handleApply}
          onReset={handleReset}
        />
        <div className="rightColumn">
          <ExportPreview exportResult={exportResult} srcDoc={previewSrcDoc} />
          <ExportActions
            disabled={!exportResult.success}
            status={downloadStatus}
            history={history}
            onDownloadZip={() => {
              void handleDownloadZip();
            }}
            onClearStorage={handleClearStorage}
          />
        </div>
      </section>

      <ExportFileList
        bundle={bundle}
        selectedPath={displaySelectedPath}
        preview={filePreview}
        onSelect={setSelectedPath}
      />

      <PhaseStatus />
    </main>
  );
}
