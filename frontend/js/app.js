const API = "http://localhost:4000/api",
  $ = (s) => document.querySelector(s),
  fa = (n) => new Intl.NumberFormat("fa-IR").format(n),
  money = (n) => fa(Math.round(n)) + " تومان";
const defaultCategories = [
  ["laboratory-chemicals", "مواد آزمایشگاهی", "🧪"],
  ["chemicals", "مواد شیمیایی", "⚗", "laboratory-chemicals"],
  ["molecular", "مواد مولکولی", "🧬", "laboratory-chemicals"],
  ["cell-culture", "کشت سلولی", "🧫", "laboratory-chemicals"],
  ["microbial-culture", "کشت میکروبی", "🦠", "laboratory-chemicals"],
  ["laboratory-glassware", "شیشه‌آلات", "🧪"],
  ["lab-containers", "ظروف", "🧴"],
  ["laboratory-consumables", "ظروف و اقلام مصرفی", "📦", "lab-containers"],
  ["miscellaneous-lab-supplies", "سایر ملزومات", "🧰", "lab-containers"],
  ["plastic-labware", "ظروف پلاستیکی", "🧪", "lab-containers"],
  ["stand-and-rack", "پایه‌ها و رک‌ها", "🗄", "lab-containers"],
  ["laboratory-equipment", "تجهیزات", "🔬"],
];
const categories = JSON.parse(
  localStorage.getItem("maya-categories") || JSON.stringify(defaultCategories),
);
const categoryMigration = {
  consumables: "laboratory-consumables",
  cell: "cell-culture",
  molecular: "molecular",
  microbiology: "microbial-culture",
  equipment: "laboratory-equipment",
  general: "miscellaneous-lab-supplies",
};
if (localStorage.getItem("maya-category-structure") !== "gharbazma-v1") {
  categories.splice(
    0,
    categories.length,
    ...defaultCategories.map((c) => [...c]),
  );
  const savedProducts = JSON.parse(
    localStorage.getItem("maya-products") || "null",
  );
  if (savedProducts)
    savedProducts.forEach((p) => {
      p.category = categoryMigration[p.category] || p.category;
      p.icon = categories.find((c) => c[0] === p.category)?.[2] || p.icon;
    });
  if (savedProducts)
    localStorage.setItem("maya-products", JSON.stringify(savedProducts));
  localStorage.setItem("maya-categories", JSON.stringify(categories));
  localStorage.setItem("maya-category-structure", "gharbazma-v1");
}
const names = [
  "فلاسک کشت سلول",
  "لوله سانتریفیوژ ۵۰ میلی‌لیتر",
  "میکروپیپت متغیر ۱۰۰-۱۰۰۰",
  "بشر شیشه‌ای بوروسیلیکات",
  "ارلن مایر آزمایشگاهی",
  "پتری دیش استریل",
  "میکروتیوب ۱.۵ میلی‌لیتر",
  "فیلتر سرسرنگی PTFE",
  "تیوب PCR هشت‌تایی",
  "دستکش نیتریل بدون پودر",
  "سرسمپلر آبی ۱۰۰۰ لاندا",
  "رک آزمایشگاهی ۹۶ خانه",
  "بطری معرف قهوه‌ای",
  "لام میکروسکوپ ساده",
  "فلاسک مخروطی درب‌دار",
  "کیت استخراج DNA",
  "محیط کشت DMEM",
  "سانتریفیوژ رومیزی دیجیتال",
];
const defaultProducts = names.map((name, i) => ({
  id: String(i + 1),
  name,
  slug: `product-${i + 1}`,
  sku: `MAYA-${1001 + i}`,
  price: (i + 2) * 175000,
  discount: i % 4 === 0 ? 10 : i % 7 === 0 ? 15 : 0,
  stock: i === 13 ? 0 : 8 + i,
  brand: ["Maya Lab", "BIO-RAD", "SPL", "ISOLAB"][i % 4],
  category: categories[i % 6][0],
  icon: categories[i % 6][2],
  rating: (4 + (i % 9) / 10).toFixed(1),
  description: `${name} با استاندارد آزمایشگاهی، کیفیت کنترل‌شده و مناسب استفاده در مراکز تحقیقاتی، تشخیص طبی و دانشگاهی است.`,
  variants: ["۱ عدد", "بسته ۱۰ عددی", "بسته ۱۰۰ عددی"],
  specs: {
    جنس: i % 2 ? "پلی‌پروپیلن" : "بوروسیلیکات",
    گرید: "Laboratory Grade",
    کشور: "ایران",
    شرایط: "دمای محیط",
  },
}));
const products = JSON.parse(
  localStorage.getItem("maya-products") || JSON.stringify(defaultProducts),
);
const defaultSliders = [
  {
    id: "s1",
    title: "تجهیزات حرفه‌ای برای نتایج دقیق",
    description: "سانتریفیوژ، میکروپیپت و ملزومات معتبر با تضمین اصالت",
    image: "assets/images/slide-equipment.png",
    link: "#products?cat=laboratory-equipment",
    order: 1,
    active: true,
  },
  {
    id: "s2",
    title: "دنیای تخصصی کشت سلولی",
    description: "محصولات استریل و استاندارد برای آزمایشگاه‌های تحقیقاتی",
    image: "assets/images/slide-cell-culture.png",
    link: "#products?cat=cell-culture",
    order: 2,
    active: true,
  },
  {
    id: "s3",
    title: "راهکارهای مواد مولکولی",
    description: "ابزارهای دقیق PCR و استخراج برای پژوهش‌های پیشرفته",
    image: "assets/images/slide-molecular.png",
    link: "#products?cat=molecular",
    order: 3,
    active: true,
  },
];
const state = {
  cart: JSON.parse(localStorage.getItem("maya-cart") || "[]"),
  wish: JSON.parse(localStorage.getItem("maya-wish") || "[]"),
  user: JSON.parse(localStorage.getItem("maya-user") || "null"),
  orders: JSON.parse(localStorage.getItem("maya-orders") || "[]"),
  sliders: JSON.parse(
    localStorage.getItem("maya-sliders") || JSON.stringify(defaultSliders),
  ),
  discounts: JSON.parse(
    localStorage.getItem("maya-discounts") ||
      '[{"id":"d1","code":"MAYA10","type":"percent","amount":10,"active":true}]',
  ),
  reviews: JSON.parse(
    localStorage.getItem("maya-reviews") ||
      '[{"id":"r1","user":"مریم احمدی","product":"فلاسک کشت سلول","rating":5,"text":"کیفیت و بسته‌بندی عالی بود.","approved":false}]',
  ),
  brands: JSON.parse(
    localStorage.getItem("maya-brands") ||
      '["Maya Lab","BIO-RAD","SPL","ISOLAB"]',
  ),
  coupon: null,
};
const save = () => {
  localStorage.setItem("maya-cart", JSON.stringify(state.cart));
  localStorage.setItem("maya-wish", JSON.stringify(state.wish));
  localStorage.setItem("maya-orders", JSON.stringify(state.orders));
  localStorage.setItem("maya-products", JSON.stringify(products));
  localStorage.setItem("maya-categories", JSON.stringify(categories));
  localStorage.setItem("maya-sliders", JSON.stringify(state.sliders));
  localStorage.setItem("maya-discounts", JSON.stringify(state.discounts));
  localStorage.setItem("maya-reviews", JSON.stringify(state.reviews));
  localStorage.setItem("maya-brands", JSON.stringify(state.brands));
  updateBadges();
};
function notify(t, type = "success") {
  const el = $("#toast");
  el.textContent = t;
  el.style.background = type === "error" ? "var(--discount)" : "var(--success)";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}
