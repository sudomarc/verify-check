/** @type {import('next').NextConfig} */
const nextConfig = {
  // Le scanner est un PWA statique (public/scanner/). On expose une URL propre
  // /scanner qui sert son index.html, pour rester same-origin avec /api/scan.
  async rewrites() {
    return [
      { source: "/scanner", destination: "/scanner/index.html" },
      { source: "/scanner/", destination: "/scanner/index.html" },
    ];
  },
};

export default nextConfig;
