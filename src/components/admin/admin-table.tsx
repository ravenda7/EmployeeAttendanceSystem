"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AdminDialog from "./add-admin-dialog"
import { useConfirmDialog } from "@/context/confirm-dialog-context"
import { toast } from "sonner"
import { Search, SquarePen, Trash2 } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination"


type Admin = {
  id: string
  name: string
  email: string
}

export default function AdminTable() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
   const confirm = useConfirmDialog();

  const { data, isLoading } = useQuery({
    queryKey: ["admins", search, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin?search=${search}&page=${page}&limit=3`)
      return res.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      toast.success("Admin deleted successfully")
    },
  })

  const handleDelete = async (id:string, name:string) => {
    const ok = await confirm({
      title: `Delete "${name}"`,
      description: "Are you sure you want to delete this admin? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="w-full relative">
          <Search className="absolute top-2 left-2" />
        <Input
          placeholder="Search admins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9"
        />
        </div>
        <AdminDialog open={openDialog} onOpenChange={setOpenDialog} defaultValues={selectedAdmin ?? undefined}>
          <Button onClick={() => { setSelectedAdmin(null); setOpenDialog(true) }}>
            Add Admin
          </Button>
        </AdminDialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
          ) : (
            data?.data?.map((admin: Admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell className="text-right space-x-2">
                  <AdminDialog
                    open={openDialog && selectedAdmin?.id === admin.id}
                    onOpenChange={(open: boolean) => {
                      setOpenDialog(open)
                      if (!open) setSelectedAdmin(null)
                    }}
                    defaultValues={admin}
                  >
                    <Button variant="icon"
                     className="hover:text-sky-600"
                     onClick={() => { setSelectedAdmin(admin); setOpenDialog(true) }}>
                      <SquarePen />
                    </Button>
                  </AdminDialog>
                  <Button
                    variant="icon"
                    onClick={() => handleDelete(admin.id, admin.name)}
                  >
                     <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {data && (
        <Pagination>
          <PaginationContent className="flex justify-end w-full">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: Math.ceil(data.total / 3) }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={i + 1 === page}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage((prev) =>
                    prev < Math.ceil(data.total / 3) ? prev + 1 : prev
                  )
                }
                className={
                  page >= Math.ceil(data.total / 3)
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
