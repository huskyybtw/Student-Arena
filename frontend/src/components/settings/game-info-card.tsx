import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gamepad2, Save, RotateCcw } from "lucide-react";

import { useState } from "react";

export function GameInfoCard({
  loading,
  mainRole,
  secondaryRoles,
  onMainRoleChange,
  onSave,
  onReset,
}: {
  loading: boolean;
  mainRole: string;
  secondaryRoles: string[];
  onMainRoleChange: (role: string) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const roles = ["top", "jungle", "mid", "adc", "support"];
  const [localSecondaryRoles, setLocalSecondaryRoles] =
    useState<string[]>(secondaryRoles);

  const handleSecondaryRoleToggle = (role: string) => {
    setLocalSecondaryRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };
  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            <CardTitle className="text-lg">Informacje o grze</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-3"
              onClick={onReset}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-3"
              onClick={onSave}
            >
              <Save className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Twoje dane dotyczące League of Legends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="bio" className="text-sm font-medium">
            Opis profilu
          </Label>
          {loading ? (
            <Skeleton className="min-h-[80px] w-full rounded-xl" />
          ) : (
            <Textarea
              id="bio"
              placeholder="Opowiedz coś o sobie..."
              className="min-h-[80px] bg-background border-2 border-border focus:border-primary resize-none"
            />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="summonerName" className="text-sm font-medium">
              Nazwa przywoływacza
            </Label>
            {loading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <Input
                id="summonerName"
                defaultValue="ProGamer2024"
                className="h-11 bg-background border-2 border-border focus:border-primary"
              />
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="server" className="text-sm font-medium">
              Serwer
            </Label>
            {loading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <Select defaultValue="eune">
                <SelectTrigger className="h-11 bg-background border-2 border-border focus:border-primary data-[state=open]:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eune">EUNE</SelectItem>
                  <SelectItem value="euw">EUW</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-medium">Główna pozycja</Label>
          <div className="grid grid-cols-5 gap-2">
            {roles.map((role) =>
              loading ? (
                <Skeleton key={role} className="h-12 w-full rounded-xl" />
              ) : (
                <button
                  key={role}
                  type="button"
                  className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    mainRole === role
                      ? "border-primary bg-primary/10 text-primary shadow-md"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onClick={() => onMainRoleChange(role)}
                  disabled={localSecondaryRoles.includes(role)}
                >
                  <span className="text-2xl">{role}</span>
                  <span className="text-xs font-medium">{role}</span>
                  {mainRole === role && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  )}
                </button>
              )
            )}
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Dodatkowe pozycje{" "}
            <span className="text-muted-foreground">(możesz wybrać kilka)</span>
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {roles.map((role) =>
              loading ? (
                <Skeleton key={role} className="h-12 w-full rounded-xl" />
              ) : (
                <button
                  key={role}
                  type="button"
                  className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    localSecondaryRoles.includes(role)
                      ? "border-primary bg-primary/10 text-primary shadow-md"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onClick={() => handleSecondaryRoleToggle(role)}
                  disabled={mainRole === role}
                >
                  <span className="text-2xl">{role}</span>
                  <span className="text-xs font-medium">{role}</span>
                  {localSecondaryRoles.includes(role) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
