import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [],
        localPatterns: [
            {
                pathname: '/images/**',
            },
            {
                pathname: '/*.png',
            },
        ],
    },

    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
    productionBrowserSourceMaps: false,

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "img-src 'self' https:", // Allows HTTPS images from any domain
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Needed for Next.js
                            "style-src 'self' 'unsafe-inline'", // Needed for styled-components/CSS
                            "connect-src 'self'",
                            "font-src 'self'",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "frame-ancestors 'none'",
                        ].join('; ')
                    }
                ],
            },
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                ]
            },
            {
                source: '/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            }
        ];
    },
};

export default nextConfig;