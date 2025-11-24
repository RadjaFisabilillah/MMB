// src/app/profil/page.js
"use client";

import { useState, useEffect } from "react";
import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    // Ambil data dari tabel 'pegawai' dan join ke tabel 'toko'
    const { data, error } = await supabase
      .from("pegawai")
      .select(
        `
        nama, 
        role, 
        toko (nama)
      `
      )
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Gagal memuat profil:", error);
      setError(error.message);
    } else if (data) {
      setProfile({
        nama: data.nama,
        role: data.role,
        toko: data.toko.nama,
        email: user.email, // Ambil email dari Auth object
      });
    }
    setLoading(false);
  };

  // Fungsi pembantu untuk menentukan warna role
  const getRoleColor = (role) => {
    if (role === "admin") return "text-red-500 font-bold";
    return "text-green-500 font-bold";
  };

  if (loading) {
    return (
      <main
        className="flex-grow p-4 pt-10 mb-16 text-white text-center"
        style={{ backgroundColor: "#323232" }}
      >
        <p className="text-xl mt-10">Memuat Profil...</p>
        <BottomNavBar />
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main
        className="flex-grow p-4 pt-10 mb-16 text-white text-center"
        style={{ backgroundColor: "#323232" }}
      >
        <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
          Profil Pengguna
        </h1>
        <p className="text-red-500 mt-4">
          Error memuat data profil: {error || "Data tidak ditemukan."}
        </p>
        <BottomNavBar />
      </main>
    );
  }

  return (
    <main
      className="flex-grow p-4 pt-10 mb-16 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Profil Pengguna
      </h1>
      <p className="mb-6 text-gray-300">Informasi dan pengaturan akun Anda.</p>

      <section
        className="mt-6 p-4 rounded-lg space-y-4"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <div className="border-b border-gray-700 pb-2">
          <span className="font-medium block text-gray-400">Nama</span>
          <span className="text-xl">{profile.nama}</span>
        </div>
        <div className="border-b border-gray-700 pb-2">
          <span className="font-medium block text-gray-400">Email</span>
          <span>{profile.email}</span>
        </div>
        <div className="border-b border-gray-700 pb-2">
          <span className="font-medium block text-gray-400">Peran</span>
          <span className={`font-bold ${getRoleColor(profile.role)} uppercase`}>
            {profile.role}
          </span>
        </div>
        <div>
          <span className="font-medium block text-gray-400">Toko Bertugas</span>
          <span>{profile.toko}</span>
        </div>
      </section>

      <div className="mt-10">
        <button
          onClick={signOut}
          className="w-full py-3 rounded-lg font-bold border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
          style={{}}
        >
          Keluar (Sign Out)
        </button>
      </div>
      <BottomNavBar />
    </main>
  );
}
