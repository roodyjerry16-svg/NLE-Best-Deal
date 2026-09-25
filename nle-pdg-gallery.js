(function(){
function fix(){
 var g=document.getElementById('pdgGallery');if(!g)return;
 var imgs=[].slice.call(g.querySelectorAll('.pdg-gallery-image'));if(!imgs.length)return;
 imgs.forEach(function(im,i){im.style.display=i===0?'block':'none';im.style.width='100%';im.style.height='auto';im.style.maxHeight='none';im.style.objectFit='contain';im.style.objectPosition='center'});
 var i=0,prev=document.getElementById('pdgPrev'),next=document.getElementById('pdgNext'),counter=document.getElementById('pdgCounter');
 function show(n){i=(n+imgs.length)%imgs.length;imgs.forEach(function(im,k){im.style.display=k===i?'block':'none'});if(counter)counter.textContent='Photo '+(i+1)+' / '+imgs.length}
 if(prev&&!prev.dataset.nleFix){prev.dataset.nleFix='1';prev.onclick=function(){show(i-1)}} 
 if(next&&!next.dataset.nleFix){next.dataset.nleFix='1';next.onclick=function(){show(i+1)}} 
 show(0);
}
var st=document.createElement('style');st.textContent='#pdgGallery .pdg-gallery-image{display:none;width:100%;height:auto;max-height:none;object-fit:contain;object-position:center;background:#fff}#pdgGallery .pdg-gallery-image:first-of-type{display:block}';document.head.appendChild(st);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
setTimeout(fix,800);
})();