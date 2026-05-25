import type { ProjectValidationResult } from "../lib/validation";
import { ValidationPanel } from "./ValidationPanel";

interface ProjectJsonEditorProps {
  value: string;
  validation: ProjectValidationResult;
  onChange: (value: string) => void;
  onValidate: () => void;
  onApply: () => void;
  onReset: () => void;
}

export function ProjectJsonEditor({
  value,
  validation,
  onChange,
  onValidate,
  onApply,
  onReset
}: ProjectJsonEditorProps) {
  return (
    <section className="toolPanel editorPanel" aria-labelledby="json-editor-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Power user JSON</p>
          <h2 id="json-editor-title">Inspect and edit project data</h2>
          <p className="statusText">
            Visual edits keep this JSON synced. Apply only when the schema is valid.
          </p>
        </div>
        <div className="buttonRow">
          <button type="button" className="secondaryButton" onClick={onReset}>
            Restore sample
          </button>
          <button type="button" className="secondaryButton" onClick={onValidate}>
            Check JSON
          </button>
          <button
            type="button"
            className="primaryButton"
            onClick={onApply}
            disabled={!validation.ok}
          >
            Apply to editor
          </button>
        </div>
      </div>

      <textarea
        className="jsonEditor"
        aria-label="Scroll3D project JSON"
        spellCheck={false}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />

      <ValidationPanel result={validation} />
    </section>
  );
}
