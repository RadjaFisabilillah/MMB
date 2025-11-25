// src/app/register/page.js (MODIFIED)
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    // 1. DAFTAR di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (authError) {
      setErrorMsg(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;

    if (userId) {
      // 2. Buat entri di tabel PEGAWAI (Profil)
      // FIX: store_id disetel NULL agar pegawai tidak terikat toko saat registrasi
      const { error: profileError } = await supabase.from("pegawai").insert({
        id: userId,
        nama: name,
        role: "pegawai", // Default role
        store_id: null, // Pegawai didaftarkan tanpa ikatan toko awal (SESUAI PERMINTAAN)
      });

      if (profileError) {
        await supabase.auth.admin.deleteUser(userId);
        setErrorMsg(
          `Pendaftaran gagal (DB Error): ${profileError.message}. Akun Auth dihapus.`
        );
        setLoading(false);
        return;
      }

      // 3. Sukses, redirect
      setSuccessMsg("Pendaftaran berhasil! Silakan Login.");
      router.push("/"); // Redirect ke halaman utama (Login)
    } else {
      setSuccessMsg(
        "Pendaftaran berhasil! Harap konfirmasi email Anda sebelum login."
      );
    }

    setLoading(false);
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "#323232" }}
    >
      {/* ... (Halaman Register UI) ... */}
      <div
        className="w-full max-w-sm p-8 rounded-xl shadow-2xl"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <h1
          className="text-3xl font-bold text-center mb-6"
          style={{ color: "#FA4EAB" }}
        >
          Daftar MMB
        </h1>

        {successMsg && (
          <div className="bg-green-900 bg-opacity-50 text-green-300 p-3 rounded mb-4 text-sm">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-white transition-opacity duration-300 disabled:opacity-50"
            style={{ backgroundColor: "#FA4EAB" }}
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Sudah punya akun?{" "}
          <Link href="/" className="font-semibold" style={{ color: "#FA4EAB" }}>
            Login di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
