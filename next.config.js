/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a minimal, self-contained server build for Docker deployment.
  output: "standalone",
};

module.exports = nextConfig;

