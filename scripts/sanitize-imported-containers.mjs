import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const file = join(process.cwd(), 'frontend', 'data', 'gharbazma-containers.json');
const removeSourceName = value => String(value || '')
  .replace(/\s*[-–|]?\s*تجهیزات پزشکی و آزمایشگاهی\s*غرب[‌\s-]*آزما/gi, '')
  .replace(/غرب[‌\s-]*آزما/gi, '')
  .replace(/\s{2,}/g, ' ')
  .trim();
const products = JSON.parse(await readFile(file, 'utf8')).map((product, index) => ({
  ...product,
  id: `maya-container-${String(index + 1).padStart(3, '0')}`,
  sku: `MAYA-CN-${String(index + 1).padStart(4, '0')}`,
  name: removeSourceName(product.name),
  brand: removeSourceName(product.brand) || 'مایا آزما',
  shortDescription: removeSourceName(product.shortDescription),
  description: removeSourceName(product.description),
  longDescription: removeSourceName(product.longDescription),
  sourceUrl: '',
  importedFrom: 'catalog-import'
}));
await writeFile(file, JSON.stringify(products, null, 2), 'utf8');
console.log(`Sanitized ${products.length} products.`);
