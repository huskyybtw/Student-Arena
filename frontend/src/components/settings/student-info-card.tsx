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
import { School, Save, RotateCcw } from "lucide-react";

export function StudentInfoCard({
  loading,
}: // ...existing props...
{
  loading: boolean;
  // ...existing prop types...
}) {
  // Internal save/reset handlers
  const handleSave = () => {
    // TODO: Implement save logic (e.g., API call, toast)
    console.log("StudentInfoCard: save");
  };
  const handleReset = () => {
    // TODO: Implement reset logic (clear fields, reset state)
    console.log("StudentInfoCard: reset");
  };
  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="h-5 w-5" />
            <CardTitle className="text-lg">Informacje studenckie</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-3"
              onClick={handleReset}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-3"
              onClick={handleSave}
            >
              <Save className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Dane dotyczące Twojej uczelni i studiów
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="university" className="text-sm font-medium">
              Uczelnia
            </Label>
            {loading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <Input
                id="university"
                placeholder="np. Uniwersytet Warszawski"
                className="h-11 bg-background border-2 border-border focus:border-primary"
              />
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="faculty" className="text-sm font-medium">
              Wydział
            </Label>
            {loading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <Input
                id="faculty"
                placeholder="np. Informatyka"
                className="h-11 bg-background border-2 border-border focus:border-primary"
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="year" className="text-sm font-medium">
              Rok studiów
            </Label>
            {loading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <Input
                id="year"
                placeholder="np. 2"
                type="number"
                min="1"
                max="5"
                className="h-11 bg-background border-2 border-border focus:border-primary"
              />
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="studentId" className="text-sm font-medium">
              Numer indeksu
            </Label>
            {loading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <Input
                id="studentId"
                placeholder="123456"
                className="h-11 bg-background border-2 border-border focus:border-primary"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
