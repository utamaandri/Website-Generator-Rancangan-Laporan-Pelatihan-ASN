import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");

  if (!docId) {
    return NextResponse.json({ error: "docId required" }, { status: 400 });
  }

  const doc = await prisma.document.findFirst({
    where: { id: docId, userId: (session.user as any).id },
    include: { sections: { orderBy: { order: "asc" } }, trainingType: true },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let docxContent = `DOKUMEN ${doc.trainingType.name}\r\n\r\n`;
  docxContent += `Nama: ${doc.namaPeserta || "-"}\r\n`;
  docxContent += `Instansi: ${doc.instansi || "-"}\r\n`;
  docxContent += `Jabatan: ${doc.jabatan || "-"}\r\n`;
  docxContent += `Isu: ${doc.isuTerpilih || "-"}\r\n\r\n`;

  for (const section of doc.sections) {
    docxContent += `${section.title}\r\n${"=".repeat(section.title.length)}\r\n`;
    docxContent += `${section.content.replace(/\n/g, "\r\n")}\r\n\r\n`;
  }

  const buffer = Buffer.from(docxContent, "utf-8");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="dokumen-${doc.id}.docx"`,
    },
  });
}
