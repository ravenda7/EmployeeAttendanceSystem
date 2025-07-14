export type Employee = {
    id: string;
    name: string;
    email: string;
    department: number;
    attendance: number;
    avatarUrl?: string;
}

interface Department {
  id: number;
  name: string;
  adminId: number;
  createdAt: string;
  updatedAt: string;
}

interface GetEmployees {
  id: number;
  email: string;
  password: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  departmentId: number;
  faceDescriptor: number[];
  createdAt: string;
  updatedAt: string;
  department: Department;
}

export interface GetEmployeeAPIResponse {
    data: GetEmployees[];
    total: number;
    page: number;
    limit: number;
}

export type EmployeeFilter = {
    searchTerm?: string | '';
    department?: number | '';
    page?: number | 1;
    limit?: number | 10;
}