import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = 'https://gharbazma.ir';
const categoryUrl = `${root}/product-category/lab-containers/`;
const outputDir = join(process.cwd(), 'frontend', 'data');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const decode = value => String(value || '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16))).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const unique = list => [...new Set(list.filter(Boolean))];
const absolute = url => {
  const value = typeof url === 'string' ? url : url?.url || url?.contentUrl || '';
  return value.startsWith('http') ? value : value ? new URL(value, root).href : '';
};
const matchOne = (html, regex) => (html.match(regex) || [])[1] || '';
const fetchHtml = async url => {
  const response = await fetch(url, { headers: { 'user-agent': 'MayaAzmaImporter/1.0 (authorized migration)' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
};
function productLinks(html) {
  return unique([...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*woocommerce-LoopProduct-link[^"']*["']/gi)].map(m => absolute(m[1]))
    .concat([...html.matchAll(/<a[^>]+class=["'][^"']*woocommerce-LoopProduct-link[^"']*["'][^>]+href=["']([^"']+)["']/gi)].map(m => absolute(m[1])))
    .filter(url => /\/product\//.test(url)));
}
function categoryId(html) {
  const meta = matchOne(html, /<span[^>]+class=["'][^"']*posted_in[^"']*["'][^>]*>[\s\S]*?<\/span>\s*<\/div>/i);
  const slug = matchOne(meta || html, /product-category\/lab-containers\/(?:[^"']+\/)?([^\/'"?#]+)\/?["']/i);
  return ['laboratory-consumables','miscellaneous-lab-supplies','plastic-labware','stand-and-rack'].includes(slug) ? slug : 'lab-containers';
}
function parseJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const value = JSON.parse(block[1].trim());
      const values = Array.isArray(value) ? value : [value, ...(value['@graph'] || [])];
      const found = values.find(item => String(item?.['@type'] || '').toLowerCase().includes('product'));
      if (found) return found;
    } catch { /* ignore invalid structured data */ }
  }
  return {};
}
function parseProduct(url, html, index) {
  const schema = parseJsonLd(html);
  const name = decode(schema.name || matchOne(html, /<h1[^>]*class=["'][^"']*product_title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i));
  const sku = decode(schema.sku || matchOne(html, /class=["']sku[^"']*["'][^>]*>([\s\S]*?)<\//i)) || `GHA-${String(index + 1).padStart(5, '0')}`;
  const offers = Array.isArray(schema.offers) ? schema.offers[0] : schema.offers || {};
  const rawPrice = offers.price || offers.lowPrice || matchOne(html, /(?:woocommerce-Price-amount[^>]*>|price[^>]*>)[^\d]*([\d,]+)[^<]*/i);
  const price = Number(String(rawPrice || '0').replace(/[^\d]/g, '')) || 0;
  const descriptionHtml = matchOne(html, /<div[^>]+(?:id=["']tab-description["']|class=["'][^"']*woocommerce-Tabs-panel--description[^"']*)[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i) || schema.description || '';
  const shortDescription = decode(matchOne(html, /<div[^>]+class=["'][^"']*woocommerce-product-details__short-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i));
  const galleryStart = html.indexOf('woocommerce-product-gallery__wrapper');
  const galleryHtml = galleryStart >= 0 ? html.slice(galleryStart, galleryStart + 50000) : '';
  const galleryImages = unique([...galleryHtml.matchAll(/data-large_image=["']([^"']+)["']/gi)].map(m => absolute(m[1])))
    .filter(image => /wp-content\/uploads/i.test(image)).slice(0, 12);
  const schemaImages = (Array.isArray(schema.image) ? schema.image : [schema.image]).map(absolute).filter(image => /wp-content\/uploads/i.test(image));
  const images = galleryImages.length ? galleryImages : schemaImages.slice(0, 1);
  const specRows = [...html.matchAll(/<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/gi)];
  const specs = Object.fromEntries(specRows.map(row => [decode(row[1]), decode(row[2])]).filter(([key, value]) => key && value));
  const brand = decode(specs['برند'] || specs.Brand || schema.brand?.name || matchOne(html, /(?:برند|Brand)[\s\S]{0,300}?<a[^>]*>([\s\S]*?)<\/a>/i)) || 'مایا آزما';
  const stockText = decode(offers.availability || matchOne(html, /class=["'][^"']*stock[^"']*["'][^>]*>([\s\S]*?)<\//i));
  const stock = /outofstock|ناموجود/i.test(stockText) ? 0 : 10;
  const variationJson = matchOne(html, /data-product_variations=["']([\s\S]*?)["']/i).replace(/&quot;/g, '"').replace(/&#(1?2?4);/g, '');
  let variants = [];
  try { variants = JSON.parse(variationJson).map(variation => ({ name: Object.values(variation.attributes || {}).filter(Boolean).join(' / ') || 'گزینه محصول', price: Number(String(variation.display_price || variation.display_regular_price || '').replace(/[^\d]/g, '')) || null })); } catch { /* non-variable product */ }
  if (!variants.length) variants = [...html.matchAll(/<select[^>]*>[\s\S]*?<\/select>/gi)].flatMap(select => [...select[0].matchAll(/<option[^>]+value=["']([^"']+)["'][^>]*>([\s\S]*?)<\/option>/gi)].map(option => ({ name: decode(option[2]) || decode(option[1]), price: null }))).filter(variant => variant.name && !/انتخاب/i.test(variant.name));
  variants = unique(variants.map(variant => JSON.stringify(variant))).map(variant => JSON.parse(variant));
  return {
    id: `gharb-${sku.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gi, '-').replace(/^-|-$/g, '') || index + 1}`,
    sourceUrl: url, name: name || `محصول غرب‌آزما ${index + 1}`,
    slug: url.split('/').filter(Boolean).pop(), sku, price, discount: 0, stock,
    brand, category: categoryId(html), icon: '🧴', rating: '4.8',
    image: images[0] || '', images, shortDescription: shortDescription || decode(descriptionHtml).slice(0, 220),
    longDescription: descriptionHtml || shortDescription, description: shortDescription || decode(descriptionHtml).slice(0, 220),
    variants: variants.length ? variants.map(variant => variant.name) : ['۱ عدد'], variantOptions: variants, specs, active: true, importedFrom: 'catalog-import', importedAt: new Date().toISOString()
  };
}

await mkdir(outputDir, { recursive: true });
const first = await fetchHtml(categoryUrl);
const maxPage = Math.max(1, ...[...first.matchAll(/\/page\/(\d+)/g)].map(m => Number(m[1])));
let links = productLinks(first);
for (let page = 2; page <= maxPage; page++) {
  await pause(1100);
  links.push(...productLinks(await fetchHtml(`${categoryUrl}page/${page}/`)));
}
links = unique(links);
console.log(`Found ${links.length} container products across ${maxPage} page(s).`);
const products = [], errors = [];
for (const [index, url] of links.entries()) {
  try {
    await pause(1100);
    products.push(parseProduct(url, await fetchHtml(url), index));
    console.log(`Imported ${index + 1}/${links.length}`);
  } catch (error) {
    errors.push({ url, error: error.message });
    console.error(`Failed ${url}: ${error.message}`);
  }
}
await writeFile(join(outputDir, 'gharbazma-containers.json'), JSON.stringify(products, null, 2), 'utf8');
await writeFile(join(outputDir, 'gharbazma-containers-errors.json'), JSON.stringify(errors, null, 2), 'utf8');
console.log(`Complete: ${products.length} imported, ${errors.length} failed.`);
