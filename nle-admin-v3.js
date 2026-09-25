/* NLE Best Deal — Admin V3: éditeur complet + Rewards */
(function(){
  if(!/admin\\.html$/i.test(location.pathname)||!window.supabase)return;
  var cfg=window.NLE_SUPABASE_CONFIG||{}, sb=window.supabase.createClient(cfg.url,cfg.key);
  var labels={
    hero_title:'Accueil — titre principal',hero_subtitle:'Accueil — sous-titre',
    delivery_text:'Livraison — texte',contact_title:'Contact — titre',contact_text:'Contact — texte',
    rewards_title:'Rewards — titre',rewards_description:'Rewards — description',
    pdg_name:'À propos — nom PDG',pdg_email:'À propos — email',
    whatsapp_number:'WhatsApp / NatCash',instagram_main:'Instagram NLE',
    instagram_owner:'Instagram PDG',tiktok:'TikTok',
    slogan:'Slogan',payment_text:'Paiement / NatCash',
    trust_title:'Confiance — titre',trust_text:'Confiance — texte',
    supplier_title:'Fournisseur — titre',supplier_text:'Fournisseur — texte',
    supplier_commission:'Fournisseur — commission'
  };
  function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
  function add(){
    var d=document.getElementById('dashboard'); if(!d||d.classList.contains('hidden'))return;
    if(!document.getElementById('nleAdminV3')){
      var p=document.createElement('section');p.id='nleAdminV3';p.className='panel';
      p.innerHTML='<h2>🛠️ Éditeur complet du site — V3</h2><p class="muted">Cette section permet de modifier les réglages enregistrés du site. Les produits se modifient dans « Produits publiés ».</p><div id="nleV3Status" class="status hidden"></div><div id="nleV3Fields"></div><div class="actions"><button class="primary" id="nleV3Save">💾 Enregistrer tout le site</button><button class="secondary" id="nleV3Reload">↻ Recharger</button></div>';
      d.insertBefore(p,d.firstChild); loadSettings();
    }
    if(!document.getElementById('nleRewardsV3')){
      var w=document.createElement('section');w.id='nleRewardsV3';w.className='panel';
      w.innerHTML='<h2>🎁 NLE Rewards — vérifications</h2><p class="muted">Valide ou refuse les demandes de suivi Instagram/TikTok. Les points ne sont ajoutés qu’après validation.</p><div id="nleRewardsV3Status" class="status hidden"></div><div id="nleRewardsV3List">Chargement...</div>';
      d.appendChild(w); loadRewards();
    }
  }
  function status(id,msg,ok){
    var e=document.getElementById(id);if(!e)return;e.textContent=msg;e.className='status '+(ok?'ok':'err');e.classList.remove('hidden');
  }
  async function loadSettings(){
    var box=document.getElementById('nleV3Fields');if(!box)return;
    var r=await sb.from('site_settings').select('key,value').order('key');
    if(r.error){status('nleV3Status','❌ site_settings : '+r.error.message);return}
    var rows=r.data||[], known={};rows.forEach(function(x){known[x.key]=x.value});
    var keys=Object.keys(labels);
    rows.forEach(function(x){if(keys.indexOf(x.key)<0)keys.push(x.key)});
    box.innerHTML=keys.map(function(k){
      var long=String(known[k]||'').length>90 || /text|description|subtitle|title/i.test(k);
      return '<div class="field"><label>'+esc(labels[k]||('Réglage : '+k))+'</label>'+
        (long?'<textarea data-v3-key="'+esc(k)+'">'+esc(known[k]||'')+'</textarea>':'<input data-v3-key="'+esc(k)+'" value="'+esc(known[k]||'')+'">')+
        '<div class="notice">clé : '+esc(k)+'</div></div>';
    }).join('');
    document.getElementById('nleV3Save').onclick=saveSettings;
    document.getElementById('nleV3Reload').onclick=loadSettings;
  }
  async function saveSettings(){
    var els=[].slice.call(document.querySelectorAll('#nleV3Fields [data-v3-key]'));
    var rows=els.map(function(e){return {key:e.getAttribute('data-v3-key'),value:e.value,updated_at:new Date().toISOString()}});
    var r=await sb.from('site_settings').upsert(rows,{onConflict:'key'});
    if(r.error){status('nleV3Status','❌ Enregistrement : '+r.error.message,false);return}
    status('nleV3Status','✅ Tous les réglages ont été enregistrés.',true);
  }
  async function loadRewards(){
    var box=document.getElementById('nleRewardsV3List');if(!box)return;
    var r=await sb.from('nle_reward_verifications').select('*').eq('status','pending').order('created_at',{ascending:true});
    if(r.error){box.innerHTML='<div class="status err">❌ Rewards non installé ou inaccessible dans Supabase : '+esc(r.error.message)+'</div>';return}
    if(!r.data||!r.data.length){box.innerHTML='<div class="empty">✅ Aucune demande Rewards en attente.</div>';return}
    box.innerHTML=r.data.map(function(v){
      return '<div class="nleV3Reward" data-id="'+esc(v.id)+'"><b>'+esc(v.platform)+' — @'+esc(v.username)+'</b><small>Code : '+esc(v.referral_code)+' · +'+Number(v.points||3)+' ⭐</small><div class="actions"><button class="primary" data-review="ok">✅ Valider</button><button class="danger" data-review="no">❌ Refuser</button></div></div>';
    }).join('');
    box.querySelectorAll('[data-review]').forEach(function(b){b.onclick=function(){review(this.closest('.nleV3Reward').getAttribute('data-id'),this.getAttribute('data-review')==='ok')}})
  }
  async function review(id,ok){
    var u=await sb.auth.getUser();if(!u.data.user){alert('Session Admin expirée.');return}
    var q=await sb.from('nle_reward_verifications').select('*').eq('id',id).maybeSingle();
    if(q.error||!q.data){alert('Demande introuvable.');return}
    var v=q.data;
    if(ok){
      var p=await sb.from('nle_reward_profiles').select('points').eq('referral_code',v.referral_code).maybeSingle();
      if(p.error||!p.data){alert('Profil Rewards introuvable.');return}
      var up=await sb.from('nle_reward_profiles').update({points:Number(p.data.points||0)+Number(v.points||3),updated_at:new Date().toISOString()}).eq('referral_code',v.referral_code);
      if(up.error){alert(up.error.message);return}
    }
    var z=await sb.from('nle_reward_verifications').update({status:ok?'approved':'rejected',reviewed_at:new Date().toISOString(),reviewed_by:u.data.user.id}).eq('id',id);
    if(z.error){alert(z.error.message);return}
    await sb.from('nle_reward_events').update({status:ok?'approved':'rejected',points_awarded:ok?Number(v.points||3):0,reviewed_at:new Date().toISOString(),reviewed_by:u.data.user.id}).eq('referral_code',v.referral_code).eq('session_id',v.session_id).eq('platform',v.platform).eq('status','pending');
    loadRewards();
  }
  var style=document.createElement('style');style.textContent='#nleAdminV3{border-color:#ffd84d}.nleV3Reward{padding:14px;margin-top:9px;border:1px solid #2d3958;border-radius:14px;background:#0b1221}.nleV3Reward small{display:block;color:#9ba8c4;margin:5px 0}.nleV3Reward .actions{position:static;background:none;padding:0}.nleV3Reward button{min-height:44px}.nleV3Reward .danger{background:rgba(255,97,120,.15);color:#ff9bac;border:1px solid rgba(255,97,120,.4)}';document.head.appendChild(style);
  new MutationObserver(add).observe(document.body,{childList:true,subtree:true});setTimeout(add,700);
})();