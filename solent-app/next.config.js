/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['localhost'],
    },
    webpack: (config) => {
      config.externals = [...config.externals, { "leaflet": "L" }];
      return config;
    },
  }