// Framework-free SEO constants and helpers, shared by the React app (src/hooks/useSeo.js)
// and the Vercel edge function that pre-renders pages for crawlers (api/render.js).
// Keep this file free of React/browser-only imports.

const viteEnv = import.meta.env || {};
const serverEnv = globalThis.process?.env || {};

// Public storefront domain. Set VITE_SITE_URL on Vercel when moving to a custom domain.
export const SITE_URL = (
  viteEnv.VITE_SITE_URL ||
  serverEnv.VITE_SITE_URL ||
  "https://knotts-jewlery-xjku.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Knotts Jewelry";
export const DEFAULT_TITLE = `${SITE_NAME} – Handcrafted Jewelry in Addis Ababa`;
export const DEFAULT_DESCRIPTION =
  "Knotts Jewelry: handcrafted rings, necklaces, bracelets, earrings and charms in Addis Ababa. Shop online and pay on delivery.";
export const DEFAULT_IMAGE = `${SITE_URL}/hero-img1.jpg`;

export const PHONE = "+251961599628";
export const PHONE_DISPLAY = "0961599628";
export const EMAIL = "knottsjewelry@gmail.com";
export const DELIVERY_AREAS = ["Summit", "4 Kilo", "Megenagna", "Figa"];
export const SOCIAL_PROFILES = [
  "https://www.instagram.com/knotts_jewelry",
  "https://t.me/knotts_jewelry",
  "https://www.tiktok.com/@knotts_jewelry",
];

// URL slug -> category name used by the API.
export const CATEGORIES = {
  rings: "Rings",
  necklaces: "Necklaces",
  bracelets: "Bracelets",
  earrings: "Earrings",
  charms: "Charms",
};

export const categorySlug = (category) => String(category || "").toLowerCase();

export const absoluteUrl = (url) => {
  if (!url) return DEFAULT_IMAGE;
  if (/^https?:\/\//.test(url)) return url;
  return `${SITE_URL}/${url.replace(/^\//, "")}`;
};

export const formatTitle = (title) => (title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE);

export const cleanDescription = (text) =>
  String(text || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim().slice(0, 160);

// Keep in sync with slugify() in backend/controllers/sitemapController.js
export const slugify = (text) =>
  String(text || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");

// Product URLs look like /product/heart-necklaces-6a9031cf31ee156db3d2d63b.
// Only the trailing Mongo id matters; the slug is for people and search engines.
export const productPath = (product) => {
  const slug = slugify(product?.name);
  return `/product/${slug ? `${slug}-` : ""}${product?._id}`;
};

export const productIdFromParam = (param) => {
  const match = String(param || "").match(/([a-f0-9]{24})$/i);
  return match ? match[1] : String(param || "");
};
