"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Document {
  id: string;
  title: string;
  status: string;
  trainingType: { name: string };
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/documents")
        .then((r) => r.json())
        .then((data) => setDocuments(data))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Selamat datang, {session?.user?.name || session?.user?.email}
          </p>
        </div>
        <Link
          href="/dashboard/dokumen/new"
          className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition"
        >
          + Buat Dokumen Baru
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Belum Ada Dokumen
          </h2>
          <p className="text-gray-500 mb-6">
            Buat dokumen pertama Anda untuk memulai
          </p>
          <Link
            href="/dashboard/dokumen/new"
            className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition inline-block"
          >
            Buat Dokumen Baru
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/dashboard/dokumen/${doc.id}`}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  {doc.title || "Dokumen tanpa judul"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {doc.trainingType.name} —{" "}
                  {new Date(doc.updatedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  doc.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {doc.status === "draft" ? "Draft" : "Selesai"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
