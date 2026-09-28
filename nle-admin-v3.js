/* NLE Best Deal — Admin V3: éditeur complet + Rewards */
(function(){
  if(!/admin\.html$/i.test(location.pathname)||!window.supabase)return;
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
      p.innerHTML='<h2>🛠️ Éditeur complet du site — V3</h2><p class="muted">Cette section permet de modifier les réglages enregistrés du site. Les produits se modifient dans « Produits publiés ».</p><div class="status" id="nleConnectionState">⏳ Vérification de la connexion…</div><div class="actions"><button class="secondary" id="nleForceCheck">🔄 Vérifier la connexion</button><button class="secondary" id="nleHardReload">♻️ Recharger Admin</button></div><div id="nleV3Status" class="status hidden"></div><div id="nleV3Fields"></div><div class="actions"><button class="primary" id="nleV3Save">💾 Enregistrer tout le site</button><button class="secondary" id="nleV3Reload">↻ Recharger</button></div>';
      d.insertBefore(p,d.firstChild); loadSettings();checkConnection();
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
  async function checkConnection(){
    var e=document.getElementById('nleConnectionState');if(!e)return;
    try{
      var a=await sb.auth.getSession();
      if(a.error){e.className='status err';e.textContent='❌ Supabase : '+a.error.message;return}
      if(!a.data||!a.data.session){e.className='status err';e.textContent='⚠️ Admin non connecté à Supabase.';return}
      var u=a.data.session.user;
      var p=await sb.from('products').select('id',{count:'exact',head:true});
      var r=await sb.from('nle_reward_verifications').select('id',{count:'exact',head:true});
      var parts=['✅ Session Admin active'];
      parts.push(p.error?'❌ Produits : '+p.error.message:'✅ Produits : '+(p.count==null?'accès OK':p.count+' ligne(s)'));
      parts.push(r.error?'❌ Rewards : '+r.error.message:'✅ Rewards : '+(r.count==null?'accès OK':r.count+' demande(s)'));
      e.innerHTML=parts.map(function(x){return esc(x)}).join('<br>');
      e.className='status '+(parts.some(function(x){return x.indexOf('❌')===0})?'err':'ok');
    }catch(err){e.className='status err';e.textContent='❌ Connexion : '+(err&&err.message?err.message:String(err))}
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
    document.getElementById('nleV3Reload').onclick=loadSettings;document.getElementById('nleForceCheck').onclick=checkConnection;document.getElementById('nleHardReload').onclick=function(){location.href=location.href.split('#')[0]+'?admin_refresh='+Date.now()};
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
    var r=await sb.from('nle_reward_verifications').select('*').order('created_at',{ascending:false});
    if(r.error){box.innerHTML='<div class="status err">❌ Rewards inaccessible : '+esc(r.error.message)+'<br><small>Vérifie les droits SELECT/UPDATE de ton compte authentifié dans Supabase.</small></div>';return}
    var rows=r.data||[],pending=rows.filter(function(v){return v.status==='pending'});
    var html='<div class="rewardSummary"><b>'+pending.length+'</b> en attente · <b>'+rows.filter(function(v){return v.status==='approved'}).length+'</b> validées · <b>'+rows.filter(function(v){return v.status==='rejected'}).length+'</b> refusées</div>';
    if(!rows.length){box.innerHTML=html+'<div class="empty">Aucune demande Rewards enregistrée.</div>';return}
    html+=rows.map(function(v){
      var pendingNow=v.status==='pending';
      return '<div class="nleV3Reward" data-id="'+esc(v.id)+'"><b>'+esc(v.platform)+' — @'+esc(v.username)+'</b><small>Code : '+esc(v.referral_code)+' · '+Number(v.points||3)+' ⭐ · statut : <strong>'+esc(v.status)+'</strong></small>'+
      (v.proof_note?'<div class="notice">Note : '+esc(v.proof_note)+'</div>':'')+
      (pendingNow?'<div class="actions"><button class="primary" data-review="ok">✅ Accepter + créditer</button><button class="danger" data-review="no">❌ Refuser</button></div>':'')+
      '</div>';
    }).join('');
    box.innerHTML=html;
    box.querySelectorAll('[data-review]').forEach(function(b){b.onclick=function(){review(this.closest('.nleV3Reward').getAttribute('data-id'),this.getAttribute('data-review')==='ok')}})
  }
  async function review(id,ok){
    var u=await sb.auth.getUser();if(u.error||!u.data.user){alert('Session Admin expirée.');return}
    var q=await sb.from('nle_reward_verifications').select('*').eq('id',id).maybeSingle();
    if(q.error){alert('Lecture Rewards refusée : '+q.error.message);return}
    if(!q.data){alert('Demande introuvable.');return}
    var v=q.data;
    if(v.status!=='pending'){alert('Cette demande a déjà été traitée.');return}
    if(ok){
      var p=await sb.from('nle_reward_profiles').select('id,points').eq('referral_code',v.referral_code).maybeSingle();
      if(p.error){alert('Profil Rewards inaccessible : '+p.error.message);return}
      if(!p.data){alert('Profil Rewards introuvable pour le code '+v.referral_code+'.');return}
      var newPoints=Number(p.data.points||0)+Number(v.points||3);
      var up=await sb.from('nle_reward_profiles').update({points:newPoints,updated_at:new Date().toISOString()}).eq('id',p.data.id).select('id,points').maybeSingle();
      if(up.error){alert('Crédit des points refusé : '+up.error.message);return}
      if(!up.data){alert('Crédit non confirmé : droits UPDATE manquants sur nle_reward_profiles.');return}
    }
    var z=await sb.from('nle_reward_verifications').update({status:ok?'approved':'rejected',reviewed_at:new Date().toISOString(),reviewed_by:u.data.user.id}).eq('id',id).select('id,status').maybeSingle();
    if(z.error){alert('Validation refusée : '+z.error.message);return}
    if(!z.data){alert('Validation non confirmée : droits UPDATE manquants sur nle_reward_verifications.');return}
    var ev=await sb.from('nle_reward_events').update({status:ok?'approved':'rejected',points_awarded:ok?Number(v.points||3):0,reviewed_at:new Date().toISOString(),reviewed_by:u.data.user.id}).eq('referral_code',v.referral_code).eq('platform',v.platform).eq('status','pending');
    if(ev.error){alert('Demande validée, mais journal Rewards non mis à jour : '+ev.error.message);return}
    await loadRewards();
  }
  function diagnostics(){
    if(document.getElementById('nleDiagV3'))return;
    var d=document.getElementById('dashboard');if(!d||d.classList.contains('hidden'))return;
    var p=document.createElement('section');p.id='nleDiagV3';p.className='panel';
    p.innerHTML='<h2>🧪 Diagnostic Admin</h2><p class="muted">Teste la session et les tables sans modifier les données.</p><div class="actions"><button class="secondary" id="nleDiagRun">Tester maintenant</button></div><div id="nleDiagOut" class="status hidden"></div>';
    d.appendChild(p);
    document.getElementById('nleDiagRun').onclick=async function(){
      var out=document.getElementById('nleDiagOut');out.className='status';out.textContent='Test en cours…';
      var lines=[];
      try{
        var a=await sb.auth.getUser();
        lines.push(a.error?'❌ Auth : '+a.error.message:'✅ Auth : '+(a.data.user&&a.data.user.email?a.data.user.email:'session active'));
        for(var i=0;i<4;i++){
          var names=['products','site_settings','nle_reward_verifications','nle_reward_profiles'];
          var q=await sb.from(names[i]).select('*',{count:'exact',head:true});
          lines.push(q.error?'❌ '+names[i]+' : '+q.error.message:'✅ '+names[i]+' : accès OK ('+(q.count==null?'?':q.count)+' ligne(s))');
        }
      }catch(e){lines.push('❌ Diagnostic : '+(e&&e.message?e.message:String(e)))}
      out.innerHTML=lines.map(function(x){return esc(x)}).join('<br>');out.className='status '+(lines.some(function(x){return x.indexOf('❌')===0})?'err':'ok');
    };
  }
  var style=document.createElement('style');style.textContent='#nleAdminV3{border-color:#ffd84d}.nleV3Reward{padding:14px;margin-top:9px;border:1px solid #2d3958;border-radius:14px;background:#0b1221}.rewardSummary{padding:12px;border:1px solid #2d3958;border-radius:12px;background:#0b1221}.nleV3Reward small{display:block;color:#9ba8c4;margin:5px 0}.nleV3Reward .actions{position:static;background:none;padding:0}.nleV3Reward button{min-height:44px}.nleV3Reward .danger{background:rgba(255,97,120,.15);color:#ff9bac;border:1px solid rgba(255,97,120,.4)}';document.head.appendChild(style);
  function mount(){add();diagnostics();checkConnection()}
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  setInterval(mount,1200);setTimeout(mount,200);
})();