import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LoginFormData, loginSchema } from "@/app/auth/authSchema";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useAuthControllerLogin } from "@/lib/auth/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
interface LoginFormProps {
  onToggle: () => void;
}

export function LoginForm({ onToggle }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const router = useRouter();
  const loginMutation = useAuthControllerLogin();

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          Cookies.set("accessToken", response.data.accessToken);
          reset();
          router.push("/settings");
        },
        onError: (error: any) => {
          alert(error?.response?.data?.message || "Błąd logowania");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardContent className="space-y-3 px-6 pb-6">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {touchedFields?.email && errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password" className="text-sm font-medium">
            Hasło
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Twoje hasło"
              className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
              autoComplete="current-password"
              {...register("password")}
            />
          </div>
          {touchedFields?.password && errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Zapomniałeś hasła?
          </Link>
        </div>
        <Button
          className="w-full h-11 font-semibold mt-4"
          type="submit"
          disabled={isSubmitting}
        >
          Zaloguj się
        </Button>
        <div className="text-center text-sm text-muted-foreground pt-2">
          Nie masz konta?{" "}
          <button
            type="button"
            onClick={onToggle}
            className="text-primary hover:underline font-medium"
          >
            Zarejestruj się
          </button>
        </div>
      </CardContent>
    </form>
  );
}
