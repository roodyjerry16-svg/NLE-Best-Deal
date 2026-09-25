/* NLE Best Deal - public site settings */
(function(){
  var c=window.NLE_SUPABASE_CONFIG||{};
  if(!window.supabase)return;
  var s=window.supabase.createClient(c.url||'https://bfgelskeixdtneghuxcd.supabase.co',c.key||'sb_publishable_FW5FGNFjIlRSSbtcCp3JSA_GybtgjoO');
  function t(q,v){var e=document.querySelector(q);if(e&&v)e.textContent=v}
  function n(v){return String(v||'').replace(/[^0-9]/g,'')}
  async function load(){
    try{
      var r=await s.from('site_settings').select('key,value');
      if(r.error||!r.data)return;
      var x={};r.data.forEach(function(a){x[a.key]=a.value});
      t('.hero h1',x.hero_title);t('.hero p',x.hero_subtitle);
      t('#rewards .section-head h2',x.rewards_title);t('#rewards .section-head p',x.rewards_description);
      t('#livraison .section-head p',x.delivery_text);
      t('#contact .cta h2',x.contact_title);t('#contact .cta>div>p',x.contact_text);
      t('.about-name',x.pdg_name);
      if(x.pdg_email)document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){a.href='mailto:'+x.pdg_email;a.textContent=x.pdg_email});
      if(x.whatsapp_number)document.querySelectorAll('a[href*="wa.me/"]').forEach(function(a){a.href=a.href.replace(/wa\.me\/\d+/,'wa.me/'+n(x.whatsapp_number))});
      if(x.instagram_main)document.querySelectorAll('a[href*="instagram.com/nle_best_deal"]').forEach(function(a){a.href=x.instagram_main});
      if(x.instagram_owner)document.querySelectorAll('a[href*="instagram.com/jerry__nle"]').forEach(function(a){a.href=x.instagram_owner});
      if(x.tiktok)document.querySelectorAll('a[href*="tiktok.com/@jerry_nle"]').forEach(function(a){a.href=x.tiktok});
    }catch(e){}
  }
  load();setInterval(load,30000);
})();