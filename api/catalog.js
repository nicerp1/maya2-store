const containerProducts = require('../frontend/data/gharbazma-containers.json');

const json = (res, status, body) => {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const supabaseRequest = async (path, options = {}) => {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key) throw new Error('Supabase environment variables are missing.');
  return fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
};

async function seedProductsIfEmpty(rows) {
  if (rows.length || !containerProducts.length) return rows;
  const payload = containerProducts.map((product) => ({ id: String(product.id), payload: product }));
  const seeded = await supabaseRequest('catalog_products?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(payload),
  });
  if (!seeded.ok) throw new Error('Initial catalog seed failed.');
  return seeded.json();
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  try {
    const result = await supabaseRequest('catalog_products?select=id,payload&order=id.asc');
    if (!result.ok) throw new Error(`Supabase returned ${result.status}`);
    const rows = await seedProductsIfEmpty(await result.json());
    return json(res, 200, { connected: true, products: rows.map((row) => row.payload) });
  } catch (error) {
    return json(res, 503, { connected: false, error: 'Database is temporarily unavailable.' });
  }
};
