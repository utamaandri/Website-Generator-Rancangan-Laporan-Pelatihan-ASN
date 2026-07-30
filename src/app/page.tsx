import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Generator Rancangan & Laporan Pelatihan ASN
            </h1>
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
              Bantu peserta Latsar, PKP, dan PKA menyusun Rancangan Aktualisasi
              dan Laporan secara otomatis dan terstruktur berdasarkan template resmi.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="bg-white text-blue-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-100 transition"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="/auth/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/10 transition"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Fitur Utama
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "📝",
              title: "Generator Isu Otomatis",
              desc: "Kembangkan keyword menjadi kalimat isu yang relevan dan kontekstual dengan kaidah penulisan resmi.",
            },
            {
              icon: "📄",
              title: "Template Dokumen",
              desc: "Auto-generate Latar Belakang, Identifikasi Isu, Gagasan Pemecahan, Rencana Kegiatan, dan lainnya.",
            },
            {
              icon: "📥",
              title: "Export PDF & Word",
              desc: "Download dokumen dalam format PDF atau Word yang rapi dan siap cetak sesuai template resmi.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {f.title}
              </h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Cara Kerja
          </h2>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: "1", title: "Input Data", desc: "Nama, jabatan, tugas & keyword" },
              { step: "2", title: "Generate Isu", desc: "Sistem menghasilkan opsi isu relevan" },
              { step: "3", title: "Pilih Template", desc: "Latsar / PKP / PKA" },
              { step: "4", title: "Review Hasil", desc: "Edit & sesuaikan narasi" },
              { step: "5", title: "Export", desc: "Download PDF / Word" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
