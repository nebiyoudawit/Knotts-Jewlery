import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  cleanDescription,
  formatTitle,
} from "../seo/site";

const JSON_LD_ID = "seo-jsonld";

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

const setJsonLd = (json) => {
  let el = document.getElementById(JSON_LD_ID);
  if (!json) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = JSON_LD_ID;
    document.head.appendChild(el);
  }
  el.textContent = json;
};

/**
 * Sets the document title and the SEO/social meta tags for the current page.
 * Pass a builder from src/seo/pages.js, e.g. useSeo(aboutSeo()).
 * Call it near the top of a page component, before any early return.
 *
 * The same tags are pre-rendered on the server by api/render.js; this hook keeps
 * them correct as the user navigates inside the app.
 *
 * - title: page-specific part; the brand is appended automatically. Omit for the home page.
 * - path: canonical path; defaults to the current pathname (query strings are never canonical).
 * - noindex: keep the page out of search results (account, cart, admin pages, search results).
 * - jsonLd: schema.org object (or array of them) from src/seo/schemas.js.
 */
const useSeo = ({
  title,
  description,
  image,
  path,
  type = "website",
  noindex = false,
  jsonLd,
} = {}) => {
  const { pathname } = useLocation();

  // Serialized so a new-but-equal object each render doesn't re-run the effect.
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    setJsonLd(jsonLdString);
  }, [jsonLdString]);

  useEffect(() => () => setJsonLd(null), []);

  useEffect(() => {
    const fullTitle = formatTitle(title);
    const desc = cleanDescription(description);
    const url = `${SITE_URL}${path ?? pathname}`;
    const img = absoluteUrl(image);

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
