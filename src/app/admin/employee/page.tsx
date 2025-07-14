'use client';
import { SiteHeader } from "@/components/admin/site-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Search, SquarePen, Trash2, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmployeeFilter, GetEmployeeAPIResponse} from "@/types/employee.type";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination"
import { Loader } from "@/components/loader";



export default function EmployeePage() {
    const [filters, setFilters] = useState<EmployeeFilter>({
        searchTerm: '',
        department: '',
        page: 1,
        limit: 10
    });
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { data: employees, isPending } = useQuery<GetEmployeeAPIResponse>({
        queryKey: ['employees', filters],
        queryFn: async () => {
            const res = await fetch(`/api/employees?search=${filters.searchTerm}&department=${filters.department}&page=${filters.page}&limit=${filters.limit}`);
            if (!res.ok) throw new Error('Failed to fetch employees');
            return res.json();
        },
    })

    //Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchInput]);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            searchTerm: debouncedSearch,
            page: 1 // Reset to first page on search change
        }));
    }, [debouncedSearch]);


    // Name Shortener
    function shortenName(fullName: string): string {
    const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
    return nameParts
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
    }


        const handlePageChange = (page: number) => {
        setFilters((prev) => ({
            ...prev,
            page: page,
        }));
    }

    const totalPages = employees?.total ? Math.ceil(employees.total / employees.limit) : 0;

    return (
        <>
        <SiteHeader title="Manage Profile" />
        <div>
            <div className="flex flex-col gap-y-6 py-4 md:py-2">
                <div className="px-4 lg:px-6 flex items-center justify-between">
                    <div>
                        <p className="text-lg font-semibold">Employee Management</p>
                        <p className="text-sm text-muted-foreground">Manage employee profiles, attendance, and more.</p>
                    </div>

                    <Link href="/admin/employee/new">
                        <Button className="cursor-pointer" >Create Employee</Button>
                    </Link>
                </div>

                <div  className="px-4 lg:px-6 w-full">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div className="w-full relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Search...." className="pl-10" />
                            </div>
                            <Select>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Employees</SelectItem>
                                    <SelectItem value="active">Active Employees</SelectItem>
                                    <SelectItem value="inactive">Inactive Employees</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="border-t-1 border-gray-200 border-b-1 py-2">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead><Checkbox /></TableHead>
                                <TableHead className="pl-4">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead className="text-right pr-5">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {isPending ? ( 
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6">
                                    <Loader className="mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees?.data?.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell className="w-4">
                                    <Checkbox />
                                </TableCell>
                                <TableCell className="pl-4">
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            <AvatarFallback>{shortenName(employee.name)}</AvatarFallback>
                                            <AvatarImage src={employee.avatarUrl || undefined} alt={employee.name}
                                            className="object-cover" />
                                        </Avatar>
                                        <span>{employee.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {employee.email}
                                </TableCell>
                                <TableCell>
                                    {employee.department.name}
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                </TableCell>
                                <TableCell className="flex justify-end">
                                    <Link href="" >
                                        <Button variant="icon" className="hover:text-sky-600">
                                            <SquarePen />
                                        </Button>
                                    </Link> 
                                    <Link href="" >
                                        <Button variant="icon" className="hover:text-red-600">
                                            <Trash2 />
                                        </Button>
                                    </Link> 
                                </TableCell>
                            </TableRow>
                            )))}
                        {employees && employees.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-2">
                                <div className="text-center py-12">
                                    <User className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No employee found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                    {searchInput ? 'Try adjusting your search terms.' : 'Get started by adding your first student.'}
                                    </p>
                                </div>
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </CardContent>
                    <CardFooter>
                        {/* Pagination Controls */}
                        {employees && employees.total > employees.limit && (
                        <div className="flex items-center justify-center -mt-2 w-full">
                            <div className="flex items-center justify-between gap-2 w-full">
                                <Button
                                variant="outline"
                                onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                                disabled={filters.page === 1}
                                className="text-[12px]"
                                >   
                                    <ArrowLeft className=" h-2 w-2" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-2">
                                {(() => {
                                    const pages = [];
                                    const maxSide = 3;
                                    const current = filters.page ?? 1;

                                    // Always show first 3
                                    for (let i = 1; i <= Math.min(maxSide, totalPages); i++) {
                                    pages.push(i);
                                    }

                                    // Show ... if needed before middle
                                    if (current > maxSide + 2) {
                                    pages.push("left-ellipsis");
                                    }

                                    // Show middle page(s)
                                    const startMiddle = Math.max(current - 1, maxSide + 1);
                                    const endMiddle = Math.min(current + 1, totalPages - maxSide);

                                    for (let i = startMiddle; i <= endMiddle; i++) {
                                    if (i > maxSide && i < totalPages - maxSide + 1) {
                                    pages.push(i);
                                    }
                                    }

                                    // Show ... if needed after middle
                                    if (current < totalPages - maxSide - 1) {
                                    pages.push("right-ellipsis");
                                    }

                                    // Always show last 3
                                    for (
                                    let i = Math.max(totalPages - maxSide + 1, maxSide + 1);
                                    i <= totalPages;
                                    i++
                                    ) {
                                    if (i > maxSide) pages.push(i);
                                    }

                                    return pages.map((page, idx) =>
                                    typeof page === "number" ? (
                                    <Button
                                    key={page}
                                    variant={filters.page === page ? "secondary" : "ghost"}
                                    onClick={() => handlePageChange(page)}
                                    className="text-[12px]"
                                    >
                                    {page}
                                    </Button>
                                    ) : (
                                    <span key={page + idx} className="px-2 select-none">
                                    ...
                                    </span>
                                    )
                                    );
                                })()}
                                </div>
                                <Button
                                variant="outline"
                                onClick={() => handlePageChange((filters.page ?? 1) + 1)}
                                disabled={filters.page === totalPages}
                                className="text-[12px]"
                                >
                                Next
                                <ArrowRight className="h-2 w-2" />
                                </Button>
                            </div>
                        </div>
                        )}
                    </CardFooter>
                </Card>
                </div>
            </div>
        </div>
        </>
    )
}