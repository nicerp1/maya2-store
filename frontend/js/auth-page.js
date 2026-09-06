const authIcon = (name) => ({
  eye:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  eyeOff:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-2.2 3M6.4 6.4C3.5 8.3 2 12 2 12s3.5 6 10 6c1.2 0 2.3-.2 3.3-.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.5 3.1 7.8 7.5 9.5 4.4-1.7 7.5-5 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/></svg>'
}[name] || '');

function accountPage() {
  if (state.user) return `<main class="auth-shell"><section class="auth-account-card" aria-labelledby="account-title">${authIcon('shield')}<p class="auth-eyebrow">حساب امن مایا آزما</p><h1 id="account-title">${state.user.firstName} عزیز، خوش آمدید</h1><p>${state.user.email}</p><div class="auth-account-actions"><a class="btn" href="#orders">مشاهده سفارش‌ها</a><button class="auth-secondary" id="logout" type="button">خروج از حساب</button></div></section></main>`;
  return `<main class="auth-shell">
    <section class="auth-brand" aria-label="معرفی مایا آزما">
      <picture><source srcset="assets/images/maya-azma-header-logo-dark.png" media="(prefers-color-scheme: dark)"><img src="assets/images/maya-azma-header-logo-transparent.png" alt="مایا آزما" width="260" height="96"></picture>
      <p class="auth-kicker">تجهیز مطمئن، انتخاب آگاهانه</p><h1>همراه حرفه‌ای آزمایشگاه شما</h1>
      <p>دسترسی امن به سفارش‌ها، فاکتورها و محصولات تخصصی در یک فضای آرام و قابل اعتماد.</p>
      <ul><li>${authIcon('shield')}ارتباط رمزگذاری‌شده و نشست امن</li><li>${authIcon('shield')}پیگیری شفاف سفارش و فاکتور</li></ul>
    </section>
    <section class="auth-card" aria-labelledby="authTitle">
      <div class="auth-card-head"><p class="auth-eyebrow">حساب کاربری مایا آزما</p><h2 id="authTitle">ورود به حساب کاربری</h2><p id="authLead">برای ادامه، اطلاعات حساب خود را وارد کنید.</p></div>
      <div class="auth-tabs" role="tablist" aria-label="ورود یا ثبت‌نام"><button class="active" type="button" role="tab" aria-selected="true" data-auth-tab="login">ورود</button><button type="button" role="tab" aria-selected="false" data-auth-tab="register">ثبت‌نام</button></div>
      <form id="authForm" class="auth-form-v2" data-mode="login" novalidate>
        <div id="nameFields" class="auth-name-grid" hidden>
          <div class="auth-field"><label for="firstName">نام</label><input id="firstName" name="firstName" autocomplete="given-name" aria-describedby="firstNameError"><p class="auth-error" id="firstNameError"></p></div>
          <div class="auth-field"><label for="lastName">نام خانوادگی</label><input id="lastName" name="lastName" autocomplete="family-name" aria-describedby="lastNameError"><p class="auth-error" id="lastNameError"></p></div>
          <div class="auth-field auth-wide"><label for="mobile">شماره موبایل</label><input id="mobile" name="mobile" type="tel" inputmode="numeric" autocomplete="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" aria-describedby="mobileHint mobileError"><p class="auth-hint" id="mobileHint">شماره را با ۰۹ وارد کنید.</p><p class="auth-error" id="mobileError"></p></div>
        </div>
        <div class="auth-field"><label for="identifier" id="identifierLabel">ایمیل یا شماره موبایل</label><input id="identifier" name="identifier" inputmode="email" autocomplete="username" spellcheck="false" placeholder="example@email.com یا ۰۹۱۲۳۴۵۶۷۸۹" aria-describedby="identifierHint identifierError" required><p class="auth-hint" id="identifierHint">در ثبت‌نام، ایمیل معتبر وارد کنید.</p><p class="auth-error" id="identifierError"></p></div>
        <div class="auth-field"><div class="auth-label-row"><label for="password">رمز عبور</label><button class="auth-link" type="button" id="forgotPassword">رمز عبور را فراموش کرده‌اید؟</button></div><div class="auth-password"><input id="password" name="password" type="password" autocomplete="current-password" minlength="8" aria-describedby="passwordHint passwordError" required><button type="button" class="password-toggle" aria-label="نمایش رمز عبور" aria-pressed="false">${authIcon('eye')}</button></div><p class="auth-hint" id="passwordHint">حداقل ۸ نویسه</p><p class="auth-error" id="passwordError"></p></div>
        <label class="auth-remember"><input type="checkbox" name="remember"><span>مرا به خاطر بسپار</span></label>
        <p class="auth-status" id="authStatus" role="status" aria-live="polite"></p>
        <button class="auth-submit" type="submit"><span>ورود</span><i aria-hidden="true"></i></button>
      </form>
      <div class="auth-divider"><span>یا</span></div>
      <button class="google-button" type="button" id="googleLogin" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h6a5.2 5.2 0 0 1-2.2 3.3v2.8h3.6c2.1-2 3.2-4.8 3.2-8.2Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11.2 11.2 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.7 14.1a6.7 6.7 0 0 1 0-4.2V7H2a11.1 11.1 0 0 0 0 10l3.7-2.9Z"/><path fill="#EA4335" d="M12 5.3c1.7 0 3.1.6 4.3 1.7l3.2-3.2A10.8 10.8 0 0 0 2 7l3.7 2.9C6.6 7.2 9.1 5.3 12 5.3Z"/></svg><span>ادامه با گوگل</span></button>
      <p class="google-help" id="googleHelp">در حال بررسی امکان ورود با گوگل…</p>
      <p class="auth-switch">حساب ندارید؟ <button class="auth-link" type="button" data-auth-tab="register">ساخت حساب جدید</button></p>
    </section>
  </main>`;
}

window.addEventListener('hashchange', () => { if(location.hash.startsWith('#account')) setTimeout(window.prepareGoogleLogin, 0); });
