"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner } from "@chakra-ui/react";
import useAuth from "@/app/hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
