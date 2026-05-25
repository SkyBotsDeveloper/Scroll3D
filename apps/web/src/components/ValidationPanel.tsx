import { summarizeValidation, type ProjectValidationResult } from "../lib/validation";

interface ValidationPanelProps {
  result: ProjectValidationResult;
}

export function ValidationPanel({ result }: ValidationPanelProps) {
  return (
    <section
      className={result.ok ? "validation validationOk" : "validation validationError"}
      aria-live="polite"
    >
      <h3>Validation</h3>
      <p>{summarizeValidation(result)}</p>
      {result.errors.length > 0 ? (
        <ul>
          {result.errors.slice(0, 8).map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
