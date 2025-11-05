interface TabSwitcherProps<T extends string> {
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: {
    value: T;
    label: string;
  }[];
}

export function TabSwitcher<T extends string>({
  activeTab,
  onTabChange,
  tabs,
}: TabSwitcherProps<T>) {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-lg p-1 flex gap-1 border border-border/50">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === tab.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
