const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const script = fs.readFileSync(path.join(__dirname, '../frontend/js/invoice-printer.js'), 'utf8');

function mount(reducedMotion = false) {
  const app = { innerHTML: '' };
  const listeners = {};
  let printed = false;
  const order = {
    number: 'MAYA-123', invoiceNumber: 'INV-123', date: '۱۴۰۵/۷/۱۸', time: '۱۲:۳۰',
    status: 'PENDING_PAYMENT', total: 125000,
    customer: { firstName: '<script>', lastName: 'آزما' },
    invoiceItems: [{ name: 'فلاسک ۲۵۰ میلی‌لیتر', quantity: 2 }],
    invoice: { total: 125000 },
  };
  const context = {
    state: { orders: [order] },
    location: { hash: '#order-success?number=INV-123' },
    window: { matchMedia: () => ({ matches: reducedMotion }), setTimeout: () => {}, print: () => { printed = true; } },
    document: { querySelector: () => null, addEventListener: (name, handler) => { listeners[name] = handler; } },
    $: () => app,
    render: () => { app.innerHTML = 'old page'; },
    invoicePage: number => `<section id="printInvoice">${number}</section>`,
    money: amount => `${amount} تومان`,
    fa: value => String(value),
    URLSearchParams,
    encodeURIComponent,
  };
  vm.runInNewContext(script, context);
  return { app, context, listeners, get printed() { return printed; } };
}

test('successful order shows its saved invoice and print action', () => {
  const page = mount();
  assert.match(page.app.innerHTML, /printer-machine/);
  assert.match(page.app.innerHTML, /INV-123/);
  assert.match(page.app.innerHTML, /فلاسک ۲۵۰ میلی‌لیتر/);
  assert.match(page.app.innerHTML, /id="printInvoice"/);
  assert.doesNotMatch(page.app.innerHTML, /<script>/);
  page.listeners.click({ target: { closest: () => true } });
  assert.equal(page.printed, true);
});

test('reduced motion skips the paper feed', () => {
  assert.match(mount(true).app.innerHTML, /data-printer-stage="complete"/);
});
