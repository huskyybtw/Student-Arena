import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, School, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { SignupFormData, signupSchema } from "@/lib/validators/authSchema";
import { useAuthControllerRegister } from "@/lib/api/auth/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
interface RegisterFormProps {
  onToggle: () => void;
}

export function RegisterForm({ onToggle }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    reset,
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      username: "",
      university: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const router = useRouter();
  const singupMutation = useAuthControllerRegister();
  const onSubmit = async (data: SignupFormData) => {
    singupMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          Cookies.set("accessToken", response.data.accessToken);
          reset();
          router.push("/settings");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Błąd rejestracji");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardContent className="space-y-3 px-6 pb-6">
        <div className="space-y-1">
          <Label htmlFor="username" className="text-sm font-medium">
            Nazwa użytkownika
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              placeholder="Twoja nazwa gracza"
              className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
              autoComplete="username"
              {...register("username")}
            />
          </div>
          {touchedFields?.username && errors.username && (
            <p className="text-xs text-red-500 mt-1">
              {errors.username.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="university" className="text-sm font-medium">
            Uczelnia
          </Label>
          <div className="relative">
            <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="university"
              placeholder="Nazwa twojej uczelni"
              className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
              autoComplete="organization"
              {...register("university")}
            />
          </div>
          {touchedFields?.university && errors.university && (
            <p className="text-xs text-red-500 mt-1">
              {errors.university.message}
            </p>
          )}
        </div>
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
              autoComplete="new-password"
              {...register("password")}
            />
          </div>
          {touchedFields?.password && errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Potwierdź hasło
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Powtórz hasło"
              className="pl-10 h-11 bg-background border-2 border-border focus:border-primary"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </div>
          {touchedFields?.confirmPassword && errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button
          className="w-full h-11 font-semibold mt-4"
          type="submit"
          disabled={isSubmitting}
        >
          Utwórz konto
        </Button>
        <div className="text-center text-sm text-muted-foreground pt-2">
          Masz już konto?{" "}
          <button
            type="button"
            onClick={onToggle}
            className="text-primary hover:underline font-medium"
          >
            Zaloguj się
          </button>
        </div>
      </CardContent>
    </form>
  );
}
