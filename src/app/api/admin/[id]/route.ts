import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await  context.params
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const updated = await db.admin.update({
      where: { id: parseInt(id) },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof z.ZodError ? error.errors : "Something went wrong" },
      { status: 500 }
    )
  }
}


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params 

  try {
    await db.admin.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: "Deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}


