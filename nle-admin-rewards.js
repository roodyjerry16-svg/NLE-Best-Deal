(function(){
if(!/admin\.html$/i.test(location.pathname)||!window.supabase)return;
var c=window.NLE_SUPABASE_CONFIG||{},s=window.supabase.createClient(c.url,c.key),timer;
function esc(v){return String(v||'').replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
function add(){
 if(document.getElementById('nleExtra'))return;
 var d=document.getElementById('dashboard');if(!d||d.classList.contains('hidden'))return;
 var w=document.createElement('section');w.id='nleExtra';w.className='panel';w.innerHTML='<h2>🎁 NLE Rewards — vérifications</h2><p class="muted">Les demandes sociales restent en attente. Après ta vérification, tu peux valider ou refuser chaque mission.</p><div id="nleVerifyList" class="nleVerifyList">Chargement...</div>';
 d.appendChild(w);load();
}
async function load(){
 var box=document.getElementById('nleVerifyList');if(!box)return;
 var r=await s.from('nle_reward_verifications').select('*').eq('status','pending').order('created_at',{ascending:true});
 if(r.error){box.textContent='Erreur Rewards : '+r.error.message;return}
 if(!r.data||!r.data.length){box.textContent='Aucune demande en attente.';return}
 box.innerHTML='';
 r.data.forEach(function(v){
  var e=document.createElement('div');e.className='nleVerifyItem';
  e.innerHTML='<b>'+esc(v.platform)+' — @'+esc(v.username)+'</b><small>Code: '+esc(v.referral_code)+' · +'+Number(v.points||3)+' ⭐</small><div><button class="nleApprove">✅ Valider</button><button class="nleReject">❌ Refuser</button></div>';
  e.querySelector('.nleApprove').onclick=function(){review(v,true)};
  e.querySelector('.nleReject').onclick=function(){review(v,false)};
  box.appendChild(e);
 });
}
async function review(v,ok){
 var auth=await s.auth.getUser();if(!auth.data.user){alert('Session admin expirée.');return}
 if(ok){
  var p=await s.from('nle_reward_profiles').select('points').eq('referral_code',v.referral_code).maybeSingle();
  if(p.error||!p.data){alert('Profil Rewards introuvable.');return}
  var u=await s.from('nle_reward_profiles').update({points:Number(p.data.points||0)+Number(v.points||3),updated_at:new Date().toISOString()}).eq('referral_code',v.referral_code);
  if(u.error){alert(u.error.message);return}
 }
 await s.from('nle_reward_verifications').update({status:ok?'approved':'rejected',reviewed_at:new Date().toISOString(),reviewed_by:auth.data.user.id}).eq('id',v.id);
 await load();
}
var st=document.createElement('style');st.textContent='.nleVerifyList{display:grid;gap:9px}.nleVerifyItem{padding:12px;border:1px solid #2d3958;border-radius:14px;background:#0b1221}.nleVerifyItem small{display:block;color:#9ba8c4;margin:5px 0}.nleVerifyItem button{border:0;border-radius:10px;padding:10px 12px;font-weight:800;margin-right:7px}.nleApprove{background:#25d366}.nleReject{background:#3a1d28;color:#ffb4bf}';document.head.appendChild(st);
new MutationObserver(add).observe(document.body,{childList:true,subtree:true});setTimeout(add,1000);timer=setInterval(load,20000);
})();