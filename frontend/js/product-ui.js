document.addEventListener('click',event=>{
  const thumb=event.target.closest('[data-thumb]');
  if(thumb){const main=document.querySelector('#mainProductImage');if(main)main.src=thumb.dataset.thumb;document.querySelectorAll('[data-thumb]').forEach(x=>x.classList.toggle('selected',x===thumb))}
  const variant=event.target.closest('.variant-list button');
  if(variant){variant.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===variant))}
});
