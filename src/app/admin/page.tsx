"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  trainingType: { name: string };
  sections: { id: string; title: string; content: string; order: number }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Template | null>(null);

  useEffect(() => {
    if (status === "authenticated" && (session.user as any)?.role !== "admin") {
      router.push("/dashboard");
    }
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && (session.user as any)?.role === "admin") {
      fetch("/api/templates")
        .then((r) => r.json())
        .then(setTemplates)
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Panel Admin
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Template Dokumen
          </h2>
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selected?.id === t.id
                    ? "border-blue-900 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium text-sm text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500">{t.trainingType.name}</p>
              </button>
            ))}
            {templates.length === 0 && (
              <p className="text-gray-500 text-sm">Belum ada template</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {selected.name}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {selected.description || "Tidak ada deskripsi"}
              </p>
              {selected.sections
                .sort((a, b) => a.order - b.order)
                .map((sec) => (
                  <div key={sec.id} className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {sec.title}
                    </label>
                    <textarea
                      value={sec.content}
                      onChange={async (e) => {
                        const res = await fetch(`/api/templates/${selected.id}/sections`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            sectionId: sec.id,
                            content: e.target.value,
                          }),
                        });
                        if (res.ok) {
                          setSelected({
                            ...selected,
                            sections: selected.sections.map((s) =>
                              s.id === sec.id ? { ...s, content: e.target.value } : s
                            ),
                          });
                        }
                      }}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
              <p className="text-gray-500">
                Pilih template di samping untuk mengedit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
