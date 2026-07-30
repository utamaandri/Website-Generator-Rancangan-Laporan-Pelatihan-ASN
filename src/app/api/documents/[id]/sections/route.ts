import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { sections } = await req.json();

  for (const sec of sections) {
    if (sec.id) {
      await prisma.documentSection.update({
        where: { id: sec.id },
        data: { content: sec.content },
      });
    }
  }

  await prisma.document.update({
    where: { id },
    data: { status: "draft" },
  });

  return NextResponse.json({ success: true });
}
