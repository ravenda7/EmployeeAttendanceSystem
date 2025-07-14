'use client'
import { SiteHeader } from "@/components/admin/site-header"
import ImageUpload from "@/components/employee/image-upload"
import FacialDataCapture from "@/components/face-recognition-modal/facial-data-capture"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Camera, MoveLeft } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const employeeSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    departmenId: z.number().int().positive(),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

export default function NewEmployeePage() {
    const [facialData, setFacialData] = useState<number[] | null>(null);
    const [showFacialCapture, setShowFacialCapture] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            departmenId: 0
        }
    })

    const { data: departments } = useQuery({
        queryKey: ["departments"],
        queryFn: async () => {
        const res = await fetch(`/api/departments`)
            return res.json()
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: EmployeeFormData) => {
        if (!facialData || facialData.length === 0) {
            throw new Error("Facial data is required");
        }
        if (!image) {
            throw new Error("Profile image is required");
        }

        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("name", data.name);
        formData.append("departmentId", String(data.departmenId));
        formData.append("faceDescriptor", JSON.stringify(facialData));
        formData.append("image", image); // File object

        const response = await fetch("/api/employees", {
            method: "POST",
            body: formData, // No Content-Type here! Let browser set it.
        });

        if (!response.ok) {
            throw new Error("Failed to create employee");
        }

        return response.json();
        },
        onSuccess: () => {
            toast.success("Employee created successfully");
            queryClient.invalidateQueries({ queryKey: ["admins"] });
            reset();
            setFacialData(null);
            setShowFacialCapture(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create employee");
        }
    })

    const handleFacialDataCapture = (data: number[]) => {
        setFacialData(data);
        setShowFacialCapture(false);
        toast.success("Employee's facial features have been successfully recorded.");
    };
    
    const onSubmit = (data: EmployeeFormData) => {
        mutation.mutate(data);
    }
    return (
        <>
        <SiteHeader title="Manage Admin Accounts" />
        <div className="flex flex-col gap-5 px-4">
           <div className="flex items-center gap-6">
                <Button variant='ghost' onClick={() => window.history.back()}>
                    <MoveLeft />
                    <p>Back</p>
                </Button>
                <p className="text-lg font-semibold text-slate-950">
                    Create employee profile with facial recognition setup
                </p>
           </div>
           <div className="flex flex-col gap-4 px-6">
                <form className="flex flex-col gap-y-6"
                onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                        <div className="space-y-4 flex-1">
                            <Label>Employee Name</Label>
                            <Input placeholder="Enter Employee Name"
                            className=""
                            {...register("name")}  />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-4 flex-1">
                            <Label>Email</Label>
                            <Input placeholder="Enter Email"
                            className=""
                            {...register("email")}  />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                        <div className="space-y-4 flex-1">
                            <Label>Password</Label>
                            <Input placeholder="Enter Password"
                            className=""
                            {...register("password")}  />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-4 flex-1">
                            <Label>Department</Label>
                            <Select  onValueChange={(value) => setValue("departmenId", Number(value))}>
                                <SelectTrigger className="w-full" >
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments?.data?.map((department: any) => (
                                        <SelectItem key={department.id} value={String(department.id)}>
                                            {department.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.departmenId && <p className="text-red-500 text-sm">{errors.departmenId.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-4 flex-1">
                        <Label>Profile Picture</Label>
                        <ImageUpload 
                            image={image}
                            setImage={setImage}
                        />
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                            <CardTitle className="flex items-center">
                                <Camera className="w-5 h-5 mr-2" />
                                Facial Recognition Setup
                            </CardTitle>
                            </CardHeader>
                            <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                Capture the employee's facial features for secure attendance tracking.
                                </p>

                                {!facialData ? (
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Camera className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <Button 
                                    type="button"
                                    onClick={() => setShowFacialCapture(true)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Capture Facial Data
                                    </Button>
                                </div>
                                ) : (
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    </div>
                                    <p className="text-green-600 font-medium mb-2">✓ Facial Data Captured</p>
                                    <p className="text-sm text-gray-600 mb-4">
                                    {facialData.length} facial features recorded
                                    </p>
                                    <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowFacialCapture(true)}
                                    >
                                    Recapture
                                    </Button>
                                </div>
                                )}

                                <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Ensure good lighting conditions</li>
                                    <li>• Look directly at the camera</li>
                                    <li>• Keep a neutral expression</li>
                                    <li>• Remove glasses if possible</li>
                                    <li>• Multiple angles will be captured</li>
                                </ul>
                                </div>
                            </div>
                            </CardContent>
                        </Card>

                        {/* Facial Data Capture Modal */}
                        <FacialDataCapture
                        isOpen={showFacialCapture}
                        onClose={() => setShowFacialCapture(false)}
                        onDataCaptured={handleFacialDataCapture}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Create Employee
                    </Button>
                </form>
           </div>
        </div>
        </>
    )
}