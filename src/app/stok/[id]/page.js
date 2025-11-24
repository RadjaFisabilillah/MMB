// src/app/stok/[id]/page.js
export default function StokDetailPage({ params }) {
  const { id } = params;

  // Data simulasi untuk demonstrasi
  const item = {
    id: id,
    nama: "Baccarat 540 Premium",
    volume: 850,
    kapasitas: 1000,
    dos: 5,
    rata_rata_harian: 170, // 850ml / 5 hari
    supplier: "PT. Aroma Indah",
  };

  const dosStatus =
    item.dos <= 7 ? "KRITIS" : item.dos <= 14 ? "PERINGATAN" : "AMAN";

  return (
    <main className="flex-grow p-4 pt-10 text-white">
      <h1 className="text-2xl font-bold" style={{ color: "#FA4EAB" }}>
        Detail Stok: {item.nama}
      </h1>
      <p className="text-sm text-gray-400">ID Stok: {item.id}</p>

      <section
        className="mt-6 p-4 rounded-lg space-y-3"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <h2 className="text-xl font-semibold">Metrik Kritis</h2>
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="font-medium">Days of Supply (DoS):</span>
          <span
            className={`text-xl font-bold ${
              dosStatus === "KRITIS"
                ? "text-red-500"
                : dosStatus === "PERINGATAN"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {item.dos} Hari ({dosStatus})
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="font-medium">Rata-rata Penjualan Harian:</span>
          <span>{item.rata_rata_harian} mL/hari</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Volume Saat Ini:</span>
          <span>
            {item.volume} / {item.kapasitas} mL
          </span>
        </div>
      </section>

      {/* Form untuk Update/Input Stok Manual (hanya admin/pegawai berizin) */}
      <div className="mt-8">
        <button
          className="w-full py-3 rounded-lg font-bold"
          style={{ backgroundColor: "#FA4EAB", color: "#FFFFFF" }}
        >
          Tambah Stok (Restock)
        </button>
      </div>
    </main>
  );
}
