import { NextRequest, NextResponse } from "next/server";
import { hash, compare } from "bcrypt";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  oldPassword: z.string().min(6, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body = await req.json();
    const { oldPassword, newPassword } = schema.parse(body);

    const user = await db.admin.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isPasswordValid = await compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Old password is incorrect" },
        { status: 401 }
      );
    }

    const hashedNewPassword = await hash(newPassword, 10);

    const updated = await db.admin.update({
      where: { id: parseInt(id) },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({
      message: "Password updated successfully",
      userId: updated.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof z.ZodError ? error.errors : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
