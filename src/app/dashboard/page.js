// src/app/dashboard/page.js
import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/components/AuthProvider";

// Halaman Server/Komponen Statis Sederhana untuk Boilerplate
export default function DashboardPage() {
  const { user } = {}; // Gunakan useAuth jika ini adalah Client Component

  return (
    <main className="flex-grow p-4 pt-10 mb-16 text-white">
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        👋 Selamat Datang!
      </h1>
      <p className="text-lg mt-2">Ini adalah Dashboard **MMB** Anda.</p>

      <div className="mt-8 space-y-4">
        <section
          className="p-4 rounded-lg"
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "#FA4EAB" }}
          >
            Ringkasan Hari Ini
          </h2>
          <p>Total Penjualan: - (Integrasi Laporan)</p>
          <p>Status Absensi: - (Integrasi Absensi)</p>
        </section>

        <section
          className="p-4 rounded-lg"
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "#FA4EAB" }}
          >
            Peringatan Stok Kritis
          </h2>
          <p>Item Kritis (DoS &lt; 7 hari): - (Integrasi Stok)</p>
        </section>
      </div>

      <p className="mt-10 text-sm text-gray-400">
        Peran Anda: {user ? "Dimuat..." : "Pegawai/Admin"}
      </p>

      <BottomNavBar />
    </main>
  );
}
