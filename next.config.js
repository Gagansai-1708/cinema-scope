/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 15, no experimental flag needed
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
    ],
  },
}

module.exports = nextConfig
