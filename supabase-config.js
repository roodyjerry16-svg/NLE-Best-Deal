// NLE Best Deal — Supabase configuration publique
window.NLE_SUPABASE_CONFIG = {
  url: 'https://bfgelskeixdtneghuxcd.supabase.co',
  key: 'sb_publishable_FW5FGNFjIlRSSbtcCp3JSA_GybtgjoO'
};

// Produits iPhone + Admin discret.
(function(){
  function start(){
    const grid=document.querySelector('#produits .products');
    const nav=document.querySelector('.links');
    const adminUrl='https://roodyjerry16-svg.github.io/NLE-Best-Deal/admin.html';

    // Retire les anciennes versions de l'Admin.
    document.getElementById('nle-mobile-admin')?.remove();
    nav?.querySelector('a[href*="/admin.html"]')?.remove();

    // Admin discret tout en bas, à côté des réseaux sociaux si présents.
    const socials=document.querySelector('.socials');
    const footer=document.querySelector('footer') || document.querySelector('.footer');
    const host=socials || footer || document.body;
    if(host && !document.querySelector('[data-nle-admin]')){
      const a=document.createElement('a');
      a.href=adminUrl; a.textContent='Admin'; a.dataset.nleAdmin='true';
      a.setAttribute('aria-label','Administration NLE Best Deal');
      a.style.cssText='font-size:11px!important;line-height:1.4;opacity:.38;text-decoration:none;margin-left:10px;display:inline-block;color:inherit!important;font-weight:400;cursor:pointer;';
      if(host===document.body){a.style.margin='20px auto 8px';a.style.display='block';a.style.textAlign='center';}
      host.appendChild(a);
    }

    if(!grid || !window.supabase) return;
    const sb=window.supabase.createClient(window.NLE_SUPABASE_CONFIG.url,window.NLE_SUPABASE_CONFIG.key);
    const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    const images=v=>{if(Array.isArray(v))return v.filter(Boolean);if(typeof v==='string'){try{const a=JSON.parse(v);if(Array.isArray(a))return a.filter(Boolean)}catch(e){}return v.trim()?[v.trim()]:[]}return[]};
    const imgUrl=u=>{u=String(u||'').trim();if(/^https?:\/\//i.test(u))return u;return sb.storage.from('product-images').getPublicUrl(u.replace(/^\/+/, '').replace(/^product-images\//,'')).data.publicUrl||u};
    const price=v=>{const s=String(v??'').trim();if(!s)return '';if(/htg/i.test(s))return s.replace(/\s*htg/i,' HTG');const n=Number(s.replace(/[^0-9.]/g,''));return Number.isFinite(n)?n.toLocaleString('fr-FR')+' HTG':s+' HTG'};

    function card(p){
      const ims=images(p.images).map(imgUrl).filter(Boolean), badge=String(p.badge||'NOUVEAU').toUpperCase(), src=p.source==='Partenaire'?'Partenaire':'NLE', pr=price(p.price);
      return `<article class="product" data-category="${esc(p.category||'Mode')}" data-name="${esc(p.name)}" data-price="${esc(pr)}" data-source="${esc(src)}" data-db-product="true"><div class="product-img photo"><div class="badge-stack"><span class="shop-badge new">${esc(badge)}</span><span class="source-badge ${src==='Partenaire'?'partner':'nle'}">${src==='Partenaire'?'🤝 Partenaire':'🛍️ NLE Best Deal'}</span></div>${ims.map((u,i)=>`<img alt="${esc(p.name)}${i?' - photo '+(i+1):''}" loading="lazy" src="${esc(u)}">`).join('')}</div><div class="product-body"><span class="tag">${esc(badge)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description||'Découvrez ce produit chez NLE Best Deal.')}</p><div class="product-row"><span class="product-price">${esc(pr)}</span><button class="buy nle-db-cart" type="button">Ajouter au panier</button></div><div class="availability">✓ Disponible</div></div></article>`;
    }
    async function sync(){
      try{
        const {data,error}=await sb.from('products').select('id,name,price,category,description,badge,source,available,images,sort_order,created_at').eq('available',true).order('sort_order',{ascending:false}).order('created_at',{ascending:false});
        if(error||!Array.isArray(data))return;
        const names=new Set([...grid.querySelectorAll('.product')].map(x=>String(x.dataset.name||'').trim().toLowerCase()));
        const fresh=data.filter(p=>p?.name&&!names.has(String(p.name).trim().toLowerCase()));
        if(fresh.length)grid.insertAdjacentHTML('beforeend',fresh.map(card).join(''));
      }catch(e){}
    }
    grid.addEventListener('click',e=>{
      const b=e.target.closest('.nle-db-cart');if(!b)return;const p=b.closest('.product');if(!p)return;
      const n=p.dataset.name||'',pr=p.dataset.price||'',im=p.querySelector('img')?.src||'';
      if(typeof window.addToCart==='function')window.addToCart(n,pr,im);else if(typeof window.ajouterAuPanier==='function')window.ajouterAuPanier(n,pr,im);else b.textContent='Ajouté ✓';
    });
    sync();setInterval(sync,30000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
