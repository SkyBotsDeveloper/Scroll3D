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
          <p className="eyebrow">Project JSON</p>
          <h2 id="json-editor-title">Edit project data</h2>
        </div>
        <div className="buttonRow">
          <button type="button" className="secondaryButton" onClick={onReset}>
            Reset sample
          </button>
          <button type="button" className="secondaryButton" onClick={onValidate}>
            Validate
          </button>
          <button
            type="button"
            className="primaryButton"
            onClick={onApply}
            disabled={!validation.ok}
          >
            Apply valid JSON
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
