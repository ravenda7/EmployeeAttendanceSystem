"use client";
import { useQuery } from "@tanstack/react-query";

export function useAdminProfile() {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const res = await fetch("/api/admin/me");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });
}
