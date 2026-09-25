(function(){
if(!/admin\.html$/i.test(location.pathname)||!window.supabase)return;
var c=window.NLE_SUPABASE_CONFIG||{},s=window.supabase.createClient(c.url,c.key);
var fields=[['hero_title','Titre principal'],['hero_subtitle','Sous-titre'],['delivery_text','Livraison'],['contact_title','Titre contact'],['contact_text','Texte contact'],['rewards_title','Titre Rewards'],['rewards_description','Description Rewards'],['pdg_name','Nom PDG'],['pdg_email','Email'],['whatsapp_number','WhatsApp / NatCash'],['instagram_main','Instagram NLE'],['instagram_owner','Instagram PDG'],['tiktok','TikTok']];
function add(){
 if(document.getElementById('nleContentPanel'))return;
 var d=document.getElementById('dashboard');if(!d||d.classList.contains('hidden'))return;
 var p=document.createElement('section');p.id='nleContentPanel';p.className='panel';
 p.innerHTML='<h2>⚙️ Contenu du site</h2><p class="muted">Modifie les textes et contacts depuis ton iPhone. Les produits restent dans la section Produits.</p><form id="nleContentForm"><div id="nleContentFields"></div><button class="primary" type="submit">💾 Enregistrer</button><div id="nleContentStatus" class="status hidden"></div></form>';
 d.appendChild(p);load();
}
async function load(){
 var box=document.getElementById('nleContentFields');if(!box)return;
 var r=await s.from('site_settings').select('key,value');if(r.error){box.textContent='Erreur : '+r.error.message;return}
 var m={};(r.data||[]).forEach(function(x){m[x.key]=x.value});
 box.innerHTML=fields.map(function(x){return '<div class="field"><label>'+x[1]+'</label><input data-key="'+x[0]+'" value="'+String(m[x[0]]||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"></div>'}).join('');
 document.getElementById('nleContentForm').onsubmit=async function(e){
  e.preventDefault();
  var rows=[].slice.call(box.querySelectorAll('[data-key]')).map(function(x){return {key:x.dataset.key,value:x.value,updated_at:new Date().toISOString()}});
  var z=await s.from('site_settings').upsert(rows,{onConflict:'key'});
  var st=document.getElementById('nleContentStatus');st.textContent=z.error?'Erreur : '+z.error.message:'✅ Contenu enregistré.';st.className='status '+(z.error?'err':'ok');st.classList.remove('hidden');
 };
}
new MutationObserver(add).observe(document.body,{childList:true,subtree:true});setTimeout(add,1200);
})();