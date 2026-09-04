const readAdminImage=file=>new Promise((resolve,reject)=>{if(file.size>1500000)return reject(new Error('large'));const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)});
document.addEventListener('change',async event=>{
  if(event.target.id!=='adminImageFile'&&event.target.id!=='adminGalleryFiles')return;
  try{
    const urls=await Promise.all([...event.target.files].map(readAdminImage));
    const area=document.querySelector('[name="images"]');
    if(event.target.id==='adminImageFile'){
      document.querySelector('#adminImageUrl').value=urls[0];
      document.querySelector('#adminImagePreview').src=urls[0];
      area.value=[urls[0],...area.value.split(/\r?\n/).filter(x=>x&&!x.startsWith('data:'))].join('\n');
    }else{
      area.value=[...urls,...area.value.split(/\r?\n/).filter(Boolean)].join('\n');
      document.querySelector('#uploadPreviews').innerHTML=urls.map(url=>`<img src="${url}" alt="پیش‌نمایش تصویر">`).join('');
    }
  }catch{notify('حجم هر تصویر باید کمتر از ۱.۵ مگابایت باشد','error')}
});
