/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@stoplight/json-schema-viewer', '@stoplight/json', 'jsonc-parser', '@jsonforms/vanilla-renderers'],
  // reactStrictMode: true,
  experimental: {
    // appDir: true,
  },
}

export default nextConfig
