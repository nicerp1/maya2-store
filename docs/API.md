# API مایا آزما

تمام پاسخ‌ها با ساختار `{ "success": true, "data": ... }` یا `{ "success": false, "message": "..." }` بازگردانده می‌شوند.

## مسیرهای عمومی

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/categories`
- `GET /api/brands`
- `POST /api/auth/register`
- `POST /api/auth/login`

## مسیرهای کاربر

- `/api/cart` و `/api/cart/items/:id`
- `/api/wishlist` و `/api/wishlist/:productId`
- `POST /api/discounts/validate`
- `POST /api/checkout`
- `GET /api/orders` و `GET /api/orders/:id`
- `POST /api/products/:id/reviews`
- `POST /api/payments/mock/initiate` و `/verify`

## مدیریت

مسیرهای ایجاد، ویرایش و حذف محصول، تغییر وضعیت سفارش و آمار مدیریت به نقش `ADMIN` نیاز دارند.
