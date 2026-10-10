/* Animated confirmation for the existing, server-backed invoice. */
(() => {
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const invoiceKey = order => order.invoiceNumber || order.number;
  const safeNumber = value => encodeURIComponent(String(value || ''));

  function orderSuccessPage(number) {
    const order = state.orders.find(item => item.number === number || item.invoiceNumber === number);
    if (!order) return `<section class="section"><div class="empty"><h1>فاکتور در حال آماده‌سازی است</h1><p>اگر سفارش ثبت شده، از بخش سفارش‌های من فاکتور را باز کنید.</p><a class="btn" href="#orders">سفارش‌های من</a></div></section>`;

    const items = order.invoiceItems || [];
    const buyer = order.customer || {};
    const total = order.invoice?.total ?? order.total;
    const remaining = Math.max(0, items.length - 3);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const label = order.status === 'PENDING_PAYMENT' ? 'سفارش ثبت شد' : 'فاکتور سفارش آماده است';
    const previewRows = items.slice(0, 3).map(item => `<div class="printer-item"><span>${escapeHtml(item.name)}</span><b>× ${fa(item.quantity)}</b></div>`).join('');
    const fullInvoice = invoicePage(number);

    return `<section class="printer-success" aria-labelledby="printer-title" data-printer-stage="${reducedMotion ? 'complete' : 'printing'}">
      <div class="printer-intro no-print"><span class="printer-check" aria-hidden="true">✓</span><h1 id="printer-title">${label}</h1><p>شماره سفارش ${escapeHtml(order.number)} ثبت شد. فاکتور را می‌توانید مشاهده و چاپ کنید.</p></div>
      <div class="printer-scene no-print" aria-label="فاکتور از کارتخوان بیرون می‌آید">
        <div class="printer-machine"><div class="printer-brand"><strong>مایا آزما</strong><span>فاکتور فروش</span></div><div class="printer-screen"><span class="printer-screen-dot" aria-hidden="true"></span><span class="printer-status" role="status" aria-live="polite">${reducedMotion ? 'فاکتور آماده است' : 'در حال صدور فاکتور…'}</span><b>${money(total)}</b></div><div class="printer-slot" aria-hidden="true"></div></div>
        <div class="printer-output"><article class="printer-paper" aria-label="پیش‌نمایش فاکتور"><div class="printer-paper-head"><b>مایا آزما</b><span>فاکتور فروش</span></div><div class="printer-rule"></div><div class="printer-line"><span>شماره</span><b dir="ltr">${escapeHtml(invoiceKey(order))}</b></div><div class="printer-line"><span>تاریخ</span><b>${escapeHtml(order.date)} ${escapeHtml(order.time)}</b></div><div class="printer-line"><span>خریدار</span><b>${escapeHtml([buyer.firstName,buyer.lastName].filter(Boolean).join(' ') || '—')}</b></div><div class="printer-rule"></div>${previewRows}${remaining ? `<p class="printer-more">و ${fa(remaining)} قلم دیگر در فاکتور کامل</p>` : ''}<div class="printer-rule"></div><div class="printer-line printer-total"><span>مبلغ نهایی</span><b>${money(total)}</b></div></article></div>
      </div>
      <div class="printer-actions no-print"><button class="btn" type="button" data-printer-print>چاپ فاکتور A4</button><a class="btn outline" href="#invoice?number=${safeNumber(invoiceKey(order))}">مشاهده فاکتور کامل</a><a class="btn outline" href="#orders">سفارش‌های من</a></div>
      <div class="printer-full-invoice">${fullInvoice}</div>
    </section>`;
  }

  const previousRender = render;
  render = function () {
    const route = location.hash.slice(1).split('?')[0];
    previousRender();
    if (route !== 'order-success') return;
    const number = new URLSearchParams(location.hash.split('?')[1] || '').get('number');
    $('#app').innerHTML = orderSuccessPage(number);
    document.title = 'فاکتور سفارش | مایا آزما';
    document.querySelector('[data-print-invoice]')?.addEventListener('click', () => window.print());
    document.querySelector('[data-pdf-invoice]')?.addEventListener('click', () => window.print());
    const page = document.querySelector('.printer-success');
    if (page?.dataset.printerStage === 'printing') {
      window.setTimeout(() => {
        if (!page.isConnected) return;
        page.dataset.printerStage = 'complete';
        const status = page.querySelector('.printer-status');
        if (status) status.textContent = 'فاکتور آماده است';
      }, 1850);
    }
  };
  document.addEventListener('click', event => {
    if (event.target.closest('[data-printer-print]')) window.print();
  });
  if (location.hash.startsWith('#order-success')) render();
})();
