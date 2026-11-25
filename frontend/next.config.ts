import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // NEXT_PUBLIC values are compiled into the browser bundle, not read at runtime.
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      (process.env.NODE_ENV === "development" ? "http://localhost:4000" : ""),
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
