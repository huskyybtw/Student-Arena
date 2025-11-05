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
import { useEffect } from "react";
import { toast } from "sonner";
import { AuthUserResponseDto } from "@/lib/api/model/authUserResponseDto";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  studentInfoSchema,
  StudentInfoFormData,
} from "@/lib/validators/studentInfoSchema";

export function StudentInfoCard({
  loading,
  user,
}: {
  loading: boolean;
  user: AuthUserResponseDto | null | undefined;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentInfoFormData>({
    resolver: yupResolver(studentInfoSchema) as any,
    defaultValues: {
      university: "",
      faculty: "",
      year: "",
      studentId: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        university: "",
        faculty: "",
        year: "",
        studentId: "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: StudentInfoFormData) => {
    console.log("Saving student info", data);
    toast.success("Dane studenckie zaktualizowane");
  };

  const handleReset = () => {
    reset({
      university: "",
      faculty: "",
      year: "",
      studentId: "",
    });
    toast.info("Zresetowano zmiany");
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
              type="button"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-3"
              onClick={handleSubmit(onSubmit)}
              type="button"
            >
              <Save className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Dane dotyczące Twojej uczelni i studiów
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="university" className="text-sm font-medium">
                Uczelnia
              </Label>
              {loading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <>
                  <Input
                    id="university"
                    placeholder="np. Uniwersytet Warszawski"
                    {...register("university")}
                    className="h-11 bg-background border-2 border-border focus:border-primary"
                  />
                  {errors.university && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.university.message}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="faculty" className="text-sm font-medium">
                Wydział
              </Label>
              {loading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <>
                  <Input
                    id="faculty"
                    placeholder="np. Informatyka"
                    {...register("faculty")}
                    className="h-11 bg-background border-2 border-border focus:border-primary"
                  />
                  {errors.faculty && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.faculty.message}
                    </p>
                  )}
                </>
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
                <>
                  <Input
                    id="year"
                    placeholder="np. 2"
                    {...register("year")}
                    className="h-11 bg-background border-2 border-border focus:border-primary"
                  />
                  {errors.year && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.year.message}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="studentId" className="text-sm font-medium">
                Numer indeksu
              </Label>
              {loading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <>
                  <Input
                    id="studentId"
                    placeholder="123456"
                    {...register("studentId")}
                    className="h-11 bg-background border-2 border-border focus:border-primary"
                  />
                  {errors.studentId && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.studentId.message}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
