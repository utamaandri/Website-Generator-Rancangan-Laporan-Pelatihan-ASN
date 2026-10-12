import { GoogleGenAI } from "@google/genai";

function getGeminiClient(): GoogleGenAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

export async function generateIsuWithAI(
  tugasFungsi: string,
  keywords: string[]
): Promise<string[] | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const prompt = `Anda adalah seorang Widyaiswara Ahli dan Pakar Kurikulum Pelatihan ASN LAN RI (Lembaga Administrasi Negara).
Tugas Anda adalah merumuskan 5 (lima) alternatif isu aktual yang profesional, terukur, dan memenuhi kaidah perumusan isu ASN resmi (mengandung pernyataan kondisi negatif/gap, lokus unit kerja, dan dampak apabila tidak diselesaikan).

Data Peserta:
- Tugas & Fungsi: ${tugasFungsi || "Pelaksanaan tugas pokok dan fungsi unit kerja"}
- Kata Kunci / Fokus Area: ${keywords.length > 0 ? keywords.join(", ") : "pelayanan publik, efisiensi kerja"}

Instruksi:
1. Buat tepat 5 kalimat isu aktual yang spesifik, relevan, dan bermakna.
2. Gunakan kata kunci negatif formal seperti "Belum optimalnya...", "Kurangnya efektivitas...", "Belum tersedianya sistem...", "Rendahnya kualitas...", dsb.
3. Kembalikan HANYA format JSON valid berupa array string tanpa teks pengantar atau penutup.

Contoh format:
["Belum optimalnya...", "Kurangnya efektivitas...", "Belum terintegrasinya...", "Rendahnya pemanfaatan...", "Masih tingginya kendala..."]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "";
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => String(item).trim());
    }
    return null;
  } catch (error) {
    console.error("Gemini AI generateIsu error:", error);
    return null;
  }
}

export interface SectionOutput {
  title: string;
  content: string;
}

export async function generateDokumenWithAI(params: {
  namaPeserta: string;
  jenisPelatihan: string;
  instansi: string;
  jabatan: string;
  tugasFungsi: string;
  isuTerpilih: string;
}): Promise<SectionOutput[] | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const { namaPeserta, jenisPelatihan, instansi, jabatan, tugasFungsi, isuTerpilih } =
      params;

    const prompt = `Anda adalah seorang Master Coach dan Widyaiswara Utama Pelatihan ASN (${jenisPelatihan} - Lembaga Administrasi Negara Republik Indonesia).
Susun narasi lengkap untuk Dokumen Rancangan Aktualisasi / Rancangan Aksi Perubahan secara komprehensif, akademis, dan aplikatif.

Profil Peserta:
- Nama Peserta: ${namaPeserta || "Peserta Pelatihan"}
- Jenis Pelatihan: ${jenisPelatihan || "Latsar"}
- Instansi: ${instansi || "Instansi Pemerintah"}
- Jabatan: ${jabatan || "Pegawai ASN"}
- Tugas & Fungsi Pokok: ${tugasFungsi || "Pelaksanaan tugas pelayanan dan administrasi"}
- Isu Strategis Terpilih: ${isuTerpilih}

Susun tepat 6 (enam) bagian dokumen berikut secara mendalam:
1. "Latar Belakang": Uraikan kondisi ideal berdasarkan UU ASN No. 20 Tahun 2023, penerapan Nilai-Nilai Dasar ASN BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif), kondisi saat ini di unit kerja, kesenjangan (gap), dan urgensi penyelesaian isu.
2. "Identifikasi Isu": Uraikan deskripsi isu yang diidentifikasi, analisis kriteria isu menggunakan metode APKL (Aktual, Problematik, Kekhalayakan, Layak) atau USG (Urgency, Seriousness, Growth), serta dampak jika isu tersebut tidak segera diselesaikan.
3. "Gagasan Pemecahan Isu": Rumuskan inovasi/terobosan gagasan kreatif yang logis dan terukur untuk menyelesaikan akar masalah (diagram Fishbone / pohon masalah), serta ruang lingkup inovasi.
4. "Rencana Kegiatan": Buat rincian 3-4 tahapan kegiatan nyata beserta tahapan sub-kegiatan, output/bukti fisik kegiatan, dan keterkaitannya dengan substansi mata pelatihan/nilai BerAKHLAK. Sajikan dalam format narasi tabel terstruktur.
5. "Output & Outcome": Rincikan secara spesifik output langsung (produk fisik/digital/SOP yang dihasilkan) dan outcome jangka menengah bagi efisiensi organisasi dan kepuasan masyarakat.
6. "Indikator Keberhasilan": Indikator pencapaian target yang bersifat SMART (Specific, Measurable, Achievable, Relevant, Time-bound) dan metode evaluasi monitoringnya.

Output WAJIB berupa JSON array of objects dengan struktur:
[
  { "title": "Latar Belakang", "content": "..." },
  { "title": "Identifikasi Isu", "content": "..." },
  { "title": "Gagasan Pemecahan Isu", "content": "..." },
  { "title": "Rencana Kegiatan", "content": "..." },
  { "title": "Output & Outcome", "content": "..." },
  { "title": "Indikator Keberhasilan", "content": "..." }
]
Kembalikan HANYA format JSON valid tanpa teks pengantar atau penutup.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "";
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length >= 6) {
      return parsed.map((sec) => ({
        title: String(sec.title || "").trim(),
        content: String(sec.content || "").trim(),
      }));
    }
    return null;
  } catch (error) {
    console.error("Gemini AI generateDokumen error:", error);
    return null;
  }
}
