/** @type {import('next').NextConfig} */
const nextConfig = {
  // La PWA scanner est statique (public/scanner/). On redirige l'URL propre
  // /scanner vers son index.html pour que les chemins relatifs (styles, lib/*,
  // service worker, manifest) résolvent bien sous /scanner/ et que le scope du
  // service worker reste /scanner/.
  async redirects() {
    return [{ source: "/scanner", destination: "/scanner/index.html", permanent: false }];
  },
};
export default nextConfig;
