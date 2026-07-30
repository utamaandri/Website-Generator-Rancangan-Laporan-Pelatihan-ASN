import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` } as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const latsar = await prisma.trainingType.upsert({
    where: { slug: "latsar" },
    update: {},
    create: { name: "Latsar", slug: "latsar", description: "Pelatihan Dasar CPNS" },
  });

  const pkp = await prisma.trainingType.upsert({
    where: { slug: "pkp" },
    update: {},
    create: { name: "PKP", slug: "pkp", description: "Pelatihan Kepemimpinan Pengawas" },
  });

  const pka = await prisma.trainingType.upsert({
    where: { slug: "pka" },
    update: {},
    create: { name: "PKA", slug: "pka", description: "Pelatihan Kepemimpinan Administrator" },
  });

  const sections = [
    { title: "Latar Belakang", order: 0 },
    { title: "Identifikasi Isu", order: 1 },
    { title: "Gagasan Pemecahan Isu", order: 2 },
    { title: "Rencana Kegiatan", order: 3 },
    { title: "Output & Outcome", order: 4 },
    { title: "Indikator Keberhasilan", order: 5 },
  ];

  for (const tt of [latsar, pkp, pka]) {
    const existing = await prisma.template.findFirst({
      where: { trainingTypeId: tt.id, name: `Template ${tt.name}` },
    });

    if (!existing) {
      await prisma.template.create({
        data: {
          name: `Template ${tt.name}`,
          trainingTypeId: tt.id,
          description: `Template default untuk ${tt.name}`,
          sections: {
            create: sections.map((s) => ({
              title: s.title,
              content: `[Konten ${s.title} akan digenerate secara otomatis]`,
              order: s.order,
            })),
          },
        },
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
