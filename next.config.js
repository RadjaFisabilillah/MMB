// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  // Nonaktifkan di development untuk mempermudah debugging
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hapus semua di dalam 'experimental' karena App Router sudah default di Next 16+
  // Tambahkan ini agar next-pwa (Webpack) berfungsi di lingkungan Turbopack
  webpack: (config, { isServer }) => {
    // Anda tidak perlu memodifikasi config di sini,
    // hanya mendeklarasikan blok 'webpack' sudah cukup untuk memicu Webpack.
    return config;
  },
};

module.exports = nextConfig;
