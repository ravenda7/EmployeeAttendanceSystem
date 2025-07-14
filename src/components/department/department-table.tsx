"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import DepartmentDialog from "./add-department-dialog"


type Department = {
  id: string
  name: string
}

export default function DepartmentTable() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
   const confirm = useConfirmDialog();

  const { data, isLoading } = useQuery({
    queryKey: ["department", search, page],
    queryFn: async () => {
      const res = await fetch(`/api/departments?search=${search}&page=${page}&limit=3`)
      return res.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department"] })
      toast.success("Department deleted successfully")
    },
  })

  const handleDelete = async (id:string, name:string) => {
    const ok = await confirm({
      title: `Delete "${name}"`,
      description: "Are you sure you want to delete this department? This action cannot be undone.",
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
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9"
        />
        </div>
        <DepartmentDialog open={openDialog} onOpenChange={setOpenDialog} defaultValues={selectedDepartment ?? undefined}>
          <Button onClick={() => { setSelectedDepartment(null); setOpenDialog(true) }}>
            Add Department
          </Button>
        </DepartmentDialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SN</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
          ) : (
            data?.data?.map((department: Department, index:number) => (
              <TableRow key={department.id}>
                <TableCell>{index+1}</TableCell>
                <TableCell>{department.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <DepartmentDialog
                    open={openDialog && selectedDepartment?.id === department.id}
                    onOpenChange={(open: boolean) => {
                      setOpenDialog(open)
                      if (!open) setSelectedDepartment(null)
                    }}
                    defaultValues={department}
                  >
                    <Button variant="icon"
                     className="hover:text-sky-600"
                     onClick={() => { setSelectedDepartment(department); setOpenDialog(true) }}>
                      <SquarePen />
                    </Button>
                  </DepartmentDialog>
                  <Button
                    variant="icon"
                    onClick={() => handleDelete(department.id, department.name)}
                  >
                     <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
          {!data?.data?.length && !isLoading && (
            <TableRow>
              <TableCell colSpan={3} className="text-center h-[120px] font-semibold text-gray-600">
                No Departments found
              </TableCell>
            </TableRow>
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
