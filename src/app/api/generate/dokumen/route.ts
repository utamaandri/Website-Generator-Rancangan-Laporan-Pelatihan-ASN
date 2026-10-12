import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDokumenWithAI } from "@/lib/gemini";

function generateSectionFallback(
  title: string,
  nama: string,
  instansi: string,
  jabatan: string,
  tugasFungsi: string,
  isu: string,
  jenis: string
): string {
  const templates: Record<string, string> = {
    "Latar Belakang": `Berdasarkan amanat Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara, Pegawai ASN dituntut memiliki integritas, profesionalisme, serta mampu menginternalisasi nilai-nilai dasar ASN BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, dan Kolaboratif).

Dalam menjalankan tugas dan fungsi sebagai ${jabatan} di lingkungan ${instansi}, ${nama} memiliki tanggung jawab dalam ${tugasFungsi}. Namun dalam pelaksanaannya, masih dijumpai permasalahan krusial yaitu: ${isu}. 

Kondisi tersebut secara langsung mempengaruhi optimalisasi kinerja organisasi dan kualitas pelayanan kepada stakeholder. Oleh karena itu, melalui program pelatihan ${jenis}, penulis menyusun rancangan aktualisasi/aksi perubahan ini sebagai langkah strategis dan inovatif untuk menyelesaikan isu tersebut secara berkelanjutan.`,

    "Identifikasi Isu": `Berdasarkan pengamatan dan identifikasi di lingkungan kerja ${instansi}, berikut adalah analisis isu yang berkembang:

1. Isu Utama (Prioritas):
   ${isu}
2. Isu Sekunder:
   - Belum optimalnya koordinasi dan integrasi antar unit terkait dalam penanganan masalah.
   - Terbatasnya media informasi serta pedoman teknis/SOP yang dapat diakses secara mudah.
   - Pemanfaatan teknologi digital yang belum maksimal untuk menunjang efektivitas tugas.

Dampak jika isu utama tidak segera diselesaikan:
- Terhambatnya pencapaian target kinerja sasaran strategis instansi.
- Potensi penurunan tingkat kepuasan dan kepercayaan pengguna layanan/stakeholder.
- Ketidakefisienan penggunaan waktu dan sumber daya organisasi.`,

    "Gagasan Pemecahan Isu": `Guna menyelesaikan akar permasalahan dari isu "${isu}", dirumuskan gagasan kreatif dan inovatif pemecahan isu sebagai berikut:

A. Analisis Akar Masalah:
- Belum adanya standardisasi alur kerja dan petunjuk teknis yang terintegrasi.
- Belum optimalnya digitalisasi proses kerja dalam pemantauan dan tindak lanjut.
- Perlunya penguatan pemahaman bagi pelaksana teknis di lapangan.

B. Gagasan Inovasi Terpilih:
Optimalisasi pelaksanaan tugas pokok dan fungsi ${jabatan} melalui inovasi perbaikan tata kelola, penyusunan SOP digital, dan pelaksanaan sosialisasi terstruktur di ${instansi}.

C. Nilai Tambah Inovasi:
- Memberikan kepastian alur kerja dan transparansi.
- Meningkatkan kecepatan respon pelayanan secara signifikan.`,

    "Rencana Kegiatan": `Rencana kegiatan aktualisasi yang akan dilaksanakan dalam masa habituasi adalah sebagai berikut:

| No | Tahapan Kegiatan | Output / Bukti Fisik | Keterkaitan Nilai BerAKHLAK |
|----|------------------|----------------------|------------------------------|
| 1  | Melakukan konsultasi dan koordinasi dengan Mentor terkait rancangan inovasi | Notula konsultasi, lembar persetujuan mentor | Akuntabel, Kolaboratif, Harmonis |
| 2  | Menyusun draft Standar Operasional Prosedur (SOP) dan instrumen pendukung | Draft dokumen SOP, checklist verifikasi | Kompeten, Berorientasi Pelayanan |
| 3  | Mengembangkan media sosialisasi dan modul panduan pelaksanaan | Materi presentasi / infografis / modul panduan | Adaptif, Kompeten |
| 4  | Melaksanakan sosialisasi dan uji coba penerapan di unit kerja | Dokumentasi foto/video, daftar hadir peserta | Berorientasi Pelayanan, Kolaboratif |
| 5  | Evaluasi dan penyusunan laporan hasil aktualisasi | Laporan evaluasi, testimoni pengguna layanan | Akuntabel, Loyal |`,

    "Output & Outcome": `A. Output (Keluaran Langsung):
1. Tersusunnya dokumen SOP / Petunjuk Teknis yang disahkan pimpinan.
2. Tersedianya media sosialisasi digital dan instrumen kerja yang siap digunakan.
3. Terlaksananya sosialisasi kepada seluruh rekan kerja dan unit terkait.
4. Tersusunnya laporan hasil evaluasi pelaksanaan kegiatan.

B. Outcome (Dampak Positif Jangka Panjang):
1. Meningkatnya kepatuhan terhadap prosedur kerja hingga 100%.
2. Peningkatan efisiensi waktu penyelesaian tugas hingga 30%.
3. Terciptanya iklim kerja yang lebih kolaboratif, transparan, dan akuntabel di ${instansi}.
4. Meningkatnya kepuasan stakeholder terhadap output kerja ${jabatan}.`,

    "Indikator Keberhasilan": `Keberhasilan pelaksanaan kegiatan diukur melalui indikator-indikator SMART:

1. Indikator Kuantitatif:
   - Terlaksananya seluruh 5 tahapan kegiatan sesuai jadwal (100%).
   - Tingkat partisipasi dalam sosialisasi mencapai minimal 90%.
   - Penurunan kendala teknis pada proses pelaksanaan tugas minimal 25%.

2. Indikator Kualitatif:
   - Respon dan feedback positif dari Mentor serta pimpinan unit kerja.
   - Peningkatan pemahaman pegawai terhadap alur kerja baru.
   - Terinternalisasinya nilai-nilai BerAKHLAK dalam budaya kerja harian.`,
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

    const sectionTitles = [
      "Latar Belakang",
      "Identifikasi Isu",
      "Gagasan Pemecahan Isu",
      "Rencana Kegiatan",
      "Output & Outcome",
      "Indikator Keberhasilan",
    ];

    // Coba susun dokumen menggunakan Google Gemini AI
    let sections: { title: string; content: string; order: number }[] = [];
    const aiSections = await generateDokumenWithAI({
      namaPeserta: namaPeserta || "Peserta",
      jenisPelatihan: jenisPelatihan || "Latsar",
      instansi: instansi || "Instansi Pemerintah",
      jabatan: jabatan || "Jabatan",
      tugasFungsi: tugasFungsi || "Tugas dan Fungsi",
      isuTerpilih: isuTerpilih || "Isu Terpilih",
    });

    if (aiSections && aiSections.length >= 6) {
      sections = aiSections.map((sec, i) => ({
        title: sec.title,
        content: sec.content,
        order: i,
      }));
    } else {
      // Fallback ke template komprehensif jika Gemini belum dikonfigurasi / error
      sections = sectionTitles.map((title, i) => ({
        title,
        content: generateSectionFallback(
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
    }

    let docId = "doc-" + Date.now();
    try {
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
      docId = document.id;
    } catch (dbErr) {
      console.warn("DB save skipped or failed, proceeding with generated content:", dbErr);
    }

    return NextResponse.json({
      id: docId,
      sections: sections.map((s, idx) => ({
        id: `sec-${idx}`,
        title: s.title,
        content: s.content,
      })),
      source: aiSections ? "gemini-ai" : "template",
    });
  } catch (error) {
    console.error("Error in /api/generate/dokumen:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
