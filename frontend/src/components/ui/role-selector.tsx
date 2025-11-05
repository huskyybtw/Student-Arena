interface RoleSelectorProps {
  roles: string[];
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
  disabled?: boolean;
  multiSelect?: boolean;
}

const roleIcons: Record<string, { name: string; icon: string }> = {
  TOP: { name: "Top", icon: "🗡️" },
  JUNGLE: { name: "Jungle", icon: "🌿" },
  MID: { name: "Mid", icon: "⚡" },
  CARRY: { name: "ADC", icon: "🏹" },
  SUPPORT: { name: "Support", icon: "🛡️" },
};

export function RoleSelector({
  roles,
  selectedRoles,
  onRoleToggle,
  disabled = false,
  multiSelect = true,
}: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {roles.map((role) => {
        const isSelected = selectedRoles.includes(role);
        const data = roleIcons[role] || { name: role, icon: "🎮" };

        return (
          <button
            key={role}
            type="button"
            onClick={() => onRoleToggle(role)}
            disabled={disabled}
            className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              disabled
                ? "border-border/50 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
                : isSelected
                ? "border-primary bg-primary/10 text-primary shadow-md"
                : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div
              className={`text-xl transition-transform duration-200 ${
                isSelected ? "scale-110" : "group-hover:scale-105"
              }`}
            >
              {data.icon}
            </div>
            <span className="text-[10px] font-medium leading-tight">
              {data.name}
            </span>
            {isSelected && !disabled && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
            )}
          </button>
        );
      })}
    </div>
  );
}
