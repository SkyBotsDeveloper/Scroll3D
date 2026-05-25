import type { EditorTab } from "../lib/editor-state";

const tabs: Array<{ id: EditorTab; label: string }> = [
  { id: "visual", label: "Visual" },
  { id: "json", label: "JSON" },
  { id: "export", label: "Export" },
  { id: "settings", label: "Settings" },
  { id: "prompt", label: "Prompt" }
];

interface EditorTabsProps {
  activeTab: EditorTab;
  onChange: (tab: EditorTab) => void;
}

export function EditorTabs({ activeTab, onChange }: EditorTabsProps) {
  return (
    <div className="editorTabs" role="tablist" aria-label="Editor views">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? "tabButton active" : "tabButton"}
          onClick={() => {
            onChange(tab.id);
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