function updateBadges() {
  $("#cartCount").textContent = fa(state.cart.reduce((a, x) => a + x.qty, 0));
  $("#wishCount").textContent = fa(state.wish.length);
  $("#accountLabel").textContent = state.user
    ? state.user.firstName
    : "ورود / ثبت‌نام";
}
const finalPrice = (p) => (p.price * (100 - p.discount)) / 100;
const fallbackImages = {
  "laboratory-equipment": "assets/images/slide-equipment.png",
  "cell-culture": "assets/images/slide-cell-culture.png",
  molecular: "assets/images/slide-molecular.png",
  "laboratory-consumables": "assets/images/slide-cell-culture.png",
  "microbial-culture": "assets/images/slide-molecular.png",
  "miscellaneous-lab-supplies": "assets/images/slide-equipment.png",
};
const productImages = (p) => {
  const list = [p.image, ...(Array.isArray(p.images) ? p.images : [])].filter(
    Boolean,
  );
  return [
    ...new Set(
      list.length
        ? list
        : [fallbackImages[p.category] || "assets/images/slide-equipment.png"],
    ),
  ];
};
function renderMega() {
  const menu = $("#megaMenu");
  if (!menu) return;
  const roots = categories.filter((c) => !c[3]),
    show = (cat) => {
      const children = categories.filter((c) => c[3] === cat),
        selected = [cat, ...children.map((c) => c[0])],
        list = products
          .filter((p) => p.active !== false && selected.includes(p.category))
          .slice(0, 6),
        box = menu.querySelector(".mega-products");
      box.innerHTML = `<h3>${categories.find((c) => c[0] === cat)?.[1] || "محصولات منتخب"}</h3>${children.length ? `<div class="mega-subcategories">${children.map((c) => `<a href="#products?cat=${c[0]}">${c[2]} ${c[1]}</a>`).join("")}</div>` : ""}<div class="mega-product-grid">${list.map((p) => `<a class="mega-product" href="#product?id=${p.id}"><img src="${productImages(p)[0]}" loading="lazy" alt=""><b>${p.name}</b></a>`).join("")}</div>`;
    };
  menu.innerHTML = `<div class="mega-categories">${roots.map((c) => `<a href="#products?cat=${c[0]}" data-mega-cat="${c[0]}"><span>${c[2]}</span>${c[1]} <small>‹</small></a>`).join("")}</div><div class="mega-products"></div>`;
  menu
    .querySelectorAll("[data-mega-cat]")
    .forEach((a) => (a.onmouseenter = () => show(a.dataset.megaCat)));
  if (roots[0]) show(roots[0][0]);
}
function card(p) {
  const img = productImages(p)[0],
    available = Number(p.stock) > 0;
  return `<article class="card"><button class="wish ${state.wish.includes(p.id) ? "active" : ""}" data-wish="${p.id}" aria-label="افزودن به علاقه‌مندی‌ها"><i data-lucide="${state.wish.includes(p.id) ? "heart" : "heart"}"></i></button>${p.discount ? `<span class="badge">${fa(p.discount)}٪ تخفیف</span>` : ""}<div class="card-image" data-product="${p.id}"><img src="${img}" alt="${p.name}" loading="lazy"></div><div class="card-body"><div class="card-brand"><strong>${p.brand}</strong><span>${p.sku}</span></div><h3 data-product="${p.id}">${p.name}</h3><div class="rating-row"><span class="rating">★ ${fa(p.rating || 4.8)} <small>(${fa(12 + Number(p.id || 1))})</small></span><span class="availability ${available ? "" : "out"}">${available ? "موجود در انبار" : "ناموجود"}</span></div><div class="price-area">${p.discount ? `<div class="old">${money(p.price)}</div>` : '<div class="old">&nbsp;</div>'}<div class="card-actions"><strong>${money(finalPrice(p))}</strong><button class="add-cart" data-add="${p.id}" ${!available ? "disabled" : ""} aria-label="افزودن به سبد"><i data-lucide="shopping-bag"></i></button></div></div></div></article>`;
}
let sliderIndex = 0,
  sliderTimer;
