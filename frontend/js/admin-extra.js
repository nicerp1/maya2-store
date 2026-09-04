document.addEventListener('click',event=>{
  const add=event.target.closest('[data-brand-add]'),edit=event.target.closest('[data-brand-edit]'),remove=event.target.closest('[data-brand-delete]');
  if(add){const name=prompt('نام برند جدید را وارد کنید:');if(name&&!state.brands.includes(name)){state.brands.push(name);save();render();notify('برند ایجاد شد')}}
  if(edit){const old=edit.dataset.brandEdit,name=prompt('نام جدید برند:',old);if(name&&name!==old){state.brands=state.brands.map(x=>x===old?name:x);products.filter(p=>p.brand===old).forEach(p=>p.brand=name);save();render();notify('برند و محصولات آن به‌روزرسانی شدند')}}
  if(remove&&confirm('برند حذف شود؟ محصولات آن بدون برند خواهند شد.')){const name=remove.dataset.brandDelete;state.brands=state.brands.filter(x=>x!==name);products.filter(p=>p.brand===name).forEach(p=>p.brand='بدون برند');save();render();notify('برند حذف شد')}
});
