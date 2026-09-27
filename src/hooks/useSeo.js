import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Set VITE_SITE_URL to the production domain; every canonical and og:url is built from it.
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://knotts-jewlery-xjku.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Knotts Jewelry";

const DEFAULT_TITLE = `${SITE_NAME} – Handcrafted Jewelry in Addis Ababa`;
const DEFAULT_DESCRIPTION =
  "Shop handcrafted rings, necklaces, bracelets, earrings and charms from Knotts Jewelry in Addis Ababa. Pay on delivery, or pick up in Figa, Gerji or Megenagna.";
const DEFAULT_IMAGE = `${SITE_URL}/hero-img1.jpg`;

const upsertMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const toAbsolute = (url) => {
  if (!url) return DEFAULT_IMAGE;
  if (/^https?:\/\//.test(url)) return url;
  return `${SITE_URL}/${url.replace(/^\//, "")}`;
};

/**
 * Sets the document title and the SEO/social meta tags for the current page.
 * Call it once near the top of a page component, before any early return.
 *
 * - title: page-specific part; the brand is appended automatically. Omit for the home page.
 * - path: canonical path; defaults to the current pathname (query strings are never canonical).
 * - noindex: keep the page out of search results (account, cart, admin pages, search results).
 */
const useSeo = ({
  title,
  description,
  image,
  path,
  type = "website",
  noindex = false,
} = {}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim().slice(0, 160);
    const url = `${SITE_URL}${path ?? pathname}`;
    const img = toAbsolute(image);

    document.title = fullTitle;
    upsertMeta("name", "description", desc);
    upsertMeta("name", "robots", noindex ? "noindex, follow" : "index, follow");
    upsertCanonical(url);

    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", img);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("name", "twitter:image", img);
  }, [title, description, image, path, type, noindex, pathname]);
};

export default useSeo;
