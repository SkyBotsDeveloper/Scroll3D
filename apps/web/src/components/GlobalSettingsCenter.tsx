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
            <p className="eyebrow">Settings center</p>
            <h2>Workspace, providers, models, deployment, and diagnostics</h2>
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
