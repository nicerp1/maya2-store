const {randomUUID}=require('node:crypto');
const base=process.env.TEST_BASE||'https://maya2-store.vercel.app';
async function call(path,method='GET',body,token){
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 const result=await response.json();
 if(!response.ok||!result.success)throw Error(`${path}: ${response.status} ${result.message}`);
 return result.data;
}
(async()=>{
 const password=randomUUID(),email=`qa-${Date.now()}@example.com`,mobile='099'+String(Date.now()).slice(-8);
 const customer=await call('/api/auth/register','POST',{firstName:'آزمون',lastName:'سیستم',email,mobile,password});
 const logged=await call('/api/auth/login','POST',{email,password});
 if(logged.user.id!==customer.user.id)throw Error('login identity mismatch');
 console.log('registration/login: PASS');
 const catalog=await call('/api/products?limit=48');
 const product=catalog.items.find(p=>p.stock>2);
 const item=await call('/api/cart/items','POST',{productId:product.id,quantity:1},logged.token);
 await call('/api/cart/items/'+item.id,'PATCH',{quantity:2},logged.token);
 const cart=await call('/api/cart','GET',null,logged.token);
 if(cart.items.find(i=>i.id===item.id)?.quantity!==2)throw Error('cart persistence mismatch');
 const order=await call('/api/checkout','POST',{province:'تهران',city:'تهران',address:'سفارش آزمون فنی — ارسال نشود',postalCode:'1234567890',shippingMethod:'STANDARD'},logged.token);
 const mine=await call('/api/orders','GET',null,logged.token);
 if(!mine.some(o=>o.id===order.id))throw Error('customer order missing');
 const admin=await call('/api/auth/login','POST',{email:process.env.TEST_ADMIN_EMAIL,password:process.env.TEST_ADMIN_PASSWORD});
 const all=await call('/api/orders','GET',null,admin.token);
 if(!all.some(o=>o.id===order.id))throw Error('admin order missing');
 await call(`/api/orders/${order.id}/status`,'PATCH',{status:'CANCELLED'},admin.token);
 console.log('cart/checkout/customer/admin: PASS',order.orderNumber,'test order cancelled');
})().catch(e=>{console.error(e.message);process.exitCode=1});
