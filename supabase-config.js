// NLE Best Deal — configuration Supabase publique
// Cette clé est une clé publishable destinée au navigateur. Ne jamais mettre ici une service_role key.
window.NLE_SUPABASE_CONFIG = {
  url: 'https://bfgelskeixdtneghuxcd.supabase.co',
  key: 'sb_publishable_FW5FGNFjIlRSSbtcCp3JSA_GybtgjoO'
};

(function(){
  function load(src){var s=document.createElement('script');s.src=src;s.defer=true;document.head.appendChild(s)}
  var p=location.pathname||'';
  if(/admin\.html$/i.test(p){load('nle-admin-rewards.js');load('nle-admin-content.js')}
  else{load('nle-site-settings.js');load('nle-rewards-verification.js');load('nle-pdg-gallery.js')}
})();
