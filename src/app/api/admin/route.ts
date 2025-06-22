// app/api/admin/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcrypt"
import { db } from "@/lib/db"

const adminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = adminSchema.parse(body)

    const existing = await db.admin.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const admin = await db.admin.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    })

    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.errors : "Server error" }, { status: 500 })
  }
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")

  const where = {
    OR: [
      { name: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
    ],
  }

  const [admins, total] = await Promise.all([
    db.admin.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.admin.count({ where }),
  ])

  return NextResponse.json({ data: admins, total })
}
