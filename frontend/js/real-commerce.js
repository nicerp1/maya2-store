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
    if (!items.length && state.cart.length) {
      for (const localItem of state.cart) {
        const saved = await mayaApi('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId: localItem.id, quantity: localItem.qty }) });
        localItem.remoteId = saved.id;
      }
      save();
      return;
    }
    state.cart = items.map(item => ({ id: item.productId, qty: item.quantity, variant: item.variant?.name || '۱ عدد', remoteId: item.id }));
    save();
  } catch (_) { /* The local cart remains an offline fallback. */ }
}

async function syncPersistentOrders(shouldRender = false) {
  if (!hasSession()) return;
  try {
    const orders = await mayaApi('/api/orders');
    state.orders = orders.map(order => ({
      id: order.id,
      number: order.orderNumber,
      invoiceNumber: order.invoiceNumber,
      date: new Date(order.createdAt).toLocaleDateString('fa-IR'),
      time: new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour:'2-digit', minute:'2-digit' }),
      status: order.status,
      total: Number(order.total),
      customer: { ...(order.user || {}), ...(order.address || {}) },
      invoiceItems: (order.items || []).map(item => ({ name:item.productSnapshot?.name || 'محصول', sku:item.productSnapshot?.sku || '', quantity:item.quantity, unitPrice:Number(item.unitPrice), discount:Number(item.discount || 0) })),
      invoice: { subtotal:Number(order.subtotal), discount:Number(order.discount || 0), shipping:Number(order.shipping || 0), total:Number(order.total) }
    }));
    save();
    if (shouldRender && /#(?:orders|invoice|admin)/.test(location.hash)) render();
  } catch (_) { /* Keep the last available order snapshot while offline. */ }
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
    const snapshot = state.cart.map(item => ({ ...item }));
    const localItem = state.cart.find(entry => entry.id === productId);
    if (localItem) localItem.qty += quantity;
    else state.cart.push({ id: productId, qty: quantity, variant: '۱ عدد' });
    save(); notify('محصول به سبد خرید افزوده شد');
    try {
      const remoteItem = await mayaApi('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
      const item = state.cart.find(entry => entry.id === productId);
      if (item) item.remoteId = remoteItem.id;
      save();
    } catch (error) { state.cart = snapshot; save(); render(); notify(error.message, 'error'); }
    return;
  }

  const [productId, direction] = (removeButton ? `${removeButton.dataset.remove}:remove` : quantityButton.dataset.cartqty).split(':');
  const item = state.cart.find(entry => entry.id === productId);
  if (!item) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const snapshot = state.cart.map(entry => ({ ...entry }));
  const nextQuantity = direction === 'up' ? item.qty + 1 : item.qty - 1;
  if (direction === 'remove' || nextQuantity < 1) state.cart = state.cart.filter(entry => entry.id !== productId);
  else item.qty = nextQuantity;
  save(); render();
  try {
    let remoteId = item.remoteId;
    if (!remoteId && direction !== 'remove') { await syncPersistentCart(); remoteId = state.cart.find(entry => entry.id === productId)?.remoteId; }
    if (remoteId && (direction === 'remove' || nextQuantity < 1)) await mayaApi(`/api/cart/items/${remoteId}`, { method: 'DELETE' });
    else if (remoteId) await mayaApi(`/api/cart/items/${remoteId}`, { method: 'PATCH', body: JSON.stringify({ quantity: nextQuantity }) });
  } catch (error) { state.cart = snapshot; save(); render(); notify(error.message, 'error'); }
}, true);

document.addEventListener('submit', async event => {
  const form = event.target;
  if (form?.id !== 'checkoutForm') return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (!hasSession()) {
    notify('برای ثبت سفارش واقعی، ابتدا وارد حساب کاربری شوید', 'error');
    location.hash = 'account';
    return;
  }
  const values = Object.fromEntries(new FormData(form));
  try {
    const order = await mayaApi('/api/checkout', { method: 'POST', body: JSON.stringify({ province: values.province, city: values.city, address: values.address, postalCode: values.postal, shippingMethod: values.shipping === 'اکسپرس' ? 'EXPRESS' : 'STANDARD' }) });
    state.orders.unshift({ number: order.orderNumber, date: new Date(order.createdAt).toLocaleDateString('fa-IR'), total: Number(order.total), status: order.status, items: [...state.cart] });
    state.cart = []; save(); notify('سفارش و فاکتور با موفقیت ثبت شد'); location.hash = `tracking?id=${encodeURIComponent(order.orderNumber)}`;
  } catch (error) { notify(error.message, 'error'); }
}, true);

document.addEventListener('click', event => { if (event.target.closest('#logout')) localStorage.removeItem('maya-token'); }, true);
window.syncPersistentCart = syncPersistentCart;
window.syncPersistentOrders = syncPersistentOrders;
syncPersistentCart();
syncPersistentOrders(true);
window.addEventListener('hashchange', () => syncPersistentOrders(true));
