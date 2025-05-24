import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental: {
        // appDir: true,
    },
    images: {
        domains: ['localhost', 'yourdomain.com'],
        formats: ['image/webp', 'image/avif'],
    },
    async rewrites() {
        return [
            {
                source: '/uploads/:path*',
                destination: process.env.NODE_ENV === 'production'
                    ? 'https://yourdomain.com/uploads/:path*'
                    : '/uploads/:path*'
            }
        ];
    },
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            path: false,
        };
        return config;
    }
};

export default nextConfig;
