
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const admin = await db.admin.findUnique({
    where: { id: parseInt(session.user.id) },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!admin) {
    return new NextResponse("Admin not found", { status: 404 });
  }

  return NextResponse.json(admin);
}
