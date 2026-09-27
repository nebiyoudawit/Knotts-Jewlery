// Server-side pages for search engines and link previews.
//
// Every page route is rewritten here (see vercel.json). We take the built app shell
// (dist/app.html), fill in the page's real <title>, meta tags, canonical URL and
// JSON-LD, and put readable content (headings, text, product links) inside #root.
// React replaces that content as soon as the app loads, so people see the normal site;
// crawlers and Telegram/Facebook/WhatsApp previews get a complete page without JS.
//
// It also returns real 404s for unknown URLs and 301-redirects old product URLs
// (/product/<id>) to their readable form (/product/<name>-<id>).
import {
  SITE_NAME,
  SITE_URL,
  CATEGORIES,
  DELIVERY_AREAS,
  EMAIL,
  PHONE,
  PHONE_DISPLAY,
  SOCIAL_PROFILES,
  absoluteUrl,
  categorySlug,
  cleanDescription,
  formatTitle,
  productIdFromParam,
  productPath,
} from "../src/seo/site.js";
import {
  PRIVATE_ROUTES,
  aboutSeo,
  categorySeo,
  contactSeo,
  homeSeo,
  notFoundSeo,
  privateSeo,
  productSeo,
  shopSeo,
} from "../src/seo/pages.js";

export const config = { runtime: "edge" };

const API_URL = (
  process.env.SEO_API_URL ||
  process.env.VITE_API_URL ||
  "https://knotts-jewlery-1.onrender.com/api"
).replace(/\/$/, "");

// Render's free tier sleeps; don't make visitors wait for it to wake up.
const API_TIMEOUT_MS = 4000;
const TEMPLATE_PATH = "/app.html";
const HEAD_START = "<!--seo:head:start-->";
const HEAD_END = "<!--seo:head:end-->";
const ROOT_TAG = '<div id="root"></div>';

const CACHE = {
  page: "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
  notFound: "public, max-age=0, s-maxage=300",
  redirect: "public, max-age=3600, s-maxage=86400",
  unavailable: "no-store",
};

// ---------------------------------------------------------------------------
// helpers

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// JSON inside <script> must not be able to close the tag.
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const formatPrice = (price) => `${Number(price).toLocaleString("en-US")} Birr`;

const fetchApi = async (path) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    const body = await res.json().catch(() => null);
    return { status: res.status, data: body?.data ?? null };
  } catch {
    return { status: 0, data: null }; // timeout or network error
  } finally {
    clearTimeout(timer);
  }
};

const fetchProducts = async (path) => {
  const { data } = await fetchApi(path);
  return Array.isArray(data) ? data : [];
};

// ---------------------------------------------------------------------------
// <head>

const renderHead = (seo) => {
  const title = formatTitle(seo.title);
  const description = cleanDescription(seo.description);
  const image = absoluteUrl(seo.image);
  const url = seo.path ? `${SITE_URL}${seo.path}` : null;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${seo.noindex ? "noindex, follow" : "index, follow"}" />`,
    url && `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="${escapeHtml(seo.type || "website")}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    url && `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    seo.jsonLd &&
      `<script type="application/ld+json" id="seo-jsonld">${safeJson(seo.jsonLd)}</script>`,
  ];
  return tags.filter(Boolean).join("\n    ");
};

// ---------------------------------------------------------------------------
// page content (shown until the app loads; this is what crawlers read)

const STYLE = `<style>
.seo-ssr{font-family:Montserrat,system-ui,sans-serif;color:#1f2937;max-width:1100px;margin:0 auto;padding:16px}
.seo-ssr a{color:#047857;text-decoration:none}
.seo-ssr header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:8px 0 16px;border-bottom:1px solid #e5e7eb}
.seo-ssr nav{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:14px}
.seo-ssr h1{font-size:28px;margin:24px 0 8px}
.seo-ssr h2{font-size:20px;margin:24px 0 8px}
.seo-ssr p{line-height:1.6;color:#4b5563;max-width:720px}
.seo-ssr ul.products{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px}
.seo-ssr ul.products img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;background:#f3f4f6}
.seo-ssr .price{font-weight:600;color:#111827}
.seo-ssr .product{display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin-top:16px}
.seo-ssr .product img{width:100%;max-width:520px;border-radius:16px}
.seo-ssr footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:14px;color:#6b7280}
</style>`;

