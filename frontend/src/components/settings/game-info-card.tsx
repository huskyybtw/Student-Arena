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
import { Gamepad2, Save, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { AuthUserResponseDto } from "@/lib/api/model/authUserResponseDto";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  gameInfoSchema,
  GameInfoFormData,
} from "@/lib/validators/gameInfoSchema";
import { PlayerResponseDtoPrimaryRole } from "@/lib/api/model/playerResponseDtoPrimaryRole";
import { usePlayerControllerUpsert } from "@/lib/api/player/player";
import { useQueryClient } from "@tanstack/react-query";

export function GameInfoCard({
  loading,
  user,
}: {
  loading: boolean;
  user: AuthUserResponseDto | null | undefined;
}) {
  const queryClient = useQueryClient();
  const roles = Object.values(PlayerResponseDtoPrimaryRole);

  const upsertMutation = usePlayerControllerUpsert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["authControllerMe"] });
        toast.success("Dane gracza zaktualizowane");
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "Błąd podczas aktualizacji danych gracza"
        );
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<GameInfoFormData>({
    resolver: yupResolver(gameInfoSchema) as any,
    defaultValues: {
      bio: "",
      summonerName: "",
      tagLine: "",
      primaryRole: undefined,
      secondaryRole: undefined,
    },
  });

  const primaryRole = watch("primaryRole");
  const secondaryRole = watch("secondaryRole");

  useEffect(() => {
    if (user?.playerAccount) {
      reset({
        bio: user.playerAccount.description || "",
        summonerName: user.playerAccount.gameName || "",
        tagLine: user.playerAccount.tagLine || "",
        primaryRole: user.playerAccount.primaryRole || undefined,
        secondaryRole: user.playerAccount.secondaryRole || undefined,
      });
    }
  }, [user, reset]);

  const onSubmit = (data: GameInfoFormData) => {
    // Validate that all required fields are present
    if (
      !data.summonerName ||
      !data.tagLine ||
      !data.primaryRole ||
      !data.secondaryRole ||
      !data.bio
    ) {
      toast.error("Wszystkie pola są wymagane");
      return;
    }

    upsertMutation.mutate({
      data: {
        gameName: data.summonerName,
        tagLine: data.tagLine,
        primaryRole: data.primaryRole,
        secondaryRole: data.secondaryRole,
        description: data.bio,
      },
    });
  };

  const handleReset = () => {
    reset({
      bio: user?.playerAccount?.description || "",
      summonerName: user?.playerAccount?.gameName || "",
      tagLine: user?.playerAccount?.tagLine || "",
      primaryRole: user?.playerAccount?.primaryRole || undefined,
      secondaryRole: user?.playerAccount?.secondaryRole || undefined,
    });
    toast.info("Zresetowano zmiany");
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
              onClick={handleReset}
              type="button"
              disabled={upsertMutation.isPending}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-3"
              onClick={handleSubmit(onSubmit)}
              type="button"
              disabled={upsertMutation.isPending}
            >
              <Save className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Twoje dane dotyczące League of Legends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="bio" className="text-sm font-medium">
              Opis profilu
            </Label>
            {loading ? (
              <Skeleton className="min-h-[80px] w-full rounded-xl" />
            ) : (
              <>
                <Textarea
                  id="bio"
                  placeholder="Opowiedz coś o sobie..."
                  {...register("bio")}
                  className="min-h-[80px] bg-background border-2 border-border focus:border-primary resize-none"
                />
                {errors.bio && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.bio.message}
                  </p>
                )}
              </>
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
                <>
                  <Input
                    id="summonerName"
                    {...register("summonerName")}
                    placeholder="ProGamer2024"
                    className="h-11 bg-background border-2 border-border focus:border-primary"
                  />
                  {errors.summonerName && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.summonerName.message}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="tagLine" className="text-sm font-medium">
                Tag Line
              </Label>
              {loading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <>
                  <Input
                    id="tagLine"
                    {...register("tagLine")}
                    placeholder="#EUW1"
                    className="h-11 bg-background border-2 border-border focus:border-primary"
                  />
                  {errors.tagLine && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.tagLine.message}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Główna pozycja</Label>
            <Controller
              name="primaryRole"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-5 gap-2">
                  {roles.map((role) =>
                    loading ? (
                      <Skeleton key={role} className="h-12 w-full rounded-xl" />
                    ) : (
                      <button
                        key={role}
                        type="button"
                        className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          field.value === role
                            ? "border-primary bg-primary/10 text-primary shadow-md"
                            : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
                        }`}
                        onClick={() => field.onChange(role)}
                        disabled={secondaryRole === role}
                      >
                        <span className="text-2xl">{role}</span>
                        <span className="text-xs font-medium">{role}</span>
                        {field.value === role && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            />
            {errors.primaryRole && (
              <p className="text-sm text-destructive mt-1">
                {errors.primaryRole.message}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Druga pozycja</Label>
            <Controller
              name="secondaryRole"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-5 gap-2">
                  {roles.map((role) =>
                    loading ? (
                      <Skeleton key={role} className="h-12 w-full rounded-xl" />
                    ) : (
                      <button
                        key={role}
                        type="button"
                        className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          field.value === role
                            ? "border-primary bg-primary/10 text-primary shadow-md"
                            : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
                        }`}
                        onClick={() => field.onChange(role)}
                        disabled={primaryRole === role}
                      >
                        <span className="text-2xl">{role}</span>
                        <span className="text-xs font-medium">{role}</span>
                        {field.value === role && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            />
            {errors.secondaryRole && (
              <p className="text-sm text-destructive mt-1">
                {errors.secondaryRole.message}
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
