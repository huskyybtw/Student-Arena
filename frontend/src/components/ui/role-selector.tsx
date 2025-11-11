import { RoleIcon } from "@/components/ui/role-icon";

interface RoleSelectorProps {
  roles: string[];
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
  disabled?: boolean;
  multiSelect?: boolean;
}

const roleNames: Record<string, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MID: "Mid",
  CARRY: "ADC",
  SUPPORT: "Support",
};

export function RoleSelector({
  roles,
  selectedRoles,
  onRoleToggle,
  disabled = false,
}: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {roles.map((role) => {
        const isSelected = selectedRoles.includes(role);
        const roleName = roleNames[role] || role;

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
              className={`transition-transform duration-200 ${
                isSelected ? "scale-110" : "group-hover:scale-105"
              }`}
            >
              <RoleIcon role={role} size={24} />
            </div>
            <span className="text-[10px] font-medium leading-tight">
              {roleName}
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
