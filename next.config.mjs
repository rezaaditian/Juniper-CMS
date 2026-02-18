/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    allowedDevOrigins: [
      "http://10.80.80.5:4000",
      "http://localhost:3000", 
      "http://127.0.0.1:3000",
      "10.80.80.5:4000",
      "localhost:3000",
      "127.0.0.1:3000"
    ],
  },
}

export default nextConfig
