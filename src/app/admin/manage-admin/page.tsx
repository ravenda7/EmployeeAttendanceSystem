"use client";
import AddAdminDialog from "@/components/admin/add-admin-dialog";
import { SiteHeader } from "@/components/admin/site-header";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import AdminTable from "@/components/admin/admin-table";

export default function ManageAdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user) {
        router.push('/');
    }
    }, [session, status, router]);
    

    if (status === 'loading') {
    return <Loader />;
    }

    if (!session || !session.user) {
    return null;
    }
  return (
    <>
    <SiteHeader title="Manage Admin Accounts" />
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-2">
        <div className="px-4 lg:px-6">
            <div>
            <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-md" />}>
                <AdminTable />
            </Suspense>
            </div>
        </div>
    </div>
    </>
  );
}