const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const listeners = {};
const storage = new Map([['maya-token','customer-token']]);
let releaseAdd, checkoutCalls = 0, cartItems = [];
const context = {
  console, URLSearchParams, setTimeout, clearTimeout,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  state:{cart:[],orders:[],user:{id:'customer'}},
  location:{hash:'#home'},
  document:{addEventListener:(name,fn)=>(listeners[name] ||= []).push(fn),querySelector:()=>null},
  save(){},render(){},notify(){},
  FormData:class { constructor(form){return Object.entries(form.values)[Symbol.iterator]();} },
  fetch:async(path,options)=>{
    let data;
    if(path==='/api/orders') data=[];
    else if(path==='/api/cart') data={items:cartItems};
    else if(path==='/api/cart/items') {
      await new Promise(resolve=>releaseAdd=resolve);
      cartItems=[{id:'line-1',productId:'product-1',quantity:1}]; data=cartItems[0];
    } else if(path==='/api/checkout') { checkoutCalls++; data={orderNumber:'ORDER-1',invoiceNumber:'INV-1',createdAt:new Date().toISOString(),total:100,status:'PENDING_PAYMENT'}; cartItems=[]; }
    else throw Error('unexpected request '+path);
    return {ok:true,status:200,json:async()=>({success:true,data})};
  }
};
context.window={addEventListener(){}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('frontend/js/real-commerce.js','utf8'),context);
const settle=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 await settle();
 const button={dataset:{add:'product-1'}};
 const event={target:{closest:s=>s==='[data-add]'?button:null},preventDefault(){},stopImmediatePropagation(){}};
 const adding=listeners.click[0](event);
 assert.equal(context.state.cart[0].qty,1,'cart updates before network response');
 const form={id:'checkoutForm',values:{province:'تهران',city:'تهران',address:'آزمایش',postal:'1234567890'},querySelector:()=>({})};
 const submit={target:form,preventDefault(){},stopImmediatePropagation(){}};
 const checking=listeners.submit[0](submit);
 await listeners.submit[0](submit);
 assert.equal(checkoutCalls,0,'checkout waits for pending cart writes');
 releaseAdd(); await adding; await checking;
 assert.equal(checkoutCalls,1,'double submit creates one order');
 assert.equal(context.location.hash,'invoice?number=INV-1');
 context.state.orders=[{number:'private'}];
 listeners.click[1]({target:{closest:()=>true},preventDefault(){},stopImmediatePropagation(){}});
 assert.equal(context.state.orders.length,0,'logout clears private orders');
 assert.equal(storage.has('maya-token'),false);
 console.log('PASS: immediate cart feedback, checkout waits, double-submit guard, server invoice, logout isolation');
})().catch(e=>{console.error(e);process.exitCode=1});
