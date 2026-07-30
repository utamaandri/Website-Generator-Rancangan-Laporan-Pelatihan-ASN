"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  "Input Data",
  "Generate Isu",
  "Pilih Template",
  "Review Hasil",
  "Export",
];

interface FormData {
  namaPeserta: string;
  jenisPelatihan: string;
  instansi: string;
  jabatan: string;
  tugasFungsi: string;
  keywords: string[];
  isuTerpilih: string;
  isuOptions: string[];
  documentId: string;
  sections: { title: string; content: string }[];
}

export function DocumentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [form, setForm] = useState<FormData>({
    namaPeserta: "",
    jenisPelatihan: "",
    instansi: "",
    jabatan: "",
    tugasFungsi: "",
    keywords: [],
    isuTerpilih: "",
    isuOptions: [],
    documentId: "",
    sections: [],
  });

  function addKeyword() {
    const kw = keywordInput.trim();
    if (kw && !form.keywords.includes(kw)) {
      setForm({ ...form, keywords: [...form.keywords, kw] });
      setKeywordInput("");
    }
  }

  function removeKeyword(kw: string) {
    setForm({ ...form, keywords: form.keywords.filter((k) => k !== kw) });
  }

  async function handleGenerateIsu() {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/isu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tugasFungsi: form.tugasFungsi,
          keywords: form.keywords,
        }),
      });
      const data = await res.json();
      setForm({ ...form, isuOptions: data.isuOptions || [] });
    } catch {
      setForm({
        ...form,
        isuOptions: [
          "Belum optimalnya pelayanan di unit kerja akibat keterbatasan sumber daya",
          "Kurangnya efektivitas proses bisnis yang berdampak pada capaian kinerja",
          "Rendahnya kualitas output yang dihasilkan dari pelaksanaan tugas pokok",
          "Belum maksimalnya pemanfaatan teknologi dalam mendukung pelaksanaan tugas",
          "Kurangnya koordinasi antar unit kerja dalam penyelesaian target kerja",
        ],
      });
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateDokumen() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate/dokumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaPeserta: form.namaPeserta,
          jenisPelatihan: form.jenisPelatihan,
          instansi: form.instansi,
          jabatan: form.jabatan,
          tugasFungsi: form.tugasFungsi,
          isuTerpilih: form.isuTerpilih,
        }),
      });
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        documentId: data.id,
        sections: data.sections || [],
      }));
    } catch {
      setForm((prev) => ({
        ...prev,
        documentId: "temp-id",
        sections: [
          { title: "Latar Belakang", content: "Latar belakang berdasarkan isu: " + form.isuTerpilih },
          { title: "Identifikasi Isu", content: "Identifikasi dari isu yang telah ditentukan" },
          { title: "Gagasan Pemecahan Isu", content: "Gagasan pemecahan untuk mengatasi isu" },
          { title: "Rencana Kegiatan", content: "Rencana kegiatan aktualisasi" },
          { title: "Output & Outcome", content: "Output dan outcome yang diharapkan" },
          { title: "Indikator Keberhasilan", content: "Indikator keberhasilan kegiatan" },
        ],
      }));
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSections() {
    if (!form.documentId) return;
    try {
      await fetch("/api/documents/" + form.documentId + "/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: form.sections }),
      });
    } catch {}
  }

  function updateSection(index: number, content: string) {
    const sections = [...form.sections];
    sections[index] = { ...sections[index], content };
    setForm({ ...form, sections });
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return !!(form.namaPeserta && form.jenisPelatihan && form.instansi && form.jabatan);
      case 1:
        return !!form.isuTerpilih;
      case 2:
        return form.sections.length > 0;
      default:
        return true;
    }
  }

  async function handleFinish() {
    await handleSaveSections();
    if (form.documentId) {
      router.push("/dashboard/dokumen/" + form.documentId);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step
                    ? "bg-blue-900 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    i < step ? "bg-blue-900" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {STEPS[step]}
        </p>
      </div>

      {step === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Input Data Peserta
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Peserta
              </label>
              <input
                type="text"
                value={form.namaPeserta}
                onChange={(e) =>
                  setForm({ ...form, namaPeserta: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Pelatihan
              </label>
              <select
                value={form.jenisPelatihan}
                onChange={(e) =>
                  setForm({ ...form, jenisPelatihan: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                <option value="">Pilih jenis pelatihan</option>
                <option value="Latsar">Latsar</option>
                <option value="PKP">PKP</option>
                <option value="PKA">PKA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instansi
              </label>
              <input
                type="text"
                value={form.instansi}
                onChange={(e) =>
                  setForm({ ...form, instansi: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white"
                placeholder="Nama instansi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                value={form.jabatan}
                onChange={(e) =>
                  setForm({ ...form, jabatan: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white"
                placeholder="Jabatan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tugas & Fungsi
              </label>
              <textarea
                value={form.tugasFungsi}
                onChange={(e) =>
                  setForm({ ...form, tugasFungsi: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white"
                placeholder="Deskripsikan tugas dan fungsi jabatan Anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keyword Isu
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white"
                  placeholder="Ketik keyword lalu Enter"
                />
                <button
                  onClick={addKeyword}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Tambah
                </button>
              </div>
              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {kw}
                      <button
                        onClick={() => removeKeyword(kw)}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generator Isu Otomatis
          </h2>
          <p className="text-gray-500 mb-6">
            Klik tombol di bawah untuk menghasilkan opsi isu berdasarkan data
            yang Anda masukkan.
          </p>

          {form.isuOptions.length === 0 ? (
            <button
              onClick={handleGenerateIsu}
              disabled={generating}
              className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
            >
              {generating ? "Menghasilkan..." : "Generate Isu"}
            </button>
          ) : (
            <div className="space-y-3">
              {form.isuOptions.map((isu, i) => (
                <label
                  key={i}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition ${
                    form.isuTerpilih === isu
                      ? "border-blue-900 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="isu"
                    value={isu}
                    checked={form.isuTerpilih === isu}
                    onChange={(e) =>
                      setForm({ ...form, isuTerpilih: e.target.value })
                    }
                    className="sr-only"
                  />
                  <p className="text-gray-900">{isu}</p>
                </label>
              ))}
              <button
                onClick={handleGenerateIsu}
                disabled={generating}
                className="text-blue-900 text-sm font-medium hover:underline mt-2"
              >
                {generating ? "Memperbarui..." : "Generate Ulang"}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generate Dokumen
          </h2>
          <p className="text-gray-500 mb-6">
            Sistem akan menyusun narasi dokumen berdasarkan isu yang dipilih
            dan template resmi {form.jenisPelatihan}.
          </p>

          {form.sections.length === 0 ? (
            <button
              onClick={handleGenerateDokumen}
              disabled={loading}
              className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? "Menyusun Dokumen..." : "Generate Dokumen"}
            </button>
          ) : (
            <div className="space-y-4">
              {form.sections.map((sec, i) => (
                <div key={i}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {sec.title}
                  </label>
                  <textarea
                    value={sec.content}
                    onChange={(e) => updateSection(i, e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Review Hasil Dokumen
          </h2>
          {form.sections.map((sec, i) => (
            <div key={i} className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{sec.title}</h3>
              <div
                className="p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap text-sm"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateSection(i, e.currentTarget.textContent || "")}
              >
                {sec.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Export Dokumen
          </h2>
          <p className="text-gray-500 mb-6">
            Dokumen siap di-export. Simpan draft atau download dalam format yang
            diinginkan.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleFinish}
              className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition"
            >
              Simpan Draft
            </button>
            <button
              onClick={async () => {
                await handleSaveSections();
                const res = await fetch(`/api/export/pdf?docId=${form.documentId}`);
                if (res.ok) {
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "dokumen.pdf";
                  a.click();
                }
              }}
              className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
            >
              Download PDF
            </button>
            <button
              onClick={async () => {
                await handleSaveSections();
                const res = await fetch(`/api/export/docx?docId=${form.documentId}`);
                if (res.ok) {
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "dokumen.docx";
                  a.click();
                }
              }}
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition"
            >
              Download Word
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Sebelumnya
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
          >
            Selanjutnya
          </button>
        ) : null}
      </div>
    </div>
  );
}
