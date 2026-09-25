/* NLE Best Deal — Rewards verification v2
   Important: Instagram/TikTok subscription/follow status is NOT reliably verifiable
   from a normal browser page. We therefore never award points immediately.
   The visitor submits the task; an authenticated NLE admin validates it and then
   the points are credited. */
(function(){
  const cfg=window.NLE_SUPABASE_CONFIG||{};
  if(!window.supabase) return;
  const sb=window.supabase.createClient(cfg.url||'https://bfgelskeixdtneghuxcd.supabase.co',cfg.key||'sb_publishable_FW5FGNFjIlRSSbtcCp3JSA_GybtgjoO');
  const KEY='nle_rewards_v2';
  let state={}; try{state=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  state.code=state.code||('NLE'+Math.random().toString(36).slice(2,8).toUpperCase());
  state.session=state.session||('s_'+Math.random().toString(36).slice(2));
  state.points=Number(state.points||0);
  state.pending=Array.isArray(state.pending)?state.pending:[];
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const $=id=>document.getElementById(id);
  function syncPoints(){
    const old=Number(localStorage.getItem('nle_rewards_v1_points')||0);
    if(old>state.points) state.points=old;
    const el=$('nleRewardPoints'); if(el) el.textContent=state.points;
  }
  async function refreshApproved(){
    try{
      const {data}=await sb.from('nle_reward_events').select('points_awarded,status,task,platform,created_at').eq('referral_code',state.code).eq('session_id',state.session).eq('status','approved');
      if(Array.isArray(data)){
        const total=data.reduce((n,x)=>n+Number(x.points_awarded||0),0);
        state.points=Math.max(state.points,total);
        syncPoints(); save();
      }
    }catch(e){}
  }
  function addBox(btn,platform){
    if(btn.dataset.verifyReady) return;
    btn.dataset.verifyReady='1';
    const box=document.createElement('div');
    box.className='nle-verify-box';
    box.innerHTML='<label>Ton nom d’utilisateur '+(platform==='instagram'?'Instagram':'TikTok')+'<input type="text" class="nle-verify-user" placeholder="@ton_compte" autocomplete="off"></label><label class="nle-verify-check"><input type="checkbox" class="nle-verify-confirm"> J’ai réellement suivi la page officielle.</label><button type="button" class="btn btn-primary nle-verify-submit">✅ Envoyer pour vérification (+3 ⭐)</button><div class="nle-verify-msg" aria-live="polite"></div>';
    btn.parentNode.insertBefore(box,btn.nextSibling);
    const msg=box.querySelector('.nle-verify-msg');
    box.querySelector('.nle-verify-submit').addEventListener('click',async()=>{
      const username=box.querySelector('.nle-verify-user').value.trim().replace(/^@/,'');
      const checked=box.querySelector('.nle-verify-confirm').checked;
      if(!username||!checked){msg.textContent='⚠️ Indique ton compte et confirme que tu suis réellement la page.';msg.className='nle-verify-msg show err';return}
      const task=btn.dataset.task||platform+'_nle';
      if(state.pending.includes(task)){msg.textContent='⏳ Cette mission est déjà en attente de vérification.';msg.className='nle-verify-msg show';return}
      const {error}=await sb.from('nle_reward_verifications').insert({
        referral_code:state.code,session_id:state.session,platform,username,points:3,status:'pending'
      });
      if(error){msg.textContent='❌ Impossible d’envoyer la demande. Réessaie après avoir installé le système Rewards dans Supabase.';msg.className='nle-verify-msg show err';return}
      state.pending.push(task);save();
      msg.textContent='⏳ Demande envoyée. Les +3 ⭐ apparaîtront uniquement après vérification par NLE Best Deal.';
      msg.className='nle-verify-msg show';
      box.querySelector('.nle-verify-submit').disabled=true;
      btn.disabled=true;
      try{await sb.from('nle_reward_events').insert({event_type:'social_claim',referral_code:state.code,session_id:state.session,task,platform,username,points_requested:3,points_awarded:0,status:'pending'});}catch(e){}
    });
  }
  document.querySelectorAll('.nle-social-task').forEach(btn=>{
    const platform=btn.dataset.platform||'';
    const url=platform==='instagram'?'https://www.instagram.com/nle_best_deal/':'https://www.tiktok.com/@jerry_nle';
    btn.onclick=(e)=>{e.preventDefault();window.open(url,'_blank','noopener,noreferrer');addBox(btn,platform);};
    addBox(btn,platform);
  });
  const style=document.createElement('style');
  style.textContent='.nle-verify-box{margin-top:10px;padding:12px;border:1px solid #33405f;border-radius:14px;background:rgba(255,255,255,.025)}.nle-verify-box label{display:block;font-size:.82rem;font-weight:800;margin-bottom:8px}.nle-verify-user{width:100%;margin-top:5px;padding:10px;border:1px solid #33405f;border-radius:10px;background:#0b1020;color:#fff}.nle-verify-check{display:flex!important;gap:8px;align-items:flex-start}.nle-verify-check input{width:auto!important;min-height:auto!important}.nle-verify-submit{width:100%;margin-top:4px}.nle-verify-msg{display:none;margin-top:8px;padding:8px;border-radius:9px;font-size:.82rem;color:#c9d5ee}.nle-verify-msg.show{display:block;background:#0b1221}.nle-verify-msg.err{color:#ffacb8}';
  document.head.appendChild(style);
  syncPoints(); refreshApproved(); setInterval(refreshApproved,15000);
})();
