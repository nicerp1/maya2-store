/* The local catalogue is an offline fallback; production data comes from the API. */
(async function connectCatalog() {
  try {
    const response = await fetch('/api/products?page=1&limit=100', { headers: { Accept: 'application/json' } });
    const data = await response.json();
    const items = data?.data?.items;
    if (!response.ok || !Array.isArray(items)) return;

    const remoteProducts = items.map((product) => ({
      id: String(product.id), name: product.name, slug: product.slug, sku: product.sku,
      price: Number(product.price), discount: Number(product.discount || 0), stock: Number(product.stock || 0),
      brand: product.brand?.name || 'مایا آزما', category: product.category?.slug || 'miscellaneous-lab-supplies',
      icon: 'flask-conical', description: product.description || '',
      variants: product.variants?.map((variant) => variant.name) || [], specs: product.specifications || {},
      images: product.images || []
    }));
    products.splice(0, products.length, ...remoteProducts);
    localStorage.setItem('maya-products', JSON.stringify(products));
    document.documentElement.dataset.catalogSource = 'api';
    render();
  } catch (_) {
    // The storefront intentionally stays usable with its local catalog when offline.
  }
})();
