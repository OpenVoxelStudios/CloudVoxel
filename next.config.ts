import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Image configuration
    images: {
        remotePatterns: [
            // Uncomment and add any external image sources you need
            // {
            //   protocol: 'https',
            //   hostname: 'avatars.githubusercontent.com',
            //   port: '',
            //   pathname: '/u/**',
            // },
        ],
        localPatterns: [
            {
                pathname: '/images/**',
            },
        ],
        // Enable image optimization caching for better performance
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Production optimizations
    productionBrowserSourceMaps: false, // Disable source maps in production for better performance
    compress: true, // Enable gzip compression
    poweredByHeader: false, // Remove X-Powered-By header for security

    // Cache optimization
    generateEtags: true,

    // Build optimization
    swcMinify: true, // Use SWC for minification (faster than Terser)

    // Runtime configuration
    reactStrictMode: true,

    // Output configuration
    output: 'standalone', // Creates a standalone build that's easier to deploy

    // Headers for security and caching
    async headers() {
        return [
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
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ]
            },
            {
                // Cache static assets
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

    // Webpack configuration for production optimization
    webpack: (config, { isServer }) => {
        // Optimize CSS
        if (!isServer) {
            config.optimization.splitChunks.cacheGroups = {
                ...config.optimization.splitChunks.cacheGroups,
                styles: {
                    name: 'styles',
                    test: /\.(css|scss)$/,
                    chunks: 'all',
                    enforce: true,
                },
            };
        }

        return config;
    },
};

export default nextConfig;