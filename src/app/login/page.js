"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { syncSessionCookie } from "@/lib/authSession";
import { getUserProfile } from "@/lib/firestore";
import { useAuth } from "@/lib/AuthContext";
import { isDemoAuthEnabled } from "@/lib/demoAuth";
import {
  AuthDivider,
  AuthField,
  AuthFooterLink,
  AuthPixelIcon,
  AuthShell,
} from "@/components/auth/AuthVisualShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const authContext = useAuth();

  const getNextPath = (profile) => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next && next.startsWith("/")) return next;
    return profile?.role === "admin" ? "/admin" : "/dashboard";
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error("Mohon isi email dan password.");
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await syncSessionCookie(credential.user);
      const profile = await getUserProfile(credential.user.uid);
      if (remember && typeof window !== "undefined") {
        window.localStorage.setItem("ecoquest_last_email", email);
      }
      toast.success("Login berhasil. Selamat datang kembali, EcoWarrior!");
      router.push(getNextPath(profile));
    } catch (err) {
      console.error(err);
      const errorMessages = {
        "auth/user-not-found": "Akun tidak ditemukan. Daftar terlebih dahulu.",
        "auth/wrong-password": "Password salah. Coba lagi.",
        "auth/invalid-email": "Format email tidak valid.",
        "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti.",
        "auth/invalid-credential": "Email atau password salah.",
        "auth/network-request-failed": "Firebase Auth tidak bisa dihubungi. Cek internet, config Firebase, atau gunakan Mode Demo.",
      };
      toast.error(errorMessages[err.code] || "Login gagal. Periksa kembali kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const started = authContext?.startDemoSession?.();
      if (!started) {
        toast.error("Mode demo hanya tersedia saat development.");
        return;
      }

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: true }),
      });

      toast.success("Mode demo aktif. Silakan cek dashboard dan game.");
      router.push(getNextPath());
    } catch (err) {
      console.error(err);
      toast.error("Gagal memulai mode demo.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      title="LOGIN"
      subtitle="Masuk ke terminal PixelTerra dan lanjutkan misi hijau."
    >
      <form onSubmit={handleLogin} className="auth-form">
        <AuthField
          id="login-email"
          label="Email"
          icon="mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ecowarrior@email.com"
          autoComplete="email"
        />

        <AuthField
          id="login-password"
          label="Password"
          icon="lock"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Masukkan password"
          autoComplete="current-password"
          action={
            <button
              type="button"
              className="auth-input-action"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          }
        />

        <div className="auth-options">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span />
            Ingat saya
          </label>
          <Link href="/login" className="auth-small-link">
            Lupa password?
          </Link>
        </div>

        <button type="submit" disabled={loading || demoLoading} className="auth-primary-button">
          <AuthPixelIcon type="leaf" />
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <AuthDivider />

        {isDemoAuthEnabled() && (
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading || demoLoading}
            className="auth-secondary-button"
          >
            <AuthPixelIcon type="spark" />
            {demoLoading ? "Menyiapkan demo..." : "Masuk Mode Demo"}
          </button>
        )}

        <AuthFooterLink text="Belum punya akun?" href="/register" label="Daftar sekarang" />
      </form>
    </AuthShell>
  );
}
