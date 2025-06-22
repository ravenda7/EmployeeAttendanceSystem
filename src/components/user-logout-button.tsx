'use client'

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function LogOutButton() {
  return (
    <Button variant="ghost" size="sm" onClick={() => 
    signOut(
        {
            redirect: true,
            callbackUrl: `${window.location.origin}/sign-in`,
      })}>
      <LogOut />
      Log out
    </Button>
  );
}