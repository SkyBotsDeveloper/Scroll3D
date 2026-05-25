import type { ExportResult, StaticExportBundle } from "@scroll3d/exporter/browser";
import type { FilePreview } from "../lib/export-client";
import { ExportFileList } from "./ExportFileList";
import { ExportPreview } from "./ExportPreview";

interface PreviewPaneProps {
  exportResult: ExportResult;
  srcDoc: string;
  bundle: StaticExportBundle | undefined;
  selectedPath: string;
  filePreview: FilePreview | undefined;
  onSelectFile: (path: string) => void;
}

export function PreviewPane({
  exportResult,
  srcDoc,
  bundle,
  selectedPath,
  filePreview,
  onSelectFile
}: PreviewPaneProps) {
  return (
    <div className="previewPane">
      <ExportPreview exportResult={exportResult} srcDoc={srcDoc} />
      <ExportFileList
        bundle={bundle}
        selectedPath={selectedPath}
        preview={filePreview}
        onSelect={onSelectFile}
      />
    </div>
  );
}
