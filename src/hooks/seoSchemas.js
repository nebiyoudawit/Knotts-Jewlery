// schema.org structured data (JSON-LD) passed to useSeo({ jsonLd }).
// Validate changes at https://search.google.com/test/rich-results
import { SITE_URL, SITE_NAME } from "./useSeo";

const STORE_ID = `${SITE_URL}/#store`;

const SOCIAL_PROFILES = [
  "https://www.instagram.com/knotts_jewelry",
  "https://t.me/knotts_jewelry",
  "https://www.tiktok.com/@knotts_jewelry",
];

// Home page: the business itself, plus a site search box for Google.
export const storeSchema = () => [
  {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": STORE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/hero-img1.jpg`,
    description:
      "Handcrafted rings, necklaces, bracelets, earrings and charms in Addis Ababa, with pay on delivery.",
    telephone: "+251961599628",
    email: "knottsjewelry@gmail.com",
    currenciesAccepted: "ETB",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    areaServed: ["Summit", "4 Kilo", "Megenagna", "Figa"].map((name) => ({
      "@type": "Place",
      name: `${name}, Addis Ababa`,
    })),
    sameAs: SOCIAL_PROFILES,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
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

// Product page: enables price, availability and star ratings in search results.
export const productSchema = (product) => {
  const url = `${SITE_URL}/product/${product._id}`;
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
      datePublished: r.createdAt ? r.createdAt.slice(0, 10) : undefined,
    }));
  }

  return schema;
};
