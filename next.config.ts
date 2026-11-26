import type { NextConfig } from "next";

const config: NextConfig = {
  agentRules: false,
  devIndicators: false,
  async redirects() {
    return [{ source: "/", destination: "/es", permanent: true }];
  },
};

export default config;
