import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(1),
  adminId: z.number(),
});

// POST - Create a department
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = departmentSchema.parse(body);

    data.name = data.name.trim();

    const existing = await db.department.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Department already exists" }, { status: 400 });
    }

    const department = await db.department.create({ data });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof z.ZodError ? error.errors : "Server error" },
      { status: 500 }
    );
  }
}


// GET - List departments with pagination and search
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const where = {
    name: { contains: search, mode: "insensitive" as const },
  };

  const [departments, total] = await Promise.all([
    db.department.findMany({
      where,
      include: { admin: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.department.count({ where }),
  ]);

  return NextResponse.json({ data: departments, total });
}