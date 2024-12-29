import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            /**{
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                port: '',
                pathname: '/u/**',
            },**/
        ],
        localPatterns: [
            {
                pathname: '/images/**',
            },
        ]
    },
};

export default nextConfig;