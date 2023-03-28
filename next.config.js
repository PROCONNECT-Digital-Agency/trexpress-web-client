/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // i18n,
  optimizeFonts: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    MAP_KEY: "AIzaSyCjcdsFmCp9IITrBKL-QGPamisSvR4yUBY",
    API_URL: "https://api.trexpress.uz",
    DEFAULT_LOCATION: `${41.2646},${69.2163}`,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      "pk_test_51LaGXyLrMlc0ddAAYc8wxwq8eFj9HbgpvValjxRtg2OZzTJDwFz0ZmATL1TOqAWUFBM3CeHbI5Cny71MzkrAXRxa00XTCJArPr",
    STRIPE_SECRET_KEY:
      "sk_test_51LaGXyLrMlc0ddAAFGTcyYkpVuaASL6XyY0djSEbnbhjFmaD51n1SL7hakh7UkjubMnykJ1wrH15QfbEWN7byuIG00kMcA2yxg",
  },
  distDir: "_next",
};

module.exports = nextConfig;
