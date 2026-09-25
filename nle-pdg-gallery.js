(function(){
function fix(){
 var g=document.getElementById('pdgGallery');if(!g)return;
 var imgs=[].slice.call(g.querySelectorAll('.pdg-gallery-image'));if(!imgs.length)return;
 var i=0,prev=document.getElementById('pdgPrev'),next=document.getElementById('pdgNext'),counter=document.getElementById('pdgCounter');
 function show(n){
   i=(n+imgs.length)%imgs.length;
   imgs.forEach(function(im,k){
     if(k===i){im.removeAttribute('hidden');im.style.display='block'}
     else{im.setAttribute('hidden','hidden');im.style.display='none'}
     im.style.width='100%';im.style.height='auto';im.style.maxHeight='none';im.style.objectFit='contain';im.style.objectPosition='center';
   });
   if(counter)counter.textContent='Photo '+(i+1)+' / '+imgs.length;
 }
 if(prev&&!prev.dataset.nleFix){prev.dataset.nleFix='1';prev.addEventListener('click',function(){show(i-1)})}
 if(next&&!next.dataset.nleFix){next.dataset.nleFix='1';next.addEventListener('click',function(){show(i+1)})}
 show(0);
}
var st=document.createElement('style');st.textContent='#pdgGallery .pdg-gallery-image{width:100%;height:auto;max-height:none;object-fit:contain;object-position:center;background:#fff}#pdgGallery .pdg-gallery-image[hidden]{display:none!important}';document.head.appendChild(st);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
setTimeout(fix,300);setTimeout(fix,1200);
})();