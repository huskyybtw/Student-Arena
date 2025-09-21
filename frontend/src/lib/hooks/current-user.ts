import { useEffect, useState } from "react";
import { useAuthControllerMe } from "@/lib/auth/auth";
import type { AuthUserDto } from "@/lib/model/authUserDto";
import { useAuthToken } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCurrentUser() {
  const token = useAuthToken();
  console.log(token);
  const router = useRouter();

  const query = useAuthControllerMe({
    query: {
      enabled: !!token,
      staleTime: 5 * 60 * 1000,
    },
  });

  useEffect(() => {
    if (!query.isFetching && (query.isError || !query.data?.data)) {
      setTimeout(() => {
        toast.error("Session expired. Please log in again.");
        router.replace("/auth");
      }, 0);
    }
  }, [query.isFetching, query.isError, query.data, router]);

  return {
    user: query.data?.data ?? null,
    isLoading: query.isFetching || !token,
    isError: query.isError,
    error: query.error,
  };
}
