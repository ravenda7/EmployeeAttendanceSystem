// /app/api/employees/route.ts
import { db } from "@/lib/db";
import { NextResponse } from 'next/server';
import bcrypt from "bcrypt"
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const departmentId = parseInt(formData.get("departmentId") as string);
    const faceDescriptor = JSON.parse(formData.get("faceDescriptor") as string);
    const image = formData.get("image") as File;

    if (!email || !password || !name || !faceDescriptor || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await db.employee.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save image to /public/uploads/
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${name.replace(/\s+/g, "-")}.jpg`;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);
    await writeFile(filePath, buffer);

    const employee = await db.employee.create({
      data: {
        email,
        password: hashedPassword,
        name,
        departmentId,
        faceDescriptor,
        avatarUrl: `/uploads/${fileName}`, // save relative path
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}


// export async function POST(req: Request) {

//     try {
//         const body = await req.json();
//         const { email, password, name, departmenId, faceDescriptor } = body;

//         const existing = await db.employee.findUnique({ where: { email: email } })
//         if (existing) {
//             return NextResponse.json({ error: "Email already exists" }, { status: 400 })
//         }
//         const hashedPassword = await bcrypt.hash(password, 10)

//         const newEmployee = await db.employee.create({
//             data: {
//             email,
//             password:hashedPassword,
//             name,
//             departmentId: departmenId,
//             faceDescriptor,
//             },
//         });

//         return NextResponse.json(newEmployee, { status: 201 });
//     } catch (error) {
//         return NextResponse.json({ error: `${error}` }, { status: 500 })
//     }
// }


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const department = searchParams.get("department");

    const where = {
        name: { contains: search, mode: "insensitive" as const },
        ...(department && { departmentId: parseInt(department) }),
    };

    const [employees, total] = await Promise.all([
        db.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          department: true, // ✅ include full department details
        },
      }),
        db.employee.count({ where }),
    ]);

    return NextResponse.json({ data:employees, total, page, limit }, { status: 200 });
}