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
      url: "/admin/employee",
      icon: Users,
    },
    {
      title: "Departments",
      url: "/admin/department",
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

  // if (isLoading || status === "loading") {
  //   return <Loader />;
  // }

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
                className="flex items-center gap-4"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-sm text-center px-3 py-2">
                  <span className="text-white text-2xl font-bold">AT</span>
                </div>
                <div className="flex flex-col gap-1">
                <h2 className="text-gray-950 font-semibold text-lg">Attendlytics</h2>
                <Badge variant="secondary" className="text-[10px]">Admin Panel</Badge>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        { isLoading ? (
          <Loader />
        )
        :(
        <NavUser
          user={{
            name: profile.name ?? "",
            email: profile.email ?? "",
            avatar: profile.name ?? "",
          }}
        />)}
      </SidebarFooter>
    </Sidebar>
  );
}