const shell = (main) => `${STYLE}
<div class="seo-ssr">
  <header>
    <a href="/"><img src="/logo.png" alt="${SITE_NAME}" height="44" width="142" /></a>
    <nav aria-label="Main">
      <a href="/">Home</a>
      <a href="/products">Shop</a>
      ${Object.entries(CATEGORIES)
        .map(([slug, name]) => `<a href="/products/${slug}">${name}</a>`)
        .join("\n      ")}
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
  <main>
${main}
  </main>
  <footer>
    <p><strong>${SITE_NAME}</strong> – handcrafted jewelry in Addis Ababa. Delivery to ${DELIVERY_AREAS.join(", ")}.</p>
    <p>Phone: <a href="tel:${PHONE}">${PHONE_DISPLAY}</a> · Email: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
    <p>${SOCIAL_PROFILES.map((url) => `<a href="${url}" rel="me">${escapeHtml(new URL(url).hostname.replace("www.", ""))}</a>`).join(" · ")}</p>
  </footer>
</div>`;

const productList = (products) =>
  products.length
    ? `<ul class="products">
${products
  .map((p) => {
    const img = p.image || p.images?.find((i) => i?.startsWith("http"));
    return `  <li><a href="${escapeHtml(productPath(p))}">${
      img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" loading="lazy" />` : ""
    }<span>${escapeHtml(p.name)}</span></a><br /><span class="price">${formatPrice(p.price)}</span></li>`;
  })
  .join("\n")}
</ul>`
    : "";

const homeBody = (products) =>
  shell(`<h1>${SITE_NAME}</h1>
<p>Welcome to ${SITE_NAME}, a jewelry store in Addis Ababa. Shop handcrafted rings, necklaces, bracelets, earrings and charms online and pay on delivery.</p>
<h2>Shop by category</h2>
<ul>${Object.entries(CATEGORIES)
    .map(([slug, name]) => `<li><a href="/products/${slug}">${name}</a></li>`)
    .join("")}</ul>
${products.length ? `<h2>New arrivals</h2>\n${productList(products)}` : ""}`);

const listingBody = (heading, intro, products) =>
  shell(`<h1>${escapeHtml(heading)}</h1>
<p>${escapeHtml(intro)}</p>
${productList(products)}`);

const productBody = (product) => {
  const category = CATEGORIES[categorySlug(product.category)];
  const images = (product.images || []).filter((i) => i?.startsWith("http"));
  return shell(`<p><a href="/">Home</a> › ${
    category
      ? `<a href="/products/${categorySlug(category)}">${category}</a>`
      : `<a href="/products">Shop</a>`
  } › ${escapeHtml(product.name)}</p>
<div class="product">
  <div>${images
    .slice(0, 4)
    .map((src, i) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(product.name)}${i ? ` – view ${i + 1}` : ""}" ${i ? 'loading="lazy"' : ""} />`)
    .join("\n  ")}</div>
  <div>
    <h1>${escapeHtml(product.name)}</h1>
    <p class="price">${formatPrice(product.price)}${
      product.onSale && product.originalPrice ? ` <s>${formatPrice(product.originalPrice)}</s>` : ""
    }</p>
    <p>${product.inStock === false ? "Out of stock" : "In stock"} · Pay on delivery in Addis Ababa</p>
    ${product.reviewCount > 0 ? `<p>Rated ${Math.round(product.rating * 10) / 10} out of 5 from ${product.reviewCount} review${product.reviewCount === 1 ? "" : "s"}.</p>` : ""}
    <h2>Description</h2>
    <p>${escapeHtml(String(product.description || "").trim())}</p>
  </div>
</div>`);
};

const textBody = (heading, paragraphs) =>
  shell(`<h1>${escapeHtml(heading)}</h1>
${paragraphs.map((p) => `<p>${p}</p>`).join("\n")}`);

const notFoundBody = () =>
  textBody("Page not found", [
    `We couldn't find that page. <a href="/">Go to the home page</a> or <a href="/products">shop all jewelry</a>.`,
  ]);

// ---------------------------------------------------------------------------
// routing

const NOT_FOUND = { status: 404, seo: notFoundSeo(), body: notFoundBody() };

