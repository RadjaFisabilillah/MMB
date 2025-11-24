// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  // Redirect jika sudah login
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return (
      <main
        className="flex min-h-screen items-center justify-center p-24"
        style={{ backgroundColor: "#323232" }}
      >
        <p className="text-white">Memuat Dashboard...</p>
      </main>
    );
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await login(email, password);

    if (error) {
      setMessage("Login Gagal: " + error.message);
    } else {
      setMessage("Login Berhasil! Mengarahkan...");
      router.replace("/dashboard"); // Redirect ke dashboard setelah sukses login
    }
    setLoading(false);
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{ backgroundColor: "#323232" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-xl shadow-2xl"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <h1
          className="text-3xl font-bold text-center mb-6"
          style={{ color: "#FA4EAB" }}
        >
          MMB Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FA4EAB] focus:border-[#FA4EAB] sm:text-sm"
              style={{ backgroundColor: "#323232", color: "white" }}
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FA4EAB] focus:border-[#FA4EAB] sm:text-sm"
              style={{ backgroundColor: "#323232", color: "white" }}
              disabled={loading}
            />
          </div>
          {message && (
            <p
              className={`text-sm text-center ${
                message.includes("Gagal") ? "text-red-400" : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FA4EAB] hover:bg-[#c73e87] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FA4EAB] transition duration-150"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="font-medium text-[#FA4EAB] hover:text-[#c73e87]"
          >
            Daftar di sini
          </a>
        </p>
      </div>
    </main>
  );
}
