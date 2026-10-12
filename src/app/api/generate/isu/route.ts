import { NextResponse } from "next/server";
import { generateIsuWithAI } from "@/lib/gemini";

const isuTemplates = [
  (kw: string, func: string) =>
    `Belum optimalnya ${kw} dalam mendukung pelaksanaan ${func} sehingga berdampak pada capaian kinerja unit kerja`,
  (kw: string, func: string) =>
    `Kurangnya efektivitas ${kw} pada proses ${func} yang mengakibatkan belum tercapainya target yang ditetapkan`,
  (kw: string, func: string) =>
    `Rendahnya kualitas ${kw} di unit kerja akibat belum optimalnya ${func} yang dilaksanakan selama ini`,
  (kw: string, func: string) =>
    `Belum maksimalnya pemanfaatan ${kw} dalam pelaksanaan ${func} sehingga perlu dilakukan upaya perbaikan`,
  (kw: string, func: string) =>
    `Kurangnya koordinasi dalam ${kw} terkait ${func} yang berdampak pada efektivitas dan efisiensi kerja`,
  (kw: string, func: string) =>
    `Masih terdapatnya permasalahan dalam ${kw} pada ${func} yang menghambat pencapaian visi dan misi organisasi`,
  (kw: string, func: string) =>
    `Perlunya peningkatan ${kw} guna mendukung kelancaran ${func} di lingkungan unit kerja`,
  (kw: string, func: string) =>
    `Belum optimalnya sistem ${kw} dalam menunjang ${func} yang efektif dan efisien`,
];

export async function POST(req: Request) {
  try {
    const { tugasFungsi, keywords } = await req.json();

    const normalizedKeywords: string[] = Array.isArray(keywords) ? keywords : [];

    // Coba generate menggunakan Google Gemini API terlebih dahulu
    const aiResults = await generateIsuWithAI(tugasFungsi || "", normalizedKeywords);
    if (aiResults && aiResults.length > 0) {
      return NextResponse.json({ isuOptions: aiResults, source: "gemini-ai" });
    }

    // Fallback template jika Gemini API belum diatur / limit tercapai
    if (normalizedKeywords.length === 0) {
      return NextResponse.json({
        isuOptions: isuTemplates.slice(0, 5).map((t) => t("pelayanan", tugasFungsi || "tugas dan fungsi")),
        source: "template",
      });
    }

    const isuOptions = normalizedKeywords.flatMap((kw: string) =>
      isuTemplates.slice(0, 2).map((t) => t(kw, tugasFungsi || "tugas dan fungsi"))
    );

    return NextResponse.json({
      isuOptions: isuOptions.slice(0, 5),
      source: "template",
    });
  } catch (error) {
    console.error("Error in /api/generate/isu:", error);
    return NextResponse.json({
      isuOptions: [
        "Belum optimalnya pelayanan di unit kerja akibat keterbatasan tata kelola dan sistem pendukung",
        "Kurangnya efektivitas proses bisnis dan koordinasi internal yang berdampak pada capaian kinerja",
        "Belum maksimalnya pemanfaatan teknologi informasi dalam menunjang penyelesaian tugas kedinasan",
        "Rendahnya kepatuhan dan pemahaman terhadap standar operasional prosedur yang berlaku",
        "Terbatasnya sarana dan media monitoring evaluasi pelaksanaan tugas jabatan",
      ],
      source: "fallback",
    });
  }
}
