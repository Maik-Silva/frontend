const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self' https://www.gstatic.com;",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
              "style-src 'self' 'unsafe-inline' https://www.gstatic.com;",
              "connect-src 'self' http://localhost:5000 https://backend-production-e77b.up.railway.app;",
              "img-src 'self' data:;"
            ].join(" "),
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
