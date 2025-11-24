// src/app/(auth)/login/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider"; // Ambil useAuth dari provider

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
    // Jika sukses, AuthProvider akan otomatis mengarahkan ke /dashboard
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "#323232" }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-xl shadow-2xl"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <h1
          className="text-3xl font-bold text-center mb-6"
          style={{ color: "#FA4EAB" }}
        >
          MMB Login
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Masuk untuk mengelola stok dan karyawan.
        </p>

        {errorMsg && (
          <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Memuat..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold"
            style={{ color: "#FA4EAB" }}
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
