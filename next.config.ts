/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self' https://www.gstatic.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              connect-src 'self' http://localhost:5000;
              style-src 'self' 'unsafe-inline' https://www.gstatic.com;
              img-src 'self' data:;
            `.replace(/\s{2,}/g, " "), // Remove espaços extras
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
