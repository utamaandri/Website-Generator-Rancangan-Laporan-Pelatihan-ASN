import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

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

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: doc.title || `Dokumen ${doc.trainingType.name}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { after: 200 } })
  );

  const infoItems = [
    { label: "Nama", value: doc.namaPeserta },
    { label: "Instansi", value: doc.instansi },
    { label: "Jabatan", value: doc.jabatan },
    { label: "Isu", value: doc.isuTerpilih },
  ];

  for (const item of infoItems) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${item.label}: `, bold: true }),
          new TextRun(item.value || "-"),
        ],
        spacing: { after: 60 },
      })
    );
  }

  children.push(new Paragraph({ spacing: { after: 200 } }));

  for (const section of doc.sections) {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );

    const lines = section.content.split("\n");
    for (const line of lines) {
      if (line.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun(line)],
            spacing: { after: 80 },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
    }
  }

  const docx = new Document({
    title: doc.title || "Dokumen",
    description: `Dokumen ${doc.trainingType.name}`,
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24 },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(docx);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="dokumen-${doc.id}.docx"`,
    },
  });
}
