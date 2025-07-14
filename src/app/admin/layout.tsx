"use client";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { Loader } from "@/components/loader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ConfirmDialogProvider } from "@/context/confirm-dialog-context";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   const { data: session, status } = useSession();
    const router = useRouter();
  
    useEffect(() => {
      if (status === 'loading') return;
      if (!session || !session.user) {
        router.push('/');
      }
    }, [session, status, router]);
  
    if (status === 'loading') {
      return (
      <div className="flex h-screen w-full justify-center items-center">
        <Loader />
      </div>
      );
    }
  
    if (!session || !session.user) {
      return null;
    }
  return (
    <ConfirmDialogProvider>
   <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }
   >
    <AppSidebar variant="inset" />
    <SidebarInset>
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        {children}
      </div>
    </div>
    </SidebarInset>
   </SidebarProvider>
   </ConfirmDialogProvider>
  );
}