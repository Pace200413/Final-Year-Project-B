import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    qualities: [75, 85, 95],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Moved out of experimental (Next 15+)
  outputFileTracingRoot: __dirname,

  // Standalone output for better deployment
  output: "standalone",
};

export default config;