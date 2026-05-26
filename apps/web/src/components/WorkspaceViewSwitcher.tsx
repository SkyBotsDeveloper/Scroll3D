export type WorkspaceView = "preview" | "code";

interface WorkspaceViewSwitcherProps {
  activeView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
}

const views: Array<{ id: WorkspaceView; label: string }> = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" }
];

export function WorkspaceViewSwitcher({
  activeView,
  onViewChange
}: WorkspaceViewSwitcherProps) {
  return (
    <div className="workspaceViewSwitcher" role="tablist" aria-label="Workspace view">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          className={
            activeView === view.id
              ? "workspaceViewButton active"
              : "workspaceViewButton"
          }
          aria-selected={activeView === view.id}
          onClick={() => {
            onViewChange(view.id);
          }}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
