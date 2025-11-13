const nextConfig = {
  cacheComponents: true,
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  experimental: {
    authInterrupts: true,
    useCache: true,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  pageExtensions: ["tsx", "ts", "jsx", "js", "mdx"],
  images: {
    remotePatterns: [
      {
        hostname: "via.placeholder.com",
      },
      {
        hostname: "res.cloudinary.com",
      },
    ],
  },
  transpilePackages: ["swagger-ui-react"],
};

export default nextConfig;
