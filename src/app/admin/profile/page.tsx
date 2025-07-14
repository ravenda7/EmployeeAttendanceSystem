'use client';

import { SiteHeader } from '@/components/admin/site-header';
import { Loader } from '@/components/loader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EditProfileForm from '@/components/form/edit-profile-form';
import { useQuery } from '@tanstack/react-query';
import ChangePasswordForm from '@/components/form/change-password-form';

export default function AdminProfile() {
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
    const { data } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const res = await fetch("/api/admin/me");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
  });


  return (
    <>
      <SiteHeader title="Manage Profile" />
      <div className="flex flex-col gap-4 py-4 md:gap-2 md:py-2">
        <div className="px-4 lg:px-6">
          <Tabs defaultValue="account" className="w-full sm:w-[60%]">
            <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className='w-full'>
                <EditProfileForm
                    id={data.id}
                    name={data.name || ''}
                    email={data.email || ''}
                />
            </TabsContent>
            <TabsContent value="password">
              <ChangePasswordForm id={data.id} />
            </TabsContent>
            </Tabs>
        </div>
      </div>
    </>

  );
}
