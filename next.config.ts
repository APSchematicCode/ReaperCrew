import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'kvttaeuozbhafvnkchyw.supabase.co' },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  // ✅ Enable raw body for webhook route
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig