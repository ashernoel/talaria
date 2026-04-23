/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@talaria/shared"],
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
