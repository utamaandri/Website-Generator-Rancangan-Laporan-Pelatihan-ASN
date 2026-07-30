"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Generator ASN
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard" className="hover:text-blue-200">
                  Dashboard
                </Link>
                {(session.user as any)?.role === "admin" && (
                  <Link href="/admin" className="hover:text-blue-200">
                    Admin
                  </Link>
                )}
                <span className="text-sm text-blue-200">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hover:text-blue-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
