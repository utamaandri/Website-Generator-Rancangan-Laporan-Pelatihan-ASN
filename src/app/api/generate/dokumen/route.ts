import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateSection(
  title: string,
  nama: string,
  instansi: string,
  jabatan: string,
  tugasFungsi: string,
  isu: string,
  jenis: string
): string {
  const templates: Record<string, string> = {
    "Latar Belakang": `Berdasarkan tugas dan fungsi ${jabatan} di ${instansi}, terdapat permasalahan terkait ${isu}. Sebagai peserta ${jenis}, penulis perlu menyusun rancangan aktualisasi untuk memberikan kontribusi nyata dalam menyelesaikan permasalahan tersebut. Rancangan ini disusun dengan memperhatikan nilai-nilai BerAKHLAK dan prinsip-prinsip good governance.

${nama} sebagai ${jabatan} memiliki tugas pokok ${tugasFungsi}. Dalam pelaksanaannya, ditemukan bahwa ${isu}. Oleh karena itu, perlu dirumuskan suatu gagasan pemecahan isu yang dapat diimplementasikan dalam kegiatan aktualisasi.`,

    "Identifikasi Isu": `Berdasarkan analisis permasalahan yang ditemukan, identifikasi isu yang dapat diangkat adalah sebagai berikut:

1. ${isu}
2. Belum optimalnya koordinasi antar unit terkait penyelesaian permasalahan
3. Kurangnya pemahaman pegawai terhadap prosedur operasional standar
4. Belum optimalnya penggunaan teknologi informasi dalam pelaksanaan tugas
5. Rendahnya partisipasi stakeholder dalam mendukung pencapaian target`,

    "Gagasan Pemecahan Isu": `Berdasarkan identifikasi isu yang telah dilakukan, gagasan pemecahan isu yang ditawarkan adalah sebagai berikut:

A. Penyebab langsung:
- Kurangnya sosialisasi dan pemahaman terhadap prosedur
- Belum optimalnya pengawasan dan evaluasi
- Terbatasnya sumber daya yang tersedia

B. Alternatif pemecahan:
1. Menyusun dan mensosialisasikan SOP yang jelas dan terukur
2. Meningkatkan koordinasi dan komunikasi antar unit terkait
3. Mengoptimalkan pemanfaatan teknologi informasi
4. Melakukan monitoring dan evaluasi secara berkala

C. Gagasan terpilih:
Berdasarkan analisis APKL (Aktual, Problematik, Kekhalayakan, Layak), gagasan pemecahan isu yang dipilih adalah upaya mengoptimalkan pelaksanaan tugas pokok melalui perbaikan sistem dan prosedur kerja.`,

    "Rencana Kegiatan": `Rencana kegiatan aktualisasi yang akan dilaksanakan untuk mewujudkan gagasan pemecahan isu adalah sebagai berikut:

| No | Kegiatan | Tahapan | Output | Jadwal |
|----|----------|---------|--------|--------|
| 1 | Sosialisasi dan koordinasi | 1. Menyusun materi<br>2. Melaksanakan sosialisasi<br>3. Evaluasi hasil | Terlaksananya sosialisasi | Minggu 1-2 |
| 2 | Penyusunan SOP/prosedur | 1. Mengumpulkan data<br>2. Menyusun draft<br>3. Validasi dan penetapan | Dokumen SOP | Minggu 2-3 |
| 3 | Implementasi dan monitoring | 1. Uji coba penerapan<br>2. Monitoring pelaksanaan<br>3. Evaluasi dan perbaikan | Terlaksananya implementasi | Minggu 3-4 |`,

    "Output & Outcome": `Output yang diharapkan dari kegiatan aktualisasi ini adalah:

1. Terlaksananya sosialisasi kepada seluruh pegawai terkait prosedur kerja
2. Tersusunnya dokumen SOP/standar kerja yang jelas dan terukur
3. Terimplementasikannya sistem kerja baru yang lebih efektif dan efisien

Outcome yang diharapkan:
1. Meningkatnya pemahaman pegawai terhadap tugas dan fungsi masing-masing
2. Meningkatnya efektivitas dan efisiensi pelaksanaan tugas pokok
3. Meningkatnya kualitas pelayanan kepada stakeholder
4. Terwujudnya budaya kerja yang profesional dan akuntabel`,

    "Indikator Keberhasilan": `Indikator keberhasilan dari kegiatan aktualisasi ini adalah:

1. Terlaksananya sosialisasi dengan tingkat kehadiran minimal 90%
2. Tersusunnya dokumen SOP tepat waktu
3. Meningkatnya capaian kinerja unit kerja sebesar minimal 20%
4. Meningkatnya indeks kepuasan layanan
5. Tertanamnya nilai-nilai BerAKHLAK dalam pelaksanaan tugas sehari-hari

Indikator ini akan diukur melalui:
- Pre-test dan post-test pemahaman pegawai
- Capaian target kinerja bulanan
- Survei kepuasan pengguna layanan
- Observasi langsung pelaksanaan tugas`,
  };

  return templates[title] || `Bagian ${title} dari dokumen ${jenis} peserta ${nama}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { namaPeserta, jenisPelatihan, instansi, jabatan, tugasFungsi, isuTerpilih } =
      await req.json();

    let trainingType = await prisma.trainingType.findUnique({
      where: { slug: jenisPelatihan?.toLowerCase() || "latsar" },
    });

    if (!trainingType) {
      trainingType = await prisma.trainingType.create({
        data: {
          name: jenisPelatihan || "Latsar",
          slug: jenisPelatihan?.toLowerCase() || "latsar",
        },
      });
    }

    const sectionTitles = [
      "Latar Belakang",
      "Identifikasi Isu",
      "Gagasan Pemecahan Isu",
      "Rencana Kegiatan",
      "Output & Outcome",
      "Indikator Keberhasilan",
    ];

    const sections = sectionTitles.map((title, i) => ({
      title,
      content: generateSection(
        title,
        namaPeserta || "Peserta",
        instansi || "Instansi",
        jabatan || "Jabatan",
        tugasFungsi || "Tugas dan Fungsi",
        isuTerpilih || "Isu yang terpilih",
        jenisPelatihan || "Latsar"
      ),
      order: i,
    }));

    const document = await prisma.document.create({
      data: {
        userId,
        trainingTypeId: trainingType.id,
        title: `Rancangan ${jenisPelatihan || "Latsar"} - ${namaPeserta || "Peserta"}`,
        namaPeserta,
        instansi,
        jabatan,
        tugasFungsi,
        keywords: "",
        isuTerpilih,
        sections: {
          create: sections,
        },
      },
      include: { sections: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({
      id: document.id,
      sections: document.sections.map((s) => ({
        id: s.id,
        title: s.title,
        content: s.content,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
