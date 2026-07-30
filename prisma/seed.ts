import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  const pesertaPassword = await bcrypt.hash("peserta123", 12);

  await prisma.user.upsert({
    where: { email: "admin@asn.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@asn.com",
      password: adminPassword,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "peserta@asn.com" },
    update: {},
    create: {
      name: "Peserta",
      email: "peserta@asn.com",
      password: pesertaPassword,
      role: "peserta",
    },
  });

  console.log("Akun dibuat: admin@asn.com / peserta@asn.com");

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

  console.log("Seed selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
