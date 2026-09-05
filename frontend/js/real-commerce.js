/* Persistent commerce bridge. Signed-in customers use the database-backed cart and checkout API. */
const mayaApi = async (path, options = {}) => {
  const token = localStorage.getItem('maya-token');
  if (!token) throw new Error('برای ادامه ابتدا وارد حساب کاربری شوید');
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
  const result = await response.json().catch(() => ({}));
  if (response.status === 401 && localStorage.getItem('maya-token') === token) {
    localStorage.removeItem('maya-token'); localStorage.removeItem('maya-user');
    state.user = null; state.cart = []; state.orders = []; save();
    throw new Error('نشست شما منقضی شده؛ دوباره وارد شوید');
  }
  if (!response.ok || !result.success) throw new Error(result.message || 'ارتباط با سرور انجام نشد');
  return result.data;
};

const hasSession = () => Boolean(localStorage.getItem('maya-token'));
const pendingCart = new Map();
let checkoutBusy = false;
function cartBusy(id) { return pendingCart.has(id); }
function restoreCartItem(id, snapshot) {
  state.cart = state.cart.filter(item => item.id !== id);
  const previous = snapshot.find(item => item.id === id);
  if (previous) state.cart.push(previous);
  save(); render();
}
async function cartRequest(id, work) {
  const promise = work();
  pendingCart.set(id, promise);
  try { return await promise; } finally { pendingCart.delete(id); }
}

async function syncPersistentCart() {
  if (!hasSession()) return;
  const token = localStorage.getItem('maya-token');
  try {
    const cart = await mayaApi('/api/cart');
    if (localStorage.getItem('maya-token') !== token) return;
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
  } catch (error) { notify(error.message, 'error'); throw error; }
}

async function syncPersistentOrders(shouldRender = false) {
  if (!hasSession()) return;
  const token = localStorage.getItem('maya-token');
  try {
    const orders = await mayaApi('/api/orders');
    if (localStorage.getItem('maya-token') !== token) return;
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
    if (shouldRender && /#(?:orders|invoice|tracking|admin|account)/.test(location.hash)) render();
  } catch (error) { notify('دریافت سفارش‌ها انجام نشد: ' + error.message, 'error'); }
}

document.addEventListener('click', async event => {
  const addButton = event.target.closest('[data-add]');
  const removeButton = event.target.closest('[data-remove]');
  const quantityButton = event.target.closest('[data-cartqty]');
  if (!hasSession() || (!addButton && !removeButton && !quantityButton)) return;

  if (addButton) {
    event.preventDefault(); event.stopImmediatePropagation();
    const productId = addButton.dataset.add;
    if (cartBusy(productId) || checkoutBusy) return;
    const quantity = Number(document.querySelector('#detailQty')?.textContent || 1);
    const snapshot = state.cart.map(item => ({ ...item }));
    const localItem = state.cart.find(entry => entry.id === productId);
    if (localItem) localItem.qty += quantity;
    else state.cart.push({ id: productId, qty: quantity, variant: '۱ عدد' });
    save(); notify('محصول به سبد خرید افزوده شد');
    try {
      const remoteItem = await cartRequest(productId, () => mayaApi('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }));
      const item = state.cart.find(entry => entry.id === productId);
      if (item) item.remoteId = remoteItem.id;
      save();
    } catch (error) { restoreCartItem(productId, snapshot); notify(error.message, 'error'); }
    return;
  }

  const [productId, direction] = (removeButton ? `${removeButton.dataset.remove}:remove` : quantityButton.dataset.cartqty).split(':');
  const item = state.cart.find(entry => entry.id === productId);
  if (!item) return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (cartBusy(productId) || checkoutBusy) return;
  const snapshot = state.cart.map(entry => ({ ...entry }));
  const nextQuantity = direction === 'up' ? item.qty + 1 : item.qty - 1;
  if (direction === 'remove' || nextQuantity < 1) state.cart = state.cart.filter(entry => entry.id !== productId);
  else item.qty = nextQuantity;
  save(); render();
  try {
    let remoteId = item.remoteId;
    if (!remoteId && direction !== 'remove') { await syncPersistentCart(); remoteId = state.cart.find(entry => entry.id === productId)?.remoteId; }
    if (remoteId && (direction === 'remove' || nextQuantity < 1)) await cartRequest(productId, () => mayaApi(`/api/cart/items/${remoteId}`, { method: 'DELETE' }));
    else if (remoteId) await cartRequest(productId, () => mayaApi(`/api/cart/items/${remoteId}`, { method: 'PATCH', body: JSON.stringify({ quantity: nextQuantity }) }));
  } catch (error) { restoreCartItem(productId, snapshot); notify(error.message, 'error'); }
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
  if (checkoutBusy) return;
  checkoutBusy = true;
  const submit = form.querySelector('button[type="submit"]');
  if (submit) { submit.disabled = true; submit.textContent = 'در حال ثبت سفارش…'; }
  try {
    await Promise.all(pendingCart.values());
    await syncPersistentCart();
    const order = await mayaApi('/api/checkout', { method: 'POST', body: JSON.stringify({ province: values.province, city: values.city, address: values.address, postalCode: values.postal, shippingMethod: values.shipping === 'اکسپرس' ? 'EXPRESS' : 'STANDARD' }) });
    state.orders.unshift({ number: order.orderNumber, date: new Date(order.createdAt).toLocaleDateString('fa-IR'), total: Number(order.total), status: order.status, items: [...state.cart] });
    state.cart = []; save();
    await syncPersistentOrders();
    notify('سفارش با موفقیت ثبت شد'); location.hash = `invoice?number=${encodeURIComponent(order.invoiceNumber || order.orderNumber)}`;
  } catch (error) { notify(error.message, 'error'); }
  finally { checkoutBusy = false; if (submit) { submit.disabled = false; submit.textContent = 'ثبت سفارش'; } }
}, true);

document.addEventListener('click', event => {
  if (!event.target.closest('#logout')) return;
  event.preventDefault(); event.stopImmediatePropagation();
  localStorage.removeItem('maya-token'); localStorage.removeItem('maya-user');
  state.user = null; state.cart = []; state.orders = []; save(); location.hash = 'account'; render();
}, true);
window.syncPersistentCart = syncPersistentCart;
window.syncPersistentOrders = syncPersistentOrders;
syncPersistentCart().catch(() => {});
syncPersistentOrders(true);
window.addEventListener('hashchange', () => {
  if (/^#(orders|invoice|tracking|admin|account)/.test(location.hash)) syncPersistentOrders(true);
});
