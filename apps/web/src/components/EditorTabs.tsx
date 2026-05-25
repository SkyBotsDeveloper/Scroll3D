import type { EditorTab } from "../lib/editor-state";

const tabs: Array<{ id: EditorTab; label: string }> = [
  { id: "prompt", label: "Generate" },
  { id: "visual", label: "Visual Editor" },
  { id: "export", label: "Preview & Export" },
  { id: "json", label: "JSON" },
  { id: "settings", label: "Settings" }
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
