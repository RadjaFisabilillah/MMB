// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const { user, loading, login, signOut } = useAuth();
  // Tidak perlu menggunakan useRouter() atau useEffect untuk redirect di sini
  // karena Middleware sudah menangani redirect utama.

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("pegawai"); // Default
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Lakukan autentikasi menggunakan Supabase
      await login(email, password);
      // Supabase akan menyimpan sesi dan memicu AuthProvider.
      // Selanjutnya, Middleware akan menangkap sesi dan mengarahkan ke /dashboard.

      // 2. Verifikasi peran setelah berhasil login (sebelum Middleware redirect)
      const { data: profile } = await supabase
        .from("pegawai")
        .select("role")
        .eq("email", email)
        .single();

      if (profile && profile.role !== selectedRole) {
        // Jika peran yang dideklarasikan tidak sesuai, paksa logout
        setError(
          "Otentikasi berhasil, tetapi peran yang dipilih tidak sesuai dengan profil Anda."
        );
        await signOut();
      }
    } catch (err) {
      if (err.message.includes("Invalid login credentials")) {
        setError("Email atau Password salah.");
      } else if (err.message.includes("not found")) {
        setError("Profil pegawai tidak ditemukan di database.");
      } else {
        setError(err.message || "Login gagal. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main
        className="flex-grow p-4 pt-10 text-white text-center"
        style={{ backgroundColor: "#323232" }}
      >
        <h1 className="text-3xl font-bold mt-20" style={{ color: "#FA4EAB" }}>
          Memuat Aplikasi...
        </h1>
      </main>
    );
  }

  // ✅ PERBAIKAN: Jika user sudah terautentikasi dan loading selesai,
  // tampilkan pesan redirect (Middleware yang akan melakukan redirect sebenarnya)
  if (user) {
    return (
      <main
        className="flex-grow p-4 pt-10 text-white text-center"
        style={{ backgroundColor: "#323232" }}
      >
        <h1 className="text-3xl font-bold mt-20" style={{ color: "#FA4EAB" }}>
          Mengarahkan ke Dashboard...
        </h1>
        <p className="text-center mt-4">Tunggu sebentar...</p>
      </main>
    );
  }

  return (
    <main
      className="flex-grow p-4 pt-10 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1
        className="text-3xl font-bold text-center"
        style={{ color: "#FA4EAB" }}
      >
        Login
      </h1>
      <p className="text-center mb-8 text-gray-400">
        Selamat datang kembali di MMB PWA.
      </p>

      {error && (
        <div className="bg-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Input Email */}
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg mt-1 text-gray-900 focus:ring-red-500 focus:border-red-500"
            placeholder="email@example.com"
          />
        </div>

        {/* Input Password */}
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg mt-1 text-gray-900 focus:ring-red-500 focus:border-red-500"
            placeholder="********"
          />
        </div>

        {/* Pilihan Role */}
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Login Sebagai
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-3 rounded-lg mt-1 text-gray-900 focus:ring-red-500 focus:border-red-500"
          >
            <option value="pegawai">Pegawai</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Tombol Login */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-bold transition-colors duration-200 ${
            isSubmitting
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isSubmitting ? "Memproses..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Belum punya akun?{" "}
          <a
            href="/register"
            style={{ color: "#FA4EAB" }}
            className="font-semibold hover:underline"
          >
            Daftar di sini
          </a>
        </p>
      </div>
    </main>
  );
}