function sliderMarkup() {
  const active = state.sliders
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);
  return `<section class="hero-slider"><div class="slides-track">${active.map((s) => `<article class="hero-slide" style="background-image:url('${s.image}')"><div class="slide-copy"><span class="eyebrow">مایا آزما، همراه علم</span><h1>${s.title}</h1><p>${s.description}</p><a class="btn" href="${s.link}">مشاهده محصولات <i data-lucide="arrow-left"></i></a></div></article>`).join("")}</div><button class="slider-arrow slider-prev" aria-label="اسلاید قبلی"><i data-lucide="chevron-right"></i></button><button class="slider-arrow slider-next" aria-label="اسلاید بعدی"><i data-lucide="chevron-left"></i></button><div class="slider-dots">${active.map((_, i) => `<button class="slider-dot ${i === 0 ? "active" : ""}" data-slide="${i}" aria-label="اسلاید ${i + 1}"></button>`).join("")}</div></section>`;
}
function bindSlider() {
  clearInterval(sliderTimer);
  const track = $(".slides-track"),
    dots = [...document.querySelectorAll(".slider-dot")],
    count = dots.length;
  if (!track || !count) return;
  const go = (i) => {
    sliderIndex = (i + count) % count;
    track.style.transform = `translateX(-${sliderIndex * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle("active", j === sliderIndex));
  };
  $(".slider-next").onclick = () => go(sliderIndex + 1);
  $(".slider-prev").onclick = () => go(sliderIndex - 1);
  dots.forEach((d) => (d.onclick = () => go(Number(d.dataset.slide))));
  sliderTimer = setInterval(() => go(sliderIndex + 1), 5000);
}
function home() {
  return (
    sliderMarkup() +
    `<section class="benefits"><article><i>✓</i><b>تضمین اصالت</b><small>کالای معتبر</small></article><article><i>⌁</i><b>ارسال تخصصی</b><small>بسته‌بندی ایمن</small></article><article><i>♧</i><b>مشاوره علمی</b><small>کارشناسان مجرب</small></article><article><i>↺</i><b>ضمانت بازگشت</b><small>تا ۷ روز</small></article></section><section class="section"><div class="section-head"><div><span class="section-kicker">دسترسی سریع</span><h2>دسته‌بندی محصولات</h2></div><a href="#products">مشاهده همه ←</a></div><div class="category-grid">${categories.map((c) => `<a class="category-card" href="#products?cat=${c[0]}"><i>${c[2]}</i><b>${c[1]}</b><small>${fa(products.filter((p) => p.category === c[0]).length)} محصول</small></a>`).join("")}</div></section><section class="section alt product-section"><div class="section-head"><div><span class="section-kicker">انتخاب اقتصادی آزمایشگاه‌ها</span><h2>پیشنهادهای ویژه امروز</h2><p class="product-subtitle">محصولات منتخب با تضمین اصالت و قیمت رقابتی</p></div><a class="view-all" href="#products?discount=1">مشاهده همه ←</a></div><div class="grid">${products
      .filter((p) => p.active !== false && p.discount)
      .slice(0, 4)
      .map(card)
      .join(
        "",
      )}</div></section><section class="section product-section"><div class="section-head"><div><span class="section-kicker">تازه‌های مایا آزما</span><h2>محصولات جدید و تخصصی</h2><p class="product-subtitle">انتخاب‌شده برای پژوهشگران، دانشگاه‌ها و آزمایشگاه‌های حرفه‌ای</p></div><a class="view-all" href="#products">فروشگاه کامل ←</a></div><div class="grid">${products
      .filter((p) => p.active !== false)
      .slice(4, 12)
      .map(card)
      .join(
        "",
      )}</div></section><section class="section alt"><div class="section-head"><div><span class="section-kicker">برندهای معتبر</span><h2>همکاران تجاری ما</h2></div></div><div class="brand-grid">${["MAYA LAB", "BIO-RAD", "SPL", "ISOLAB", "Eppendorf", "Thermo"].map((x) => `<div class="brand-card"><b>${x}</b></div>`).join("")}</div></section>`
  );
}
function productsPage(params) {
  let list = products.filter((p) => p.active !== false),
    q = params.get("q") || "",
    cat = params.get("cat") || "",
    brand = params.get("brand") || "",
    sort = params.get("sort") || "new";
  if (q)
    list = list.filter((p) =>
      (p.name + p.sku + p.brand).toLowerCase().includes(q.toLowerCase()),
    );
  if (cat) list = list.filter((p) => p.category === cat);
  if (brand) list = list.filter((p) => p.brand === brand);
  if (params.get("discount")) list = list.filter((p) => p.discount);
  if (params.get("stock")) list = list.filter((p) => p.stock);
  if (sort === "cheap") list.sort((a, b) => finalPrice(a) - finalPrice(b));
  if (sort === "expensive") list.sort((a, b) => finalPrice(b) - finalPrice(a));
  return `<div class="page-hero"><div class="breadcrumb">خانه / محصولات</div><h1>محصولات آزمایشگاهی</h1><p>${fa(list.length)} کالا برای انتخاب شما</p></div><div class="catalog"><aside class="filters"><h3>فیلتر محصولات</h3><label>دسته‌بندی</label><select id="filterCat"><option value="">همه دسته‌ها</option>${categories.map((c) => `<option value="${c[0]}" ${cat === c[0] ? "selected" : ""}>${c[1]}</option>`).join("")}</select><label>برند</label><select id="filterBrand"><option value="">همه برندها</option>${[...new Set(products.map((p) => p.brand))].map((x) => `<option ${brand === x ? "selected" : ""}>${x}</option>`).join("")}</select><label>حداکثر قیمت</label><input id="maxPrice" type="range" min="500000" max="5000000" value="5000000"><label><input id="onlyStock" type="checkbox" ${params.get("stock") ? "checked" : ""}> فقط کالاهای موجود</label><label><input id="onlyDiscount" type="checkbox" ${params.get("discount") ? "checked" : ""}> فقط تخفیف‌دارها</label><button class="btn" id="applyFilters">اعمال فیلتر</button></aside><section><div class="catalog-head"><b>نتایج جستجو</b><select id="sort"><option value="new">جدیدترین</option><option value="cheap" ${sort === "cheap" ? "selected" : ""}>ارزان‌ترین</option><option value="expensive" ${sort === "expensive" ? "selected" : ""}>گران‌ترین</option></select></div>${list.length ? `<div class="grid">${list.map(card).join("")}</div>` : `<div class="empty"><i>⌕</i><h2>محصولی پیدا نشد</h2><p>فیلترها یا عبارت جستجو را تغییر دهید.</p></div>`}<div class="status">صفحه ۱ از ۱</div></section></div>`;
}
function productPage(id) {
  const p = products.find((x) => x.id === id) || products[0],
    imgs = productImages(p),
    short = p.shortDescription || p.description,
    long = p.longDescription || p.description;
  return `<div class="page-hero"><div class="breadcrumb">خانه / محصولات / ${p.name}</div></div><section class="product-detail"><div><div class="gallery-main"><img id="mainProductImage" src="${imgs[0]}" alt="${p.name}"></div><div class="thumbnails">${imgs.map((img, i) => `<button data-thumb="${img}" aria-label="تصویر ${i + 1}"><img src="${img}" alt=""></button>`).join("")}</div></div><div class="detail-info"><span class="section-kicker">${p.brand}</span><h1>${p.name}</h1><p>کد محصول: <b>${p.sku}</b></p><div class="rating">★★★★★ ${fa(p.rating || 4.8)} از ۵ · ${fa(23)} دیدگاه</div><p>${short}</p><div class="stock">${p.stock ? `✓ موجود در انبار (${fa(p.stock)} عدد)` : "ناموجود"}</div><div class="detail-price">${money(finalPrice(p))}</div><b>نوع/بسته‌بندی:</b><div class="variant-list">${(p.variants || ["۱ عدد"]).map((v, i) => `<button class="${i === 0 ? "selected" : ""}">${typeof v === "string" ? v : v.name}</button>`).join("")}</div><div class="buy-row"><div class="qty"><button data-qty="down">−</button><span id="detailQty">1</span><button data-qty="up">+</button></div><button class="btn" data-add="${p.id}"><i data-lucide="shopping-cart"></i> افزودن به سبد خرید</button><button class="btn outline" data-wish="${p.id}"><i data-lucide="heart"></i></button></div><div class="product-trust"><div>✓ ضمانت اصالت</div><div>🚚 ارسال ایمن</div><div>☎ مشاوره تخصصی</div></div></div></section><section class="tabs"><div class="tab-buttons"><button class="active" data-tab="desc">توضیحات کامل</button><button data-tab="spec">مشخصات فنی</button><button data-tab="use">کاربردها و نگهداری</button><button data-tab="review">نظرات کاربران</button></div><div id="tabContent" class="tab-content">${long}</div></section>`;
}
function cartPage() {
  const items = state.cart
      .map((x) => ({ ...x, p: products.find((p) => p.id === x.id) }))
      .filter((x) => x.p),
    subtotal = items.reduce((a, x) => a + finalPrice(x.p) * x.qty, 0),
    discount = state.coupon ? Math.min(subtotal * 0.1, 1000000) : 0,
    shipping = subtotal >= 3000000 || !items.length ? 0 : 150000,
    total = subtotal - discount + shipping;
  window.cartTotal = total;
  return `<div class="page-hero"><div class="breadcrumb">خانه / سبد خرید</div><h1>سبد خرید</h1></div>${!items.length ? `<section class="section"><div class="empty"><i>🛒</i><h2>سبد خرید شما خالی است</h2><a class="btn" href="#products">مشاهده محصولات</a></div></section>` : `<div class="layout"><section class="panel"><h2>کالاهای سبد (${fa(items.length)})</h2>${items.map((x) => `<article class="cart-item"><div class="cart-thumb">${x.p.icon}</div><div><b>${x.p.name}</b><p>${x.p.brand} · ${x.variant || "۱ عدد"}</p><button class="btn danger" data-remove="${x.id}" style="padding:5px 10px">حذف</button></div><div><strong>${money(finalPrice(x.p) * x.qty)}</strong><div class="qty"><button data-cartqty="${x.id}:down">−</button><span>${fa(x.qty)}</span><button data-cartqty="${x.id}:up">+</button></div></div></article>`).join("")}</section><aside class="panel summary"><h2>خلاصه سفارش</h2><div class="summary-row"><span>جمع کالاها</span><b>${money(subtotal)}</b></div><div class="summary-row"><span>تخفیف</span><b style="color:var(--discount)">− ${money(discount)}</b></div><div class="summary-row"><span>ارسال</span><b>${shipping ? money(shipping) : "رایگان"}</b></div><div class="coupon"><input id="coupon" placeholder="کد تخفیف"><button id="couponBtn">اعمال</button></div><small>کد آزمایشی: MAYA10</small><div class="summary-row total"><span>مبلغ نهایی</span><b>${money(total)}</b></div><a class="btn" style="width:100%" href="#checkout">ادامه فرایند خرید</a></aside></div>`}`;
}
function wishlistPage() {
  const list = products.filter((p) => state.wish.includes(p.id));
  return `<div class="page-hero"><div class="breadcrumb">خانه / علاقه‌مندی‌ها</div><h1>علاقه‌مندی‌های من</h1></div><section class="section">${list.length ? `<div class="grid">${list.map(card).join("")}</div>` : `<div class="empty"><i>♡</i><h2>لیست علاقه‌مندی خالی است</h2><a class="btn" href="#products">کشف محصولات</a></div>`}</section>`;
}
function checkoutPage() {
  if (!state.cart.length) return cartPage();
  return `<div class="page-hero"><h1>تسویه‌حساب امن</h1></div><section class="checkout"><div class="steps"><div class="step active"><b>۱</b>مشخصات</div><div class="step active"><b>۲</b>آدرس</div><div class="step active"><b>۳</b>ارسال</div><div class="step active"><b>۴</b>پرداخت</div></div><div class="layout" style="padding:0"><form id="checkoutForm" class="panel"><h2>اطلاعات تحویل‌گیرنده</h2><div class="form-grid"><div class="field"><label>نام</label><input name="firstName" required value="${state.user?.firstName || ""}"></div><div class="field"><label>نام خانوادگی</label><input name="lastName" required value="${state.user?.lastName || ""}"></div><div class="field"><label>شماره موبایل</label><input name="mobile" required pattern="09[0-9]{9}" placeholder="09123456789"></div><div class="field"><label>ایمیل</label><input name="email" type="email" value="${state.user?.email || ""}"></div><div class="field"><label>استان</label><select name="province"><option>تهران</option><option>البرز</option><option>اصفهان</option><option>فارس</option></select></div><div class="field"><label>شهر</label><input name="city" required></div><div class="field full"><label>نشانی کامل</label><textarea name="address" required rows="3"></textarea></div><div class="field"><label>کد پستی</label><input name="postal" required pattern="[0-9]{10}"></div><div class="field"><label>روش ارسال</label><select name="shipping"><option>استاندارد</option><option>اکسپرس</option></select></div></div><h2>پرداخت آزمایشی</h2><p class="status-pill">این فرم به درگاه واقعی متصل نیست و اطلاعات کارت ذخیره نمی‌شود.</p><div class="payment-card"><span>MAYA MOCK PAYMENT</span><div class="card-number" id="cardPreview">•••• •••• •••• ••••</div><div><span id="holderPreview">نام دارنده کارت</span><span style="float:left">••/••</span></div></div><div class="form-grid"><div class="field full"><label>شماره کارت (صرفاً پیش‌نمایش محلی)</label><input id="cardNumber" inputmode="numeric" maxlength="19" autocomplete="off" placeholder="0000 0000 0000 0000"></div><div class="field"><label>نام دارنده</label><input id="cardHolder" autocomplete="off"></div><div class="field"><label>تاریخ انقضا</label><input maxlength="5" placeholder="00/00" autocomplete="off"></div></div><button class="btn" type="submit" style="width:100%;margin-top:20px">ثبت سفارش و پرداخت آزمایشی</button></form><aside class="panel summary"><h2>سفارش شما</h2>${state.cart
    .map((x) => {
      const p = products.find((p) => p.id === x.id);
      return `<div class="summary-row"><span>${p.name} × ${fa(x.qty)}</span><b>${money(finalPrice(p) * x.qty)}</b></div>`;
    })
    .join(
      "",
    )}<div class="summary-row total"><span>قابل پرداخت</span><b>${money(window.cartTotal || state.cart.reduce((a, x) => a + finalPrice(products.find((p) => p.id === x.id)) * x.qty, 0))}</b></div></aside></div></section>`;
}
function accountPage() {
  if (!state.user)
    return `<div class="page-hero"><h1>حساب کاربری</h1></div><section class="section"><div class="panel" style="max-width:480px;margin:auto"><div class="tab-buttons"><button class="active" data-auth-tab="login">ورود</button><button data-auth-tab="register">ثبت‌نام</button></div><form id="authForm"><h2 id="authTitle">ورود به مایا آزما</h2><div id="nameFields" class="form-grid" style="display:none"><div class="field"><label>نام</label><input name="firstName"></div><div class="field"><label>نام خانوادگی</label><input name="lastName"></div></div><div class="field"><label>ایمیل</label><input name="email" type="email" required></div><div class="field"><label>رمز عبور</label><input name="password" type="password" minlength="8" required></div><button class="btn" style="width:100%;margin-top:18px">ورود</button></form></div></section>`;
  return `<div class="page-hero"><h1>سلام ${state.user.firstName}</h1><p>به پنل کاربری مایا آزما خوش آمدید.</p></div><div class="account-layout"><aside class="sidebar"><a class="active">نمای کلی</a><a href="#orders">سفارش‌های من</a><a href="#wishlist">علاقه‌مندی‌ها</a><a>آدرس‌ها</a>${state.user.role === "ADMIN" ? '<a href="#admin">پنل مدیریت</a>' : ""}<button id="logout" style="color:var(--discount)">خروج از حساب</button></aside><section><div class="stats"><div class="stat"><small>سفارش‌ها</small><strong>${fa(state.orders.length)}</strong></div><div class="stat"><small>علاقه‌مندی‌ها</small><strong>${fa(state.wish.length)}</strong></div><div class="stat"><small>اعتبار</small><strong>۰ تومان</strong></div></div><div class="panel" style="margin-top:20px"><h2>اطلاعات شخصی</h2><div class="form-grid"><div><small>نام و نام خانوادگی</small><p>${state.user.firstName} ${state.user.lastName || ""}</p></div><div><small>ایمیل</small><p>${state.user.email}</p></div></div></div></section></div>`;
}
function ordersPage() {
  return `<div class="page-hero"><h1>سفارش‌های من</h1></div><section class="section">${state.orders.length ? `<div class="panel"><table><thead><tr><th>شماره سفارش</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th><th></th></tr></thead><tbody>${state.orders.map((o) => `<tr><td>${o.number}</td><td>${o.date}</td><td>${money(o.total)}</td><td><span class="status-pill">در حال پردازش</span></td><td><a href="#tracking?id=${o.number}">پیگیری</a></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty"><i>▤</i><h2>هنوز سفارشی ثبت نکرده‌اید</h2><a class="btn" href="#products">شروع خرید</a></div>`}</section>`;
}
function trackingPage(params) {
  const id = params.get("id") || "",
    order = id
      ? state.orders.find((o) => o.number.toLowerCase() === id.toLowerCase())
      : null,
    steps = [
      "ثبت سفارش",
      "تأیید سفارش",
      "آماده‌سازی",
      "تحویل به شرکت حمل",
      "ارسال شده",
      "تحویل شده",
    ],
    levels = {
      PENDING_PAYMENT: 0,
      PAID: 1,
      PROCESSING: 1,
      PREPARING: 2,
      SHIPPED: 4,
      DELIVERED: 5,
    },
    level = order ? (levels[order.status] ?? 1) : -1;
  return `<div class="page-hero"><h1>پیگیری سفارش</h1><p>کد سفارش را وارد کنید تا وضعیت واقعی آن نمایش داده شود.</p></div><section class="section"><div class="panel" style="max-width:750px;margin:auto"><form id="trackForm" class="coupon"><input id="trackCode" required value="${id}" autocomplete="off" placeholder="کد سفارش مانند MAYA-12345678"><button>پیگیری</button></form>${!id ? '<div class="admin-empty">برای مشاهده وضعیت، کد سفارش خود را وارد کنید.</div>' : !order ? '<div class="empty"><h2>سفارشی با این کد پیدا نشد</h2><p>کد را بررسی و دوباره تلاش کنید.</p></div>' : order.status === "CANCELLED" ? '<div class="empty"><h2>این سفارش لغو شده است</h2></div>' : `<h3>سفارش ${order.number}</h3><p>وضعیت فعلی: <span class="status-pill">${order.status}</span></p><div class="timeline">${steps.map((x, i) => `<div class="timeline-item ${i > level ? "pending" : ""}"><b>${x}</b><p>${i <= level ? "انجام شده" : "در انتظار انجام"}</p></div>`).join("")}</div>`}</div></section>`;
}
function adminPage(params) {
  return adminUI.render(params);
}
function aboutPage() {
  return `<div class="page-hero"><h1>درباره مایا آزما</h1></div><section class="section"><div class="panel" style="max-width:900px;margin:auto;line-height:2"><h2>همراه جامعه علمی ایران</h2><p>مایا آزما فروشگاه تخصصی تجهیزات، مواد و ملزومات آزمایشگاهی است. هدف ما فراهم‌کردن تجربه خرید شفاف، مطمئن و حرفه‌ای برای دانشگاه‌ها، آزمایشگاه‌ها و مراکز تحقیقاتی است.</p><h3>چرا مایا آزما؟</h3><p>کنترل اصالت کالا، مشاوره تخصصی، بسته‌بندی ایمن، ارسال سراسری و پشتیبانی پس از فروش.</p><h3>تماس با ما</h3><p>تهران، خیابان کارگر شمالی · تلفن ۰۲۱-۹۱۰۰۱۲۳۴ · info@mayaazma.ir</p></div></section>`;
}
function render() {
  const raw = location.hash.slice(1) || "home",
    [path, query = ""] = raw.split("?"),
    params = new URLSearchParams(query);
  let html = "";
  if (path === "home") html = home();
  else if (path === "products") html = productsPage(params);
  else if (path === "product") html = productPage(params.get("id"));
  else if (path === "cart") html = cartPage();
  else if (path === "wishlist") html = wishlistPage();
  else if (path === "checkout") html = checkoutPage();
  else if (path === "account") html = accountPage();
  else if (path === "orders") html = ordersPage();
  else if (path === "tracking") html = trackingPage(params);
  else if (path === "admin") html = adminPage(params);
  else html = aboutPage();
  $("#app").innerHTML = html;
  document.title =
    (path === "home" ? "مایا آزما" : $("#app h1")?.textContent || "مایا آزما") +
    " | مایا آزما";
  window.scrollTo(0, 0);
  bindPage();
  renderMega();
  if (window.lucide) lucide.createIcons();
}
function add(id, qty = 1) {
  const item = state.cart.find((x) => x.id === id);
  item ? (item.qty += qty) : state.cart.push({ id, qty, variant: "۱ عدد" });
  save();
  notify("محصول به سبد خرید اضافه شد");
}
function toggleWish(id) {
  state.wish = state.wish.includes(id)
    ? state.wish.filter((x) => x !== id)
    : [...state.wish, id];
  save();
  notify(
    state.wish.includes(id)
      ? "به علاقه‌مندی‌ها اضافه شد"
      : "از علاقه‌مندی‌ها حذف شد",
  );
  render();
}
function bindPage() {
  document
    .querySelectorAll("[data-product]")
    .forEach(
      (x) =>
        (x.onclick = () => (location.hash = `product?id=${x.dataset.product}`)),
    );
  document
    .querySelectorAll("[data-add]")
    .forEach(
      (x) =>
        (x.onclick = () =>
          add(x.dataset.add, Number($("#detailQty")?.textContent || 1))),
    );
  document
    .querySelectorAll("[data-wish]")
    .forEach((x) => (x.onclick = () => toggleWish(x.dataset.wish)));
  document.querySelectorAll("[data-remove]").forEach(
    (x) =>
      (x.onclick = () => {
        state.cart = state.cart.filter((i) => i.id !== x.dataset.remove);
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-cartqty]").forEach(
    (x) =>
      (x.onclick = () => {
        const [id, d] = x.dataset.cartqty.split(":"),
          item = state.cart.find((i) => i.id === id);
        item.qty += d === "up" ? 1 : -1;
        if (item.qty < 1) state.cart = state.cart.filter((i) => i.id !== id);
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-qty]").forEach(
    (x) =>
      (x.onclick = () => {
        const el = $("#detailQty");
        el.textContent = Math.max(
          1,
          Number(el.textContent) + (x.dataset.qty === "up" ? 1 : -1),
        );
      }),
  );
  $("#couponBtn")?.addEventListener("click", () => {
    if ($("#coupon").value.trim().toUpperCase() === "MAYA10") {
      state.coupon = "MAYA10";
      notify("کد تخفیف با موفقیت اعمال شد");
      render();
    } else notify("کد تخفیف معتبر نیست", "error");
  });
  $("#applyFilters")?.addEventListener("click", () => {
    const p = new URLSearchParams();
    if ($("#filterCat").value) p.set("cat", $("#filterCat").value);
    if ($("#filterBrand").value) p.set("brand", $("#filterBrand").value);
    if ($("#onlyStock").checked) p.set("stock", "1");
    if ($("#onlyDiscount").checked) p.set("discount", "1");
    location.hash = "products?" + p;
  });
  $("#sort")?.addEventListener("change", (e) => {
    const p = new URLSearchParams(location.hash.split("?")[1] || "");
    p.set("sort", e.target.value);
    location.hash = "products?" + p;
  });
  document.querySelectorAll("[data-auth-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        document
          .querySelectorAll("[data-auth-tab]")
          .forEach((x) => x.classList.toggle("active", x === b));
        const reg = b.dataset.authTab === "register";
        $("#nameFields").style.display = reg ? "grid" : "none";
        $("#authTitle").textContent = reg
          ? "ساخت حساب جدید"
          : "ورود به مایا آزما";
        $("#authForm button").textContent = reg ? "ثبت‌نام" : "ورود";
        $("#authForm").dataset.mode = reg ? "register" : "login";
      }),
  );
  // Authentication is handled by real-auth.js.
  $("#logout")?.addEventListener("click", () => {
    state.user = null;
    localStorage.removeItem("maya-user");
    updateBadges();
    render();
  });
  // Checkout is handled by real-commerce.js.
  $("#cardNumber")?.addEventListener("input", (e) => {
    e.target.value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
    $("#cardPreview").textContent = e.target.value || "•••• •••• •••• ••••";
  });
  $("#cardHolder")?.addEventListener(
    "input",
    (e) =>
      ($("#holderPreview").textContent = e.target.value || "نام دارنده کارت"),
  );
  document.querySelectorAll("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        document
          .querySelectorAll("[data-tab]")
          .forEach((x) => x.classList.toggle("active", x === b));
        const p =
          products.find(
            (x) =>
              x.id ===
              new URLSearchParams(location.hash.split("?")[1]).get("id"),
          ) || products[0];
        $("#tabContent").innerHTML =
          b.dataset.tab === "spec"
            ? `<table>${Object.entries(p.specs)
                .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
                .join("")}</table>`
            : b.dataset.tab === "review"
              ? '<h3>دیدگاه کاربران</h3><p>کیفیت بسته‌بندی و زمان ارسال بسیار مناسب بود.</p><button class="btn">ثبت دیدگاه</button>'
              : b.dataset.tab === "use"
                ? "<p>مناسب آزمایشگاه‌های تحقیقاتی، دانشگاهی، تشخیص طبی و کنترل کیفیت.</p>"
                : p.description;
      }),
  );
  $("#newProduct")?.addEventListener("click", () =>
    openModal(
      '<h2>افزودن محصول</h2><div class="field"><label>نام محصول</label><input></div><div class="field"><label>قیمت</label><input type="number"></div><button class="btn" onclick="document.querySelector(\'[data-modal-close]\').click();">ذخیره آزمایشی</button>',
    ),
  );
  $("#trackForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = $("#trackCode").value.trim();
    if (code) location.hash = "tracking?id=" + encodeURIComponent(code);
  });
  adminUI.bind();
  bindSlider();
}
function openModal(html) {
  $("#modalBody").innerHTML = html;
  $("#modal").classList.add("open");
}
$("#theme").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "maya-theme",
    document.body.classList.contains("dark") ? "dark" : "light",
  );
};
if (localStorage.getItem("maya-theme") === "dark")
  document.body.classList.add("dark");
$("#search").onsubmit = (e) => {
  e.preventDefault();
  location.hash =
    "products?q=" + encodeURIComponent(new FormData(e.target).get("q"));
};
$("#menuBtn").onclick = () => {
  $("#drawer").classList.add("open");
  $("#backdrop").classList.add("open");
};
const closeDrawer = () => {
  $("#drawer").classList.remove("open");
  $("#backdrop").classList.remove("open");
};
$("#backdrop").onclick = closeDrawer;
document
  .querySelectorAll("[data-close]")
  .forEach((x) => (x.onclick = closeDrawer));
document
  .querySelectorAll("[data-modal-close]")
  .forEach((x) => (x.onclick = () => $("#modal").classList.remove("open")));
$("#newsletter").onsubmit = (e) => {
  e.preventDefault();
  e.target.reset();
  notify("عضویت در خبرنامه انجام شد");
};
window.addEventListener("hashchange", () => {
  closeDrawer();
  render();
});
updateBadges();
render();
