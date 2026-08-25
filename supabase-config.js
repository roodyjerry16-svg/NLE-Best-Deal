// NLE Best Deal — Supabase configuration publique
// Cette clé est une clé publishable destinée au navigateur. Ne jamais mettre ici une service_role key.
window.NLE_SUPABASE_CONFIG = {
  url: 'https://bfgelskeixdtneghuxcd.supabase.co',
  key: 'sb_publishable_FW5FGNFjIlRSSbtcCp3JSA_GybtgjoO'
};

// Compatibilité boutique : ajoute les produits publiés depuis l'iPhone
// sans remplacer les produits historiques déjà présents dans index.html.
(function(){
  function start(){
    const grid=document.querySelector('#produits .products');
    const nav=document.querySelector('.links');
    if(nav && !nav.querySelector('a[href*="/admin.html"]')) nav.insertAdjacentHTML('beforeend','<a href="https://roodyjerry16-svg.github.io/NLE-Best-Deal/admin.html">⚙️ Admin</a>');
    const socials=document.querySelector('.socials');
    if(socials && !socials.querySelector('a[href*="tiktok.com"]')) socials.insertAdjacentHTML('beforeend','<a href="https://www.tiktok.com/@jerry_nle" rel="noopener noreferrer" target="_blank">TikTok @jerry_nle</a>');
    if(!grid || !window.supabase) return;
    const cfg=window.NLE_SUPABASE_CONFIG;
    if(!cfg.url || !cfg.key) return;
    const sb=window.supabase.createClient(cfg.url,cfg.key);
    const staticHTML=grid.innerHTML;
    const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    const images=v=>{if(Array.isArray(v))return v.filter(Boolean);if(typeof v==='string'){try{const a=JSON.parse(v);if(Array.isArray(a))return a.filter(Boolean)}catch(e){}return v.trim()?[v.trim()]:[]}return[]};
    const imgUrl=u=>{u=String(u||'').trim();if(/^https?:\/\//i.test(u))return u;return sb.storage.from('product-images').getPublicUrl(u.replace(/^\/+/, '').replace(/^product-images\//,'')).data.publicUrl||u};
    function card(p){
      const ims=images(p.images).map(imgUrl).filter(Boolean);
      const src=p.source==='Partenaire'?'Partenaire':'NLE';
      const badge=String(p.badge||'NOUVEAU').toUpperCase();
      const message=encodeURIComponent('Bonjour NLE Best Deal, je veux commander '+(p.name||'ce produit')+' à '+(p.price||'prix indiqué')+'.');
      return `<article class="product" data-category="${esc(p.category||'Mode')}" data-name="${esc(p.name)}" data-price="${esc(p.price)}" data-source="${esc(src)}" data-db-product="true"><div class="product-img photo"><div class="badge-stack"><span class="shop-badge new">${esc(badge)}</span><span class="source-badge ${src==='Partenaire'?'partner':'nle'}">${src==='Partenaire'?'🤝 Partenaire':'🛍️ NLE Best Deal'}</span></div>${ims.map((u,i)=>`<img alt="${esc(p.name)}${i?' - photo '+(i+1):''}" loading="lazy" src="${esc(u)}">`).join('')}</div><div class="product-body"><span class="tag">${esc(badge)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description||'Découvrez ce produit chez NLE Best Deal.')}</p><div class="product-row"><span class="product-price">${esc(p.price)}</span><a class="buy" target="_blank" rel="noopener noreferrer" href="https://wa.me/50942113669?text=${message}">Commander</a></div><div class="availability">✓ Disponible</div></div></article>`;
    }
    async function sync(){
      try{
        const {data,error}=await sb.from('products').select('id,name,price,category,description,badge,source,available,images,sort_order,created_at').eq('available',true).order('sort_order',{ascending:false}).order('created_at',{ascending:false});
        if(error||!Array.isArray(data)) return;
        const existing=new Set([...grid.querySelectorAll('.product')].map(x=>String(x.dataset.name||'').trim().toLowerCase()));
        const fresh=data.filter(p=>p&&p.name&&!existing.has(String(p.name).trim().toLowerCase()));
        if(fresh.length) grid.insertAdjacentHTML('beforeend',fresh.map(card).join(''));
      }catch(e){}
    }
    const observer=new MutationObserver(()=>{
      const cards=[...grid.querySelectorAll('.product')];
      const dbCards=cards.filter(c=>c.dataset.dbProduct==='true');
      if(dbCards.length && grid.children.length===dbCards.length && staticHTML){
        const dbHTML=dbCards.map(c=>c.outerHTML).join('');
        grid.innerHTML=staticHTML+dbHTML;
      }
    });
    observer.observe(grid,{childList:true});
    sync();
    setInterval(sync,30000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
