"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
})

type AdminFormData = z.infer<typeof schema>

type Props = {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: {
    id?: string
    name: string
    email: string
  }
}

export default function AdminDialog({ children, open, onOpenChange, defaultValues }: Props) {
  const isEdit = !!defaultValues?.id
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
    })
  }, [defaultValues, reset])

  const mutation = useMutation({
    mutationFn: async (data: AdminFormData) => {
      const url = isEdit ? `/api/admin/${defaultValues!.id}` : "/api/admin"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Request failed")
      }

      return res.json()
    },
    onSuccess: () => {
      toast(isEdit ? "Admin updated" : "Admin created" )
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      onOpenChange(false)
      reset()
    },
    onError: (error: any) => {
      toast(error.message )
    },
  })

  const onSubmit = (data: AdminFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Admin" : "Add Admin"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update admin details." : "Add a new admin account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Name" {...register("name")} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}

          <Input placeholder="Email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}

          {!isEdit && (
            <>
              <Input placeholder="Password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
