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
import { optional, z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

const schema = z.object({
  name: z.string().min(1),
  id: z.string().optional(),
  adminId: z.number().optional(),
})

type DepartmentFormData = z.infer<typeof schema>

type Props = {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: {
    id?: string
    name: string
  }
}

export default function DepartmentDialog({ children, open, onOpenChange, defaultValues }: Props) {
  const { data: session } = useSession();
  const isEdit = !!defaultValues?.id
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DepartmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || "",
      id: defaultValues?.id || "",
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name || "",
    })
  }, [defaultValues, reset])

  const mutation = useMutation({
    mutationFn: async (data: DepartmentFormData) => {
      const url = isEdit ? `/api/departments/${defaultValues!.id}` : "/api/departments"
      const method = isEdit ? "PATCH" : "POST"

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
      toast(isEdit ? "Department Updated" : "Department created" )
      queryClient.invalidateQueries({ queryKey: ["department"] });
      onOpenChange(false)
      reset()
    },
    onError: (error: any) => {
      toast(error.message )
    },
  })

    const onSubmit = (data: DepartmentFormData) => {
    if (!isEdit && session?.user?.id) {
        data.adminId = parseInt(session.user.id);
    }
    mutation.mutate(data);
    };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Department" : "Add Department"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update Department." : "Add a new Department."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Name" {...register("name")} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
