/* Shared catalog: local data remains the offline fallback. */
(async function connectCatalog() {
  try {
    const response = await fetch('/api/catalog', { headers: { Accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok || !data.connected || !Array.isArray(data.products)) return;

    const remoteById = new Map(data.products.map((product) => [String(product.id), product]));
    products.forEach((product) => remoteById.set(String(product.id), { ...product, ...(remoteById.get(String(product.id)) || {}) }));
    products.splice(0, products.length, ...remoteById.values());
    localStorage.setItem('maya-products', JSON.stringify(products));
    document.documentElement.dataset.catalogSource = 'supabase';
    render();
  } catch (_) {
    // The storefront intentionally stays usable with its local catalog when offline.
  }
})();
