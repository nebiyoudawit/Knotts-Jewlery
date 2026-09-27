import Product from '../models/products.js';
import redisClient from '../utils/redisClient.js';

// Public storefront domain (the Vercel frontend), not this API's host.
const SITE_URL = (process.env.SITE_URL || 'https://knottsjewelry.store').replace(/\/$/, '');

export const SITEMAP_CACHE_KEY = 'sitemap:xml';

const CATEGORY_SLUGS = ['rings', 'necklaces', 'bracelets', 'earrings', 'charms'];

const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  ...CATEGORY_SLUGS.map((slug) => ({ path: `/products/${slug}`, changefreq: 'weekly', priority: '0.8' })),
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
];

// Keep in sync with slugify()/productPath() in src/seo/site.js - these must produce the
// same URL the storefront treats as canonical.
const slugify = (text) =>
  String(text || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');

const productPath = (product) => {
  const slug = slugify(product.name);
  return `/product/${slug ? `${slug}-` : ''}${product._id}`;
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const urlEntry = ({ loc, lastmod, changefreq, priority, images = [] }) => {
  const imageTags = images
    .map(
      (img) =>
        `    <image:image><image:loc>${escapeXml(img.loc)}</image:loc><image:title>${escapeXml(img.title)}</image:title></image:image>`
    )
    .join('\n');

  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod && `    <lastmod>${lastmod}</lastmod>`,
    changefreq && `    <changefreq>${changefreq}</changefreq>`,
    priority && `    <priority>${priority}</priority>`,
    imageTags,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
};

const buildSitemap = async () => {
  const products = await Product.find({}, 'name images updatedAt').sort({ updatedAt: -1 }).lean();

  const entries = [
    ...STATIC_PAGES.map((page) => urlEntry({ loc: `${SITE_URL}${page.path}`, ...page })),
    ...products.map((product) =>
      urlEntry({
        loc: `${SITE_URL}${productPath(product)}`,
        lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString().slice(0, 10) : undefined,
        changefreq: 'weekly',
        priority: '0.7',
        images: (product.images || [])
          .filter((img) => typeof img === 'string' && img.startsWith('http'))
          .map((img) => ({ loc: img, title: product.name })),
      })
    ),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    '</urlset>',
  ].join('\n');
};

// GET /sitemap.xml - every public page plus one entry per product, cached for an hour
export const getSitemap = async (req, res) => {
  try {
    let xml = null;
    try {
      xml = await redisClient.get(SITEMAP_CACHE_KEY);
    } catch (err) {
      console.error('Sitemap cache read failed:', err);
    }

    if (!xml) {
      xml = await buildSitemap();
      try {
        await redisClient.setEx(SITEMAP_CACHE_KEY, 3600, xml);
      } catch (err) {
        console.error('Sitemap cache write failed:', err);
      }
    }

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).set('Content-Type', 'text/plain').send('Failed to generate sitemap');
  }
};
