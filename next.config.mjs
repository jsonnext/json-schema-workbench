/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@stoplight/json-schema-viewer', '@stoplight/json', 'jsonc-parser'],
  // reactStrictMode: true,
  experimental: {
    // appDir: true,
  },
}

export default nextConfig
