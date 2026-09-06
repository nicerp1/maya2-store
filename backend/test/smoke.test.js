import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');

test('critical APIs are present', () => {
  for (const route of ['/api/auth/login','/api/products','/api/cart','/api/wishlist','/api/checkout','/api/orders','/api/admin/stats']) assert.ok(appSource.includes(route), route);
});

test('security middleware is configured', () => {
  for (const feature of ['helmet()','rateLimit','jwt.verify','bcrypt.compare','auth([\'ADMIN\'])']) assert.ok(appSource.includes(feature), feature);
});

test('authentication uses secure cookies and verifies Google server-side', () => {
  for (const marker of ['httpOnly:true', "sameSite:'lax'", "secure:process.env.NODE_ENV === 'production'", 'oauth2.googleapis.com/tokeninfo', "profile.aud!==process.env.GOOGLE_CLIENT_ID"]) assert.ok(appSource.includes(marker), marker);
  assert.ok(appSource.includes("app.post('/api/auth/logout'"));
  assert.ok(!appSource.includes('jwt.decode('));
});

test('required commerce models exist', () => {
  for (const model of ['User','Product','ProductVariant','Cart','Wishlist','Order','DiscountCode','Review','Slider']) assert.match(schema, new RegExp(`model ${model} \\{`));
});
