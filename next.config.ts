/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self' https://www.gstatic.com;",
              "script-src 'self';", // Permite scripts só do seu domínio, bloqueia inline e eval
              "connect-src 'self' http://localhost:5000;", // Seu backend local
              "style-src 'self' https://www.gstatic.com;", // Só styles externos confiáveis, sem inline
              "img-src 'self' data:;", // Imagens locais e base64
              "font-src 'self';",
              "frame-src 'none';",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';",
            ].join(" "),
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
