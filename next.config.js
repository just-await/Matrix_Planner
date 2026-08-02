/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Включает статический экспорт HTML/CSS/JS
  images: {
    unoptimized: true, // Отключает серверную оптимизацию картинок
  },
};

export default nextConfig;