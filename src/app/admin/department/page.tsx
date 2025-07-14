"use client";
import { SiteHeader } from "@/components/admin/site-header";
import { Loader } from "@/components/loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import DepartmentTable from "@/components/department/department-table";

export default function ManageAdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

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
    <SiteHeader title="Manage Departments" />
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-2">
        <div className="px-4 lg:px-6">
            <div>
            <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-md" />}>
                <DepartmentTable />
            </Suspense>
            </div>
        </div>
    </div>
    </>
  );
}