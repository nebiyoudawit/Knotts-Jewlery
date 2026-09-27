// schema.org structured data (JSON-LD). Used by src/seo/pages.js.
// Validate changes at https://search.google.com/test/rich-results
import {
  SITE_URL,
  SITE_NAME,
  PHONE,
  EMAIL,
  DELIVERY_AREAS,
  SOCIAL_PROFILES,
  productPath,
} from "./site.js";

const STORE_ID = `${SITE_URL}/#store`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// Home page: the business itself, plus a site search box for Google.
export const storeSchema = () => [
  {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": STORE_ID,
    name: SITE_NAME,
    alternateName: ["Knotts", "Knotts Jewellery", "Knotts Jewelry Addis Ababa"],
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/hero-img1.jpg`,
    description:
      "Handcrafted rings, necklaces, bracelets, earrings and charms in Addis Ababa, with pay on delivery.",
    telephone: PHONE,
    email: EMAIL,
    currenciesAccepted: "ETB",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    areaServed: DELIVERY_AREAS.map((name) => ({
      "@type": "Place",
      name: `${name}, Addis Ababa`,
    })),
    sameAs: SOCIAL_PROFILES,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: "Knotts",
    url: `${SITE_URL}/`,
    publisher: { "@id": STORE_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

// crumbs: [{ name, path }], home first.
export const breadcrumbSchema = (crumbs) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: `${SITE_URL}${crumb.path}`,
  })),
});

// Category / shop pages: the products shown, in order.
export const itemListSchema = (products) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: products.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${SITE_URL}${productPath(product)}`,
    name: product.name,
  })),
});

// Product page: enables price, availability and star ratings in search results.
export const productSchema = (product) => {
  const url = `${SITE_URL}${productPath(product)}`;
  const images = (product.images || []).filter((img) => img?.startsWith("http"));
  const reviews = (product.reviews || []).filter((r) => r && typeof r === "object" && r.rating);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.replace(/\s+/g, " ").trim(),
    image: images.length ? images : undefined,
    sku: product.productId || undefined,
    category: product.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "ETB",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      // Older API responses have no inStock field; treat them as available.
      availability:
        product.inStock === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: { "@id": STORE_ID, "@type": "Organization", name: SITE_NAME },
    },
  };

  if (product.reviewCount > 0 && product.rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(product.rating * 10) / 10,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (reviews.length) {
    schema.review = reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name || r.user?.name || "Customer" },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      reviewBody: r.comment || undefined,
      datePublished: r.createdAt ? String(r.createdAt).slice(0, 10) : undefined,
    }));
  }

  return schema;
};
