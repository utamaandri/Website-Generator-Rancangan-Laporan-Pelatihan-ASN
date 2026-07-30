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

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: 'Times New Roman', serif; padding: 2cm; }
h1 { text-align: center; font-size: 16pt; margin-bottom: 24pt; }
h2 { font-size: 14pt; margin-top: 18pt; }
p { font-size: 12pt; line-height: 1.5; text-align: justify; }
table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
td, th { border: 1px solid black; padding: 6pt; font-size: 11pt; }
</style>
</head>
<body>
<h1>${doc.title || "Dokumen " + doc.trainingType.name}</h1>
<p><strong>Nama:</strong> ${doc.namaPeserta || "-"}</p>
<p><strong>Instansi:</strong> ${doc.instansi || "-"}</p>
<p><strong>Jabatan:</strong> ${doc.jabatan || "-"}</p>
<p><strong>Isu:</strong> ${doc.isuTerpilih || "-"}</p>
<hr/>
${doc.sections
  .map(
    (s) => `<h2>${s.title}</h2><p>${s.content.replace(/\n/g, "</p><p>")}</p>`
  )
  .join("")}
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
