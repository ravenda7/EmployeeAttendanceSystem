"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, ShieldUser, Users, Building2 } from 'lucide-react';
import { NavMain } from "./nav-main";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { NavUser } from "./nav-user";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader } from "../loader";
import { useAdminProfile } from "@/hooks/use-admin-profile";


const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Manage Admins",
      url: "/admin/manage-admin",
      icon: ShieldUser,
    },
    {
      title: "All Employees",
      url: "#",
      icon: Users,
    },
    {
      title: "Departments",
      url: "#",
      icon: Building2,
    },
  ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: profile, isLoading } = useAdminProfile();
  const router = useRouter();

  // Optional: Still use session for auth check
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user) {
      router.push("/");
    }
  }, [session, status, router]);

  if (isLoading || status === "loading") {
    return <Loader />;
  }

  if (!session || !session.user || !profile) {
    return null;
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 h-12"
            >
              <Link
                href="/admin/dashboard"
                className="flex items-center justify-between gap-2 px-2"
              >
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="w-28 h-28"
                />
                <Badge variant="secondary">Admin</Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: profile.name ?? "",
            email: profile.email ?? "",
            avatar: profile.name ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}