const resolvePage = async (path, params) => {
  if (path === "/") {
    const products = await fetchProducts("/product/sorted?sortBy=latest&limit=12");
    return { status: 200, seo: homeSeo(), body: homeBody(products) };
  }

  if (path === "/products" || path === "/product") {
    const search = (params.get("search") || "").trim();
    const products = (
      await fetchProducts(`/product${search ? `?search=${encodeURIComponent(search)}` : ""}`)
    ).slice(0, 30);
    const seo = shopSeo({ search, products });
    const heading = search ? `Search results for "${search}"` : "All Jewelry";
    return { status: 200, seo, body: listingBody(heading, seo.description, products) };
  }

  const categoryMatch = path.match(/^\/products\/([^/]+)$/);
  if (categoryMatch) {
    const slug = categorySlug(categoryMatch[1]);
    const name = CATEGORIES[slug];
    if (!name) return NOT_FOUND;
    if (categoryMatch[1] !== slug) return { redirect: `/products/${slug}` };
    const products = (
      await fetchProducts(`/product/category/${encodeURIComponent(name)}?limit=60`)
    ).slice(0, 30);
    const seo = categorySeo(categoryMatch[1], { products });
    return { status: 200, seo, body: listingBody(name, seo.description, products) };
  }

  const productMatch = path.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    const id = productIdFromParam(decodeURIComponent(productMatch[1]));
    if (!/^[a-f0-9]{24}$/i.test(id)) return NOT_FOUND;

    const { status, data: product } = await fetchApi(`/product/${id}`);
    if (status === 404 || status === 400) return NOT_FOUND;
    if (status !== 200 || !product) {
      // API asleep or failing: serve the app, ask crawlers to come back later.
      return { status: 503, seo: { noindex: true }, body: "" };
    }

    const canonical = productPath(product);
    if (path !== canonical) return { redirect: canonical };
    return { status: 200, seo: productSeo(product), body: productBody(product) };
  }

  if (path === "/about") {
    return {
      status: 200,
      seo: aboutSeo(),
      body: textBody("About Knotts Jewelry", [
        escapeHtml(aboutSeo().description),
        `Browse our <a href="/products">collection</a> or <a href="/contact">get in touch</a>.`,
      ]),
    };
  }

  if (path === "/contact") {
    return {
      status: 200,
      seo: contactSeo(),
      body: textBody("Contact Knotts Jewelry", [
        `Phone: <a href="tel:${PHONE}">${PHONE_DISPLAY}</a>`,
        `Email: <a href="mailto:${EMAIL}">${EMAIL}</a>`,
        `We deliver to ${DELIVERY_AREAS.join(", ")} in Addis Ababa.`,
      ]),
    };
  }

  const privateRoute = PRIVATE_ROUTES.find((route) => route.match.test(path));
  if (privateRoute) return { status: 200, seo: privateSeo(privateRoute.title), body: "" };

  return NOT_FOUND;
};

// ---------------------------------------------------------------------------
// template

let cachedTemplate = null;

const loadTemplate = async (origin, request) => {
  if (cachedTemplate) return cachedTemplate;
  // Forward cookies so this also works on password-protected preview deployments.
  const res = await fetch(`${origin}${TEMPLATE_PATH}`, {
    headers: { cookie: request.headers.get("cookie") || "" },
  });
  if (!res.ok) throw new Error(`Template fetch failed: ${res.status}`);
  const html = await res.text();
  if (!html.includes(HEAD_START) || !html.includes(ROOT_TAG)) {
    throw new Error("Template is missing SEO markers");
  }
  cachedTemplate = html;
  return html;
};

const fillTemplate = (template, { seo, body }) => {
  const start = template.indexOf(HEAD_START);
  const end = template.indexOf(HEAD_END) + HEAD_END.length;
  const withHead = `${template.slice(0, start)}${renderHead(seo)}${template.slice(end)}`;
  return body ? withHead.replace(ROOT_TAG, `<div id="root">${body}</div>`) : withHead;
};

const html = (content, status, cacheControl) =>
  new Response(content, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": cacheControl,
    },
  });

export default async function handler(request) {
  const url = new URL(request.url);

  // vercel.json passes the original path as ?__path=...; everything else is the real query.
  let path = `/${(url.searchParams.get("__path") || "").replace(/^\/+/, "")}`;
  url.searchParams.delete("__path");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  const query = url.searchParams.toString();

  let template;
  try {
    template = await loadTemplate(url.origin, request);
  } catch (err) {
    console.error("render: cannot load app shell", err);
    return new Response("Temporarily unavailable, please refresh.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": CACHE.unavailable, "retry-after": "30" },
    });
  }

  try {
    const page = await resolvePage(path, url.searchParams);

    if (page.redirect) {
      return new Response(null, {
        status: 301,
        headers: {
          location: `${page.redirect}${query ? `?${query}` : ""}`,
          "cache-control": CACHE.redirect,
        },
      });
    }

    const cache =
      page.status === 200 ? CACHE.page : page.status === 404 ? CACHE.notFound : CACHE.unavailable;
    return html(fillTemplate(template, page), page.status, cache);
  } catch (err) {
    // Never take the site down over SEO: fall back to the plain app shell.
    console.error("render: failed for", path, err);
    return html(template, 200, CACHE.unavailable);
  }
}
