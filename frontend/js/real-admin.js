/* Makes the existing admin forms persistent without changing their design. */
const adminApi = (path, options = {}) => mayaApi(path, options);
const parseSpecs = text => Object.fromEntries(String(text || '').split(/\r?\n/).map(line => line.split(':')).filter(parts => parts.length > 1).map(([key, ...value]) => [key.trim(), value.join(':').trim()]));
const parseVariants = (values, sku) => {
  const lines = String(values.variantOptions || values.variants || '').split(/\r?\n|،|,/).map(value => value.trim()).filter(Boolean);
  return lines.map(line => { const [type, value, price] = line.split('|').map(value => value.trim()); return { name: value ? `${type || 'بسته‌بندی'}: ${value}` : line, type: value ? type : 'بسته‌بندی', value: value || line, price: price ? Number(price.replace(/,/g, '')) : null, stock: 0, sku }; });
};
let adminCategories = [];
async function refreshAdminCategories() { adminCategories = await adminApi('/api/admin/categories'); return adminCategories; }

document.addEventListener('submit', async event => {
  const form = event.target;
  const type = form?.dataset?.adminForm;
  if (!hasSession() || !['product', 'category'].includes(type)) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const values = Object.fromEntries(new FormData(form));
  try {
    if (type === 'product') {
      const images = String(values.images || values.image || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean);
      const payload = { name: values.name, sku: values.sku, slug: values.slug || `product-${Date.now()}`, brand: values.brand, category: values.subcategory || values.category, price: Number(values.price), discount: Number(values.discount || 0), stock: Number(values.stock), active: values.active === 'true', shortDescription: values.shortDescription, specifications: parseSpecs(values.specs), images, variants: parseVariants(values, values.sku) };
      const endpoint = values.id ? `/api/admin/products/${values.id}` : '/api/admin/products';
      await adminApi(endpoint, { method: values.id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    } else {
      const categories = await refreshAdminCategories();
      const existing = categories.find(category => category.slug === values.oldId);
      const payload = { name: values.name, slug: values.id, parentSlug: values.parent || null, active: true };
      await adminApi(existing ? `/api/admin/categories/${existing.id}` : '/api/admin/categories', { method: existing ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    }
    document.querySelector('#modal')?.classList.remove('open');
    notify('تغییرات با موفقیت در دیتابیس ذخیره شد');
    location.reload();
  } catch (error) { notify(error.message || 'ذخیره‌سازی انجام نشد', 'error'); }
}, true);

document.addEventListener('change', async event => {
  const select = event.target.closest('[data-order-status]');
  if (!select || !hasSession() || state.user?.role !== 'ADMIN') return;
  try {
    const orders = await adminApi('/api/orders');
    const order = orders.find(item => item.orderNumber === select.dataset.orderStatus);
    if (!order) return;
    await adminApi(`/api/orders/${order.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: select.value }) });
    notify('وضعیت سفارش در دیتابیس به‌روزرسانی شد');
  } catch (error) { notify(error.message, 'error'); }
}, true);

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-admin-delete]');
  if (!button || !hasSession() || state.user?.role !== 'ADMIN') return;
  const [type, reference] = button.dataset.adminDelete.split(':');
  if (!['product', 'category'].includes(type)) return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (!confirm('از حذف این مورد مطمئن هستید؟')) return;
  try {
    if (type === 'product') await adminApi(`/api/admin/products/${reference}`, { method: 'DELETE' });
    else {
      const categories = await refreshAdminCategories();
      const category = categories.find(item => item.slug === reference);
      if (!category) throw new Error('دسته‌بندی پیدا نشد');
      await adminApi(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
    }
    notify('حذف از دیتابیس انجام شد'); location.reload();
  } catch (error) { notify(error.message || 'حذف انجام نشد', 'error'); }
}, true);

const faAdminStatus = { PENDING_PAYMENT:'در انتظار پرداخت', PAID:'پرداخت شده', PROCESSING:'در حال پردازش', PREPARING:'در حال آماده‌سازی', SHIPPED:'ارسال شده', DELIVERED:'تحویل شده', CANCELLED:'لغو شده' };
async function renderPersistentOrders() {
  if (!location.hash.startsWith('#admin?section=orders') || state.user?.role !== 'ADMIN' || !hasSession()) return;
  try {
    const orders = await adminApi('/api/orders');
    const panel = document.querySelector('.admin-layout section.panel');
    if (!panel) return;
    panel.innerHTML = `<h2>مدیریت سفارش‌ها</h2>${orders.length ? `<table><thead><tr><th>شماره</th><th>مشتری</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th><th>فاکتور</th></tr></thead><tbody>${orders.map(order => `<tr><td>${order.orderNumber}</td><td>${order.user?.firstName || '—'} ${order.user?.lastName || ''}</td><td>${new Date(order.createdAt).toLocaleDateString('fa-IR')}</td><td>${money(Number(order.total))}</td><td><select data-order-status="${order.orderNumber}">${Object.entries(faAdminStatus).map(([value,label]) => `<option value="${value}" ${order.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></td><td>${order.invoiceNumber}</td></tr>`).join('')}</tbody></table>` : '<div class="admin-empty">هنوز سفارشی ثبت نشده است.</div>'}`;
  } catch (error) { notify(error.message, 'error'); }
}
window.addEventListener('hashchange', () => setTimeout(renderPersistentOrders, 0));
setTimeout(renderPersistentOrders, 0);

document.addEventListener('submit', async event => {
  const form = event.target;
  if (form?.id !== 'shopSettings' || !hasSession() || state.user?.role !== 'ADMIN') return;
  event.preventDefault(); event.stopImmediatePropagation();
  const values = Object.fromEntries(new FormData(form));
  try {
    const prior = await fetch('/api/settings').then(response => response.json()).then(result => result.data || {});
    await adminApi('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ ...prior, notice: prior.notice || 'ارسال به سراسر کشور', phone: values.phone, email: prior.email || 'info@mayaazma.ir', address: prior.address || 'تهران', hours: prior.hours || 'شنبه تا پنج‌شنبه', instagram: prior.instagram || '', linkedin: prior.linkedin || '', shipping: Number(values.shipping), freeShipping: Number(values.freeShipping) }) });
    notify('تنظیمات عمومی سایت در دیتابیس ذخیره شد');
  } catch (error) { notify(error.message, 'error'); }
}, true);
