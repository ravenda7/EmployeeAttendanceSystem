"use client";
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const EditProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
})

type AdminProps = {
    id: string;
    name: string;
    email: string;
}

type AdminProfileFormData = z.infer<typeof EditProfileSchema>

export default function EditProfileForm({id, name, email}: AdminProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminProfileFormData>({
        resolver: zodResolver(EditProfileSchema),
        defaultValues: {
            name:  name || "",
            email: email ||"",
        },
    })
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: AdminProfileFormData) => {
            const response = await fetch(`/api/admin/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                throw new Error("Failed to update profile")
            }
            return response.json()
        },
        onSuccess: () => {
          toast.success("Profile updated successfully")
          queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to update profile")
        },
    })

    const onSubmit = (data: AdminProfileFormData) => {
        mutation.mutate(data)
    }
    return (
        <Card>
        <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Manage Your Profile here</CardDescription>
        </CardHeader>
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CardContent className="w-full space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input placeholder="Name" {...register("name")} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="Email">Email</Label>
                <Input placeholder="Email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
        </CardContent>
        <CardFooter className="flex justify-end">
           <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
            {mutation.isPending ? "Updating..." : "Update"}
           </Button>
        </CardFooter>
        </form>
        </Card>
    )
}