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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Lock, Save, RotateCcw } from "lucide-react";
import { AuthUserDto } from "@/lib/model";

export function ProfileCard({
  loading,
  user,
  onSave,
  onReset,
}: {
  loading: boolean;
  user?: AuthUserDto | null;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle className="text-lg">Profil i bezpieczeństwo</CardTitle>
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
          Podstawowe informacje i bezpieczeństwo konta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-3 pb-4 border-b">
          {loading ? (
            <Skeleton className="h-20 w-20 rounded-full" />
          ) : (
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src="/generic-fantasy-champion.png" />
              <AvatarFallback className="text-lg font-semibold">
                PG
              </AvatarFallback>
            </Avatar>
          )}
          <Button variant="outline" size="sm">
            Zmień zdjęcie
          </Button>
        </div>
        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            {loading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <Input
                id="email"
                type="email"
                defaultValue={user?.email ?? ""}
                className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Obecne hasło
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              {loading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <Input
                  id="currentPassword"
                  type="password"
                  className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
                />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              Nowe hasło
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              {loading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <Input
                  id="newPassword"
                  type="password"
                  className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
                />
              )}
            </div>
          </div>
        </div>
        <Button className="w-full h-11 font-semibold">Zaktualizuj hasło</Button>
      </CardContent>
    </Card>
  );
}
