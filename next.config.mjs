/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'cf.geekdo-static.com',
            },
            {
                protocol: 'https',
                hostname: 'cf.geekdo-images.com',
            }
        ],
    },
};

export default nextConfig;
