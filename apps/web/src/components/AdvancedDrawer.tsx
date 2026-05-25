import type { ReactNode } from "react";

interface AdvancedDrawerProps {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function AdvancedDrawer({ open, onToggle, children }: AdvancedDrawerProps) {
  return (
    <section className="advancedDrawer" aria-labelledby="advanced-drawer-title">
      <button
        type="button"
        className="advancedToggle"
        aria-expanded={open}
        aria-controls="advanced-drawer-content"
        onClick={onToggle}
      >
        <span>
          <strong id="advanced-drawer-title">Advanced tools</strong>
          <small>Settings, providers, models, JSON, files, and diagnostics</small>
        </span>
        <span aria-hidden="true">{open ? "Hide" : "Open"}</span>
      </button>

      {open ? (
        <div id="advanced-drawer-content" className="advancedDrawerContent">
          {children}
        </div>
      ) : null}
    </section>
  );
}
