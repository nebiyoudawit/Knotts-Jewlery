// Per-page SEO metadata. The React pages pass these to useSeo(), and api/render.js
// uses the same builders to pre-render the <head> for crawlers, so both always agree.
//
// Each builder returns { title, description, image, path, type, noindex, jsonLd }.
import { CATEGORIES, categorySlug, productPath } from "./site.js";
import { storeSchema, breadcrumbSchema, itemListSchema, productSchema } from "./schemas.js";

export const homeSeo = () => ({
  path: "/",
  jsonLd: storeSchema(),
});

// products: optional list shown on the page (adds an ItemList for crawlers).
export const shopSeo = ({ search = "", products = [] } = {}) => ({
  title: search ? `Search results for "${search}"` : "Shop All Jewelry",
  description:
    "Browse the full Knotts Jewelry collection: handcrafted rings, necklaces, bracelets, earrings and charms. Prices in birr, pay on delivery in Addis Ababa.",
  path: "/products",
  noindex: Boolean(search),
  jsonLd: search
    ? undefined
    : [
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/products" },
        ]),
        ...(products.length ? [itemListSchema(products)] : []),
      ],
});

// Returns null for an unknown category slug.
export const categorySeo = (slug, { products = [] } = {}) => {
  const key = categorySlug(slug);
  const name = CATEGORIES[key];
  if (!name) return null;
  return {
    title: `Handcrafted ${name} in Addis Ababa`,
    description: `Shop handcrafted ${name.toLowerCase()} from Knotts Jewelry. Prices in birr, pay on delivery in Addis Ababa.`,
    path: `/products/${key}`,
    jsonLd: [
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/products" },
        { name, path: `/products/${key}` },
      ]),
      ...(products.length ? [itemListSchema(products)] : []),
    ],
  };
};

export const productSeo = (product) => {
  const category = CATEGORIES[categorySlug(product.category)];
  return {
    title: `${product.name} – ${Number(product.price).toLocaleString("en-US")} Birr`,
    description: `${product.name}: ${String(product.description || "").trim()} Handcrafted ${
      category ? category.toLowerCase() : "jewelry"
    } from Knotts Jewelry, Addis Ababa.`,
    image: product.images?.find((img) => img?.startsWith("http")),
    path: productPath(product),
    type: "product",
    jsonLd: [
      productSchema(product),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        category
          ? { name: category, path: `/products/${categorySlug(category)}` }
          : { name: "Shop", path: "/products" },
        { name: product.name, path: productPath(product) },
      ]),
    ],
  };
};

export const aboutSeo = () => ({
  title: "About Us",
  description:
    "Learn about Knotts Jewelry, an Addis Ababa jewelry store handcrafting rings, necklaces, bracelets, earrings and charms with quality materials.",
  path: "/about",
});

export const contactSeo = () => ({
  title: "Contact Us",
  description:
    "Contact Knotts Jewelry in Addis Ababa by phone, email, Instagram, Telegram or TikTok for orders, custom pieces and delivery questions.",
  path: "/contact",
});

export const notFoundSeo = () => ({
  title: "Page Not Found",
  noindex: true,
});

// Account, cart, checkout and admin pages: useful to people, not to search results.
export const privateSeo = (title) => ({ title, noindex: true });

// Route table used by the server renderer for pages without data.
export const PRIVATE_ROUTES = [
  { match: /^\/cart\/?$/, title: "Your Cart" },
  { match: /^\/wishlist\/?$/, title: "Your Wishlist" },
  { match: /^\/checkout\/?$/, title: "Checkout" },
  { match: /^\/profile\/?$/, title: "My Profile" },
  { match: /^\/orders\/?$/, title: "My Orders" },
  { match: /^\/login\/?$/, title: "Sign In" },
  { match: /^\/register\/?$/, title: "Create Account" },
  { match: /^\/order-confirmation\/[^/]+\/?$/, title: "Order Confirmed" },
  { match: /^\/admin(\/(product|order|user))?\/?$/, title: "Admin" },
];
