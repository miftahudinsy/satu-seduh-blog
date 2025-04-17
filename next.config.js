/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        port: "",
        pathname: "/**", // Allow any path under this hostname
      },
      // Anda bisa menambahkan pattern lain di sini jika perlu
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/images/**',
      // },
    ],
  },
  // Opsi konfigurasi Next.js lainnya bisa ditambahkan di sini
};

module.exports = nextConfig;
