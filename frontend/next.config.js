/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.arasaac.org',
      },
    ],
  },
  // Proxy /api → backend (local, túnel o Vercel con BACKEND_URL=https://…onrender.com).
  async rewrites() {
    const backend = (process.env.BACKEND_URL || 'http://127.0.0.1:8000').replace(
      /\/$/,
      ''
    )
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
