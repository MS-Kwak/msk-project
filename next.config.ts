import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    fetches: {
      fullUrl: true, // Log full URLs for fetch requests
    },
  },
  images: {
    domains: ['fbohmnjjsfwjbcqjaaad.supabase.co'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10gb', // 여기서 크기를 조정하세요
    },
  },
};

export default nextConfig;
