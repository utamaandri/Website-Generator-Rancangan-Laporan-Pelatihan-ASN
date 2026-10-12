"use client";
import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "Configuration") {
        setError(
          "Koneksi ke database gagal atau server bermasalah. Pastikan database Supabase sudah di-restore (unpause)."
        );
      } else {
        setError("Gagal masuk. Silakan periksa email dan password Anda.");
      }
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email atau password salah (atau database sedang tidak aktif)");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Masuk
        </h1>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm leading-relaxed">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-gray-900 bg-white"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2.5 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-blue-900 font-medium hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
