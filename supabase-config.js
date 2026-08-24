// NLE Best Deal — configuration Supabase publique
// Cette clé est une clé publishable destinée au navigateur. Ne jamais mettre ici une service_role key.
window.NLE_SUPABASE_CONFIG = {
  url: 'https://bfgelskeixdtneghuxcd.supabase.co',
  key: 'sb_publishable_FW5FGNFjIlRSSbtcCp3JSA_GybtgjoO'
};

// Correctif de connexion Admin : garde l'interface existante et intercepte le bouton
// afin d'afficher une erreur claire au lieu de rester silencieux.
(function(){
  function install(){
    const btn=document.getElementById('login');
    const email=document.getElementById('email');
    const password=document.getElementById('password');
    const status=document.getElementById('loginStatus');
    if(!btn||!email||!password||!status||!window.supabase)return false;
    const show=(msg,ok)=>{status.textContent=msg;status.className='status '+(ok?'ok':'err');status.classList.remove('hidden')};
    if(btn.dataset.nleFix==='1')return true;
    btn.dataset.nleFix='1';
    btn.addEventListener('click',async function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      const em=email.value.trim(), pw=password.value;
      if(!em||!pw){show('Entre ton email et ton mot de passe.',false);return}
      btn.disabled=true; btn.textContent='Connexion…';
      try{
        const client=window.supabase.createClient(window.NLE_SUPABASE_CONFIG.url,window.NLE_SUPABASE_CONFIG.key);
        const {data,error}=await client.auth.signInWithPassword({email:em,password:pw});
        if(error) throw error;
        if(!data||!data.session) throw new Error('Supabase n’a pas créé de session. Vérifie le compte dans Authentication → Users.');
        show('Connexion réussie. Chargement…',true);
        document.getElementById('loginPanel')?.classList.add('hidden');
        document.getElementById('dashboard')?.classList.remove('hidden');
        document.getElementById('logout')?.classList.remove('hidden');
        setTimeout(()=>location.reload(),300);
      }catch(err){show('Erreur de connexion : '+(err&&err.message?err.message:String(err)),false)}
      finally{btn.disabled=false;btn.textContent='Se connecter'}
    },true);
    return true;
  }
  if(!install()) document.addEventListener('DOMContentLoaded',install,{once:true});
  const t=setInterval(()=>{if(install())clearInterval(t)},100);
  setTimeout(()=>clearInterval(t),10000);
})();
