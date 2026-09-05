const json = (res, status, body) => {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const supabaseRequest = async (path, options = {}) => {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
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

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  try {
    const result = await supabaseRequest('catalog_products?select=id,payload&order=id.asc');
    if (!result.ok) throw new Error(`Supabase returned ${result.status}`);
    const rows = await result.json();
    return json(res, 200, { connected: true, products: rows.map((row) => row.payload) });
  } catch (error) {
    return json(res, 503, { connected: false, error: 'Database is temporarily unavailable.', reason: error.message });
  }
};
