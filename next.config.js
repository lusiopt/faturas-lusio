/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/faturas',
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true
}

export default nextConfig
