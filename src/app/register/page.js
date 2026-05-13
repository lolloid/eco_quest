"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { syncSessionCookie } from "@/lib/authSession";
import {
  AuthDivider,
  AuthField,
  AuthFooterLink,
  AuthPixelIcon,
  AuthShell,
} from "@/components/auth/AuthVisualShell";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!displayName || !email || !password) {
      toast.error("Mohon isi semua field.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password tidak cocok.");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Setujui syarat dan ketentuan terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });
      await createUserProfile(user.uid, { displayName, email });
      await syncSessionCookie(user);

      toast.success("Registrasi berhasil. Selamat datang, EcoWarrior!");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      const errorMessages = {
        "auth/email-already-in-use": "Email sudah terdaftar. Gunakan email lain atau login.",
        "auth/invalid-email": "Format email tidak valid.",
        "auth/weak-password": "Password terlalu lemah. Gunakan minimal 6 karakter.",
        "auth/network-request-failed": "Firebase Auth tidak bisa dihubungi. Cek internet/config Firebase, atau coba Mode Demo dari halaman login.",
      };
      toast.error(errorMessages[err.code] || "Registrasi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="register"
      title="REGISTER"
      subtitle="Buat identitas EcoWarrior dan mulai perjalanan membersihkan dunia."
    >
      <form onSubmit={handleRegister} className="auth-form">
        <AuthField
          id="register-name"
          label="Username"
          icon="user"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="EcoWarrior123"
          autoComplete="nickname"
          maxLength={20}
        />

        <AuthField
          id="register-email"
          label="Email"
          icon="mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ecowarrior@email.com"
          autoComplete="email"
        />

        <AuthField
          id="register-password"
          label="Password"
          icon="lock"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimal 6 karakter"
          autoComplete="new-password"
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

        <AuthField
          id="register-confirm"
          label="Konfirmasi Password"
          icon="shield"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Ulangi password"
          autoComplete="new-password"
        />

        {confirmPassword && (
          <p className={`auth-password-state ${password === confirmPassword ? "is-ok" : "is-error"}`}>
            {password === confirmPassword ? "Password cocok" : "Password tidak cocok"}
          </p>
        )}

        <label className="auth-check auth-check-full">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span />
          Saya menyetujui syarat & ketentuan PixelTerra
        </label>

        <button type="submit" disabled={loading} className="auth-primary-button">
          <AuthPixelIcon type="scroll" />
          {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
        </button>

        <AuthDivider />

        <AuthFooterLink text="Sudah punya akun?" href="/login" label="Login sekarang" />
      </form>
    </AuthShell>
  );
}
