/* Persistent commerce bridge. Signed-in customers use the database-backed cart and checkout API. */
const mayaApi = async (path, options = {}) => {
  const token = localStorage.getItem('maya-token');
  if (!token) throw new Error('برای ادامه ابتدا وارد حساب کاربری شوید');
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) throw new Error(result.message || 'ارتباط با سرور انجام نشد');
  return result.data;
};

const hasSession = () => Boolean(localStorage.getItem('maya-token'));

async function syncPersistentCart() {
  if (!hasSession()) return;
  try {
    const cart = await mayaApi('/api/cart');
    const items = cart?.items || [];
    if (!items.length && state.cart.length) return;
    state.cart = items.map(item => ({ id: item.productId, qty: item.quantity, variant: item.variant?.name || '۱ عدد', remoteId: item.id }));
    save();
  } catch (_) { /* The local cart remains an offline fallback. */ }
}

document.addEventListener('click', async event => {
  const addButton = event.target.closest('[data-add]');
  const removeButton = event.target.closest('[data-remove]');
  const quantityButton = event.target.closest('[data-cartqty]');
  if (!hasSession() || (!addButton && !removeButton && !quantityButton)) return;

  if (addButton) {
    event.preventDefault(); event.stopImmediatePropagation();
    const productId = addButton.dataset.add;
    const quantity = Number(document.querySelector('#detailQty')?.textContent || 1);
    try {
      const remoteItem = await mayaApi('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
      const item = state.cart.find(entry => entry.id === productId);
      if (item) { item.qty += quantity; item.remoteId = remoteItem.id; } else state.cart.push({ id: productId, qty: quantity, variant: '۱ عدد', remoteId: remoteItem.id });
      save(); notify('محصول به سبد خرید افزوده شد');
    } catch (error) { notify(error.message, 'error'); }
    return;
  }

  const [productId, direction] = (removeButton ? `${removeButton.dataset.remove}:remove` : quantityButton.dataset.cartqty).split(':');
  const item = state.cart.find(entry => entry.id === productId);
  if (!item?.remoteId) return;
  event.preventDefault(); event.stopImmediatePropagation();
  try {
    const nextQuantity = direction === 'up' ? item.qty + 1 : item.qty - 1;
    if (direction === 'remove' || nextQuantity < 1) { await mayaApi(`/api/cart/items/${item.remoteId}`, { method: 'DELETE' }); state.cart = state.cart.filter(entry => entry.id !== productId); }
    else { await mayaApi(`/api/cart/items/${item.remoteId}`, { method: 'PATCH', body: JSON.stringify({ quantity: nextQuantity }) }); item.qty = nextQuantity; }
    save(); render();
  } catch (error) { notify(error.message, 'error'); }
}, true);

document.addEventListener('submit', async event => {
  const form = event.target;
  if (form?.id !== 'checkoutForm' || !hasSession()) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const values = Object.fromEntries(new FormData(form));
  try {
    const order = await mayaApi('/api/checkout', { method: 'POST', body: JSON.stringify({ province: values.province, city: values.city, address: values.address, postalCode: values.postal, shippingMethod: values.shipping === 'اکسپرس' ? 'EXPRESS' : 'STANDARD' }) });
    state.orders.unshift({ number: order.orderNumber, date: new Date(order.createdAt).toLocaleDateString('fa-IR'), total: Number(order.total), status: order.status, items: [...state.cart] });
    state.cart = []; save(); notify('سفارش و فاکتور با موفقیت ثبت شد'); location.hash = `tracking?id=${encodeURIComponent(order.orderNumber)}`;
  } catch (error) { notify(error.message, 'error'); }
}, true);

document.addEventListener('click', event => { if (event.target.closest('#logout')) localStorage.removeItem('maya-token'); }, true);
syncPersistentCart();
