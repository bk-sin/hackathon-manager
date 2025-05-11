"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function useSyncUser() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/sync-user", { method: "POST" });
    }
  }, [isSignedIn]);
}
