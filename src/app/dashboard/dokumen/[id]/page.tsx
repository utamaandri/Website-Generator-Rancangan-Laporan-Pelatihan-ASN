"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Section {
  id: string;
  title: string;
  content: string;
  order: number;
}

export default function DocumentDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && params.id) {
      fetch(`/api/documents/${params.id}`)
        .then((r) => r.json())
        .then((data) => {
          setDoc(data);
          setSections(data.sections || []);
        })
        .finally(() => setLoading(false));
    }
  }, [status, params.id]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/documents/${params.id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
    } catch {}
    setSaving(false);
  }

  function updateSection(id: string, content: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s))
    );
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Dokumen tidak ditemukan</p>
        <Link
          href="/dashboard"
          className="text-blue-900 font-medium hover:underline mt-4 inline-block"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-blue-900 hover:underline mb-2 inline-block"
          >
            &larr; Kembali
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {doc.title || "Dokumen"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {doc.trainingType?.name} — {doc.namaPeserta}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            onClick={async () => {
              await handleSave();
              const res = await fetch(`/api/export/pdf?docId=${doc.id}`);
              if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "dokumen.pdf";
                a.click();
              }
            }}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Nama:</strong> {doc.namaPeserta || "-"} |{" "}
            <strong>Instansi:</strong> {doc.instansi || "-"} |{" "}
            <strong>Jabatan:</strong> {doc.jabatan || "-"}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Isu:</strong> {doc.isuTerpilih || "-"}
          </p>
        </div>

        {sections.map((sec) => (
          <div key={sec.id} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {sec.title}
            </h2>
            <textarea
              value={sec.content}
              onChange={(e) => updateSection(sec.id, e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
