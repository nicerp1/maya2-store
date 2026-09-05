/* Real account access: the capture listener replaces the old local-only form handler. */
document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (form?.id !== 'authForm') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (form.dataset.busy) return;
  const values = Object.fromEntries(new FormData(form));
  const registering = form.dataset.mode === 'register';
  const endpoint = registering ? '/api/auth/register' : '/api/auth/login';
  const payload = registering
    ? { firstName: values.firstName?.trim(), lastName: values.lastName?.trim(), mobile: values.mobile?.trim(), email: values.email?.trim(), password: values.password }
    : { email: values.email?.trim(), password: values.password };
  form.dataset.busy = 'true';
  const submit = form.querySelector('button');
  if (submit) submit.disabled = true;
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'ورود انجام نشد');
    const session = result.data;
    const previousId = state.user?.id;
    if (previousId && previousId !== session.user.id) state.cart = [];
    state.orders = [];
    localStorage.setItem('maya-token', session.token);
    state.user = session.user;
    localStorage.setItem('maya-user', JSON.stringify(state.user));
    save();
    window.syncPersistentCart?.().catch(() => {});
    window.syncPersistentOrders?.(true);
    notify(registering ? 'حساب کاربری با موفقیت ساخته شد' : 'با موفقیت وارد شدید');
    updateBadges();
    location.hash = state.user.role === 'ADMIN' ? 'admin' : 'account';
  } catch (error) { notify(error.message || 'ارتباط با سرور برقرار نشد', 'error'); }
  finally { delete form.dataset.busy; if (submit) submit.disabled = false; }
}, true);

/* The original account template pre-dates real registration. Add its required
   mobile field only when the user selects the registration tab. */
document.addEventListener('click', event => {
  const tab = event.target.closest('[data-auth-tab]');
  if (!tab) return;
  setTimeout(() => {
    const fields = document.querySelector('#nameFields');
    if (!fields) return;
    let mobile = fields.querySelector('[name="mobile"]');
    if (!mobile) { fields.insertAdjacentHTML('beforeend', '<div class="field full"><label>شماره موبایل</label><input name="mobile" inputmode="tel" pattern="09[0-9]{9}" placeholder="09123456789"></div>'); mobile = fields.querySelector('[name="mobile"]'); }
    mobile.required = tab.dataset.authTab === 'register';
  }, 0);
}, true);
async function restoreRealSession() {
  const token = localStorage.getItem('maya-token');
  if (!token) {
    if (state.user) {
      state.user = null; state.cart = []; state.orders = [];
      localStorage.removeItem('maya-user'); save();
    }
    if (location.hash.startsWith('#admin')) {
      notify('برای ورود به پنل، دوباره با حساب مدیر وارد شوید', 'error');
      location.hash = 'account';
    }
    return;
  }
  try {
    const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'نشست نامعتبر است');
    state.user = result.data;
    localStorage.setItem('maya-user', JSON.stringify(state.user));
    updateBadges();
    if (location.hash.startsWith('#admin')) {
      if (state.user.role !== 'ADMIN') location.hash = 'account';
      else { render(); window.syncPersistentOrders?.(true); }
    }
  } catch (_) {
    localStorage.removeItem('maya-token'); localStorage.removeItem('maya-user');
    state.user = null; state.cart = []; state.orders = []; save();
    notify('نشست منقضی شده؛ دوباره وارد شوید', 'error');
    location.hash = 'account';
  }
}
restoreRealSession();
