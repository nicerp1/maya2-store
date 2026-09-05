/* Real account access: the capture listener replaces the old local-only form handler. */
document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (form?.id !== 'authForm') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const values = Object.fromEntries(new FormData(form));
  const registering = form.dataset.mode === 'register';
  const endpoint = registering ? '/api/auth/register' : '/api/auth/login';
  const payload = registering
    ? { firstName: values.firstName?.trim(), lastName: values.lastName?.trim(), email: values.email?.trim(), password: values.password }
    : { email: values.email?.trim(), password: values.password };
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'ورود انجام نشد');
    const session = result.data;
    localStorage.setItem('maya-token', session.token);
    state.user = session.user;
    localStorage.setItem('maya-user', JSON.stringify(state.user));
    notify(registering ? 'حساب کاربری با موفقیت ساخته شد' : 'با موفقیت وارد شدید');
    updateBadges();
    location.hash = state.user.role === 'ADMIN' ? 'admin' : 'account';
  } catch (error) { notify(error.message || 'ارتباط با سرور برقرار نشد', 'error'); }
}, true);
