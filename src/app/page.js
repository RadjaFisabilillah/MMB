// src/app/page.js (New Dynamic Login Page)
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("pegawai"); // Default Pegawai
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isPegawaiLogin = selectedRole === "pegawai";

  // 1. Redirect jika sudah login
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // 2. Fetch Daftar Toko untuk Pegawai Dropdown
  const fetchStores = useCallback(async () => {
    const { data, error } = await supabase
      .from("toko")
      .select("id, nama")
      .order("nama", { ascending: true });

    if (!error && data && data.length > 0) {
      setStores(data);
      setSelectedStoreId(data[0].id); // Set default toko
    } else if (error) {
      console.error("Gagal memuat toko:", error);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // 3. Handle Login Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isPegawaiLogin && !selectedStoreId) {
      setMessage("Pilih toko untuk login sebagai Pegawai.");
      setLoading(false);
      return;
    }

    // Panggil fungsi login standar Supabase
    const { data: authData, error: authError } = await login(email, password);

    if (authError) {
      setMessage("Login Gagal: " + authError.message);
      setLoading(false);
      return;
    }

    // Verifikasi Auth Sukses, sekarang Cek/Update Role dan Store
    const userId = authData.user?.id;
    if (userId) {
      // Fetch role yang sebenarnya di DB
      const { data: profileData, error: profileError } = await supabase
        .from("pegawai")
        .select("role")
        .eq("id", userId)
        .single();

      const actualRole = profileData?.role;

      if (profileError) {
        setMessage("Error saat memverifikasi profil di DB.");
        await supabase.auth.signOut();
      } else if (actualRole !== selectedRole) {
        setMessage(
          `Gagal: Anda login sebagai ${actualRole.toUpperCase()}, tetapi memilih ${selectedRole.toUpperCase()}.`
        );
        await supabase.auth.signOut(); // Wajib signOut jika role tidak match
      } else {
        // Lakukan Update Store ID hanya jika login sebagai Pegawai
        if (isPegawaiLogin) {
          // Update tabel Pegawai dengan store_id yang dipilih
          const { error: updateError } = await supabase
            .from("pegawai")
            .update({ store_id: selectedStoreId })
            .eq("id", userId);

          if (updateError) {
            setMessage("Error saat mengikat ke toko. Coba lagi.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
        }
        // Sukses Login & Redirect
        router.replace("/dashboard");
      }
    }
    setLoading(false);
  };

  if (user) {
    return (
      <main
        className="flex min-h-screen items-center justify-center p-24"
        style={{ backgroundColor: "#323232" }}
      >
        <p className="text-white">Mengarahkan ke Dashboard...</p>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OPSI PILIH ROLE */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Login Sebagai
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm"
              style={{ backgroundColor: "#323232", color: "white" }}
              disabled={loading}
            >
              <option value="pegawai">Pegawai</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* OPSI PILIH TOKO (Hanya muncul jika Pegawai) */}
          {isPegawaiLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Pilih Toko Jaga
              </label>
              <select
                value={selectedStoreId || ""}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                required={isPegawaiLogin}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm"
                style={{ backgroundColor: "#323232", color: "white" }}
                disabled={loading || stores.length === 0}
              >
                {stores.length === 0 && (
                  <option value="">Memuat Toko...</option>
                )}
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.nama}
                  </option>
                ))}
              </select>
              {stores.length === 0 && (
                <p className="text-xs text-red-400 mt-1">
                  Tidak ada toko tersedia. Hubungi Admin.
                </p>
              )}
            </div>
          )}

          {/* INPUT EMAIL & PASSWORD */}
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
          <Link
            href="/register"
            className="font-medium text-[#FA4EAB] hover:text-[#c73e87]"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
