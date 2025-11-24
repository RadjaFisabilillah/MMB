// src/lib/stockService.js

/**
 * Menghitung Days of Supply (DoS)
 * @param {number} currentVolume - Volume stok saat ini (mL)
 * @param {number} dailyAvgSales - Rata-rata penjualan harian (mL/hari)
 * @returns {number} DoS dalam hari
 */
export function calculateDoS(currentVolume, dailyAvgSales) {
  if (dailyAvgSales <= 0) {
    return 999; // Sangat aman/tidak ada penjualan (diberi nilai tinggi)
  }
  return Math.floor(currentVolume / dailyAvgSales);
}

/**
 * Menentukan status kritis berdasarkan DoS.
 * @param {number} dos - Days of Supply
 * @returns {string} Status ('Kritis', 'Peringatan', 'Aman')
 */
export function getDoSStatus(dos) {
  if (dos <= 7) return "Kritis";
  if (dos <= 14) return "Peringatan";
  return "Aman";
}
