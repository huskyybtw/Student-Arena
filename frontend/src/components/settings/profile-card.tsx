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
import { useEffect } from "react";
import { toast } from "sonner";
import { AuthUserResponseDto } from "@/lib/api/model";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { profileSchema, ProfileFormData } from "@/lib/validators/profileSchema";
import {
  useAuthControllerMeUpdate,
  getAuthControllerMeQueryKey,
} from "@/lib/api/auth/auth";
import { useQueryClient } from "@tanstack/react-query";

export function ProfileCard({
  loading,
  user,
}: {
  loading: boolean;
  user?: AuthUserResponseDto | null;
}) {
  const queryClient = useQueryClient();
  const updateMutation = useAuthControllerMeUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getAuthControllerMeQueryKey(),
        });
        toast.success("Profil zaktualizowany");
        reset({
          email: user?.email ?? "",
          currentPassword: "",
          newPassword: "",
        });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas aktualizacji profilu"
        );
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      email: user?.email ?? "",
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileFormData) => {
    // Build the request body - only include password if provided
    const requestBody: any = {
      email: data.email,
    };

    // Only include password if both current and new password are provided
    if (data.currentPassword && data.newPassword) {
      requestBody.password = data.newPassword;
    }

    updateMutation.mutate({ data: requestBody });
  };

  const handleReset = () => {
    reset({
      email: user?.email ?? "",
      currentPassword: "",
      newPassword: "",
    });
    toast.info("Zresetowano zmiany");
  };
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
              onClick={handleReset}
              type="button"
              disabled={updateMutation.isPending}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-3"
              onClick={handleSubmit(onSubmit)}
              type="button"
              disabled={updateMutation.isPending}
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              {loading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </>
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
                  <>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...register("currentPassword")}
                      className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.currentPassword.message}
                      </p>
                    )}
                  </>
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
                  <>
                    <Input
                      id="newPassword"
                      type="password"
                      {...register("newPassword")}
                      className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
        <Button className="w-full h-11 font-semibold">Zaktualizuj hasło</Button>
      </CardContent>
    </Card>
  );
}
