// src/app/laporan/page.js
import BottomNavBar from "@/components/BottomNavBar";
// Ini adalah halaman List-Detail kedua
export default function LaporanListPage() {
  const dummyLaporan = [
    { id: 101, tanggal: "2025-11-20", total: 750000, items: 8, pegawai: "Ani" },
    {
      id: 102,
      tanggal: "2025-11-21",
      total: 920000,
      items: 11,
      pegawai: "Budi",
    },
    {
      id: 103,
      tanggal: "2025-11-22",
      total: 1100000,
      items: 15,
      pegawai: "Ani",
    },
  ];

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <main className="flex-grow p-4 pt-10 mb-16 text-white">
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Laporan Penjualan
      </h1>
      <p className="mb-6 text-gray-300">
        Data penjualan toko Anda (dilindungi RLS).
      </p>

      <div className="space-y-4">
        {dummyLaporan.map((laporan) => (
          <div
            key={laporan.id}
            className="p-4 rounded-lg flex justify-between items-center transition-shadow duration-300"
            style={{ backgroundColor: "#1f1f1f" }}
          >
            <div>
              <h2 className="text-lg font-semibold">{laporan.tanggal}</h2>
              <p className="text-sm text-gray-400">
                Oleh: {laporan.pegawai} ({laporan.items} item)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold" style={{ color: "#FA4EAB" }}>
                {formatRupiah(laporan.total)}
              </span>
              <p className="text-xs text-gray-400">Lihat Detail &rarr;</p>
            </div>
            {/* Link ke Detail: /laporan/[id] */}
          </div>
        ))}
      </div>
      <BottomNavBar />
    </main>
  );
}
