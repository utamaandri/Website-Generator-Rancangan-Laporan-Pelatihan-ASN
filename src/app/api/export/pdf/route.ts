import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

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

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const pdf = new PDFDocument({ margin: 50, size: "A4" });

    pdf.on("data", (chunk: Buffer) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);

    pdf.fontSize(16).font("Helvetica-Bold");
    pdf.text(doc.title || `Dokumen ${doc.trainingType.name}`, { align: "center" });
    pdf.moveDown();

    pdf.fontSize(11).font("Helvetica");
    pdf.text(`Nama: ${doc.namaPeserta || "-"}`);
    pdf.text(`Instansi: ${doc.instansi || "-"}`);
    pdf.text(`Jabatan: ${doc.jabatan || "-"}`);
    pdf.text(`Isu: ${doc.isuTerpilih || "-"}`);
    pdf.moveDown();

    for (const section of doc.sections) {
      pdf.fontSize(13).font("Helvetica-Bold");
      pdf.text(section.title);
      pdf.moveDown(0.5);
      pdf.fontSize(11).font("Helvetica");
      const lines = section.content.split("\n");
      for (const line of lines) {
        pdf.text(line, { align: "justify" });
      }
      pdf.moveDown();
    }

    pdf.end();
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="dokumen-${doc.id}.pdf"`,
    },
  });
}
