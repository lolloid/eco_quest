"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../layout";
import PixelIcon from "@/components/ui/PixelIcon";

export default function AdminLayout({ children }) {
  const authContext = useAuth();
  const router = useRouter();
  const isAdmin = authContext?.profile?.role === "admin";

  useEffect(() => {
    if (authContext?.loading) return;

    if (!authContext?.user) {
      router.replace("/login?next=/admin");
      return;
    }

    if (!isAdmin) {
      router.replace("/unauthorized");
    }
  }, [authContext?.loading, authContext?.user, isAdmin, router]);

  if (authContext?.loading || !authContext?.user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-6 text-center">
          <div className="mb-4 flex justify-center">
            <PixelIcon type="leaf" className="is-large" />
          </div>
          <p className="font-pixel text-xs text-eco-400 animate-pulse">VERIFYING ACCESS...</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-6 text-center border-red-500/30">
          <p className="font-pixel text-xs text-red-400">ADMIN ONLY</p>
          <p className="text-gray-400 text-sm mt-3">Mengalihkan ke halaman akses ditolak...</p>
        </div>
      </main>
    );
  }

  return children;
}
