import type { ReactNode } from "react";

interface GlobalSettingsCenterProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function GlobalSettingsCenter({
  open,
  onClose,
  children
}: GlobalSettingsCenterProps) {
  if (!open) {
    return null;
  }

  return (
    <section className="settingsCenterOverlay" aria-label="Global settings center">
      <div className="settingsCenterBackdrop" aria-hidden="true" onClick={onClose} />
      <div className="settingsCenterPanel" role="dialog" aria-modal="true">
        <div className="settingsCenterHeader">
          <div>
            <p className="eyebrow">Control Center</p>
            <h2>Workspace systems without leaving the canvas</h2>
            <span>
              Providers, models, runtime, deployment, JSON, and diagnostics stay here so
              the creative workspace remains focused.
            </span>
          </div>
          <button type="button" className="secondaryButton" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </section>
  );
}
