// src/app/profil/page.js
"use client";

import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilPage() {
  const { user, signOut } = useAuth(); // Ambil dari context

  // Data Profil Pegawai simulasi
  const profile = {
    nama: "Nyonya Besar MMB",
    role: "Admin",
    toko: "MMB Pusat Jakarta",
    email: user?.email || "user@mmb.com",
  };

  return (
    <main className="flex-grow p-4 pt-10 mb-16 text-white">
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
          <span className="font-bold">{profile.role}</span>
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
