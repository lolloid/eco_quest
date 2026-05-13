"use client";

import Link from "next/link";
import PixelIcon from "@/components/ui/PixelIcon";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen px-4 py-24 flex items-center justify-center">
      <section className="glass-card max-w-xl w-full p-8 text-center">
        <div className="mb-5 flex justify-center">
          <PixelIcon type="lock" className="is-large" />
        </div>
        <p className="font-pixel text-xs text-red-400 mb-3">ACCESS DENIED</p>
        <h1 className="text-2xl font-bold text-white mb-3">Area admin terkunci</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Panel ini hanya bisa dibuka oleh akun dengan role admin. Jika kamu baru membuat akun,
          minta pemilik project untuk mengubah role akunmu di Firestore.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="btn-eco text-sm">
            Kembali ke Dashboard
          </Link>
          <Link href="/" className="btn-eco-outline text-sm">
            Ke Homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
