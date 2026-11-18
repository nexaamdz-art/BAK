(()=>{
const S={
  get(k,d){try{return localStorage.getItem(k)??d}catch(_e){return d}},
  set(k,v){try{localStorage.setItem(k,v)}catch(_e){}},
  del(k){try{localStorage.removeItem(k)}catch(_e){}},
  json(k,d=null){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(_e){return d}}
};

const GROUPS=['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const WILAYAS=['Alger','Oran','Constantine','Blida','Annaba','Sétif','Tizi Ouzou','Béjaïa','Batna','Tlemcen'];
const AVATARS=['me','av1','av2','av3','av4','av5'];
const HOSPITALS=['Hôpital Central d\'Alger','CHU Mustapha Pacha','CHU Oran','CHU Constantine','CHU Blida'];

let lang=S.get('bak.lang','fr');
let light=S.get('bak.light','0')==='1';
let session=S.json('bak.session',null);
let currentUser=null;
let currentProfile=null;
let userStats={donations:0,lives_saved:0};
let donors=[];
let donorsLoaded=false;
let donationsList=[];
let notificationsList=[];
let userCoords=null;

let q='';
let grp='all';
let wFilter='all';
let showFilter=false;
let tab='hist';
let authTab='login';
let authErr='';
let authOk='';
let pendingRoute='';
let busy=false;

const I18={
  fr:{
    tag:'Donner • Sauver • Vivre',end:'Ensemble,<br>pour sauver des vies',
    h1:'Un geste.',h2:'Une vie.',h3:'Un avenir.',
    sub:'Donnez votre sang, offrez une seconde chance à ceux qui en ont besoin.',
    donate:'Donner du sang',find:'Trouver<br>un donneur',join:'Devenir<br>donneur',
    learn:'En savoir plus',search:'Rechercher',ph:'Rechercher un donneur...',all:'Tous',
    prof:'Mon profil',eng:'Donneur engagé',notDonor:'Membre BAK',
    blood:'Groupe sanguin',wil:'Wilaya',birth:'Date de naissance',phone:'Téléphone',
    stats:'Mes statistiques',dons:'Dons',lives:'Vies sauvées',edit:'Modifier mon profil',
    set:'Paramètres',lang:'Langue',dark:'Mode sombre',notif:'Notifications',
    help:'Aide et support',about:'À propos de BAK',logout:'Se déconnecter',loginBtn:'Se connecter',
    home:'Accueil',mine:'Mes dons',hist:'Historique',next:'Prochain don',
    findT:'Trouver un donneur',contact:'Contacter',requestBtn:'Demander',
    thx:'Merci !',thxT:'Votre don de sang<br>fait une réelle différence.',
    tog:'Ensemble,<br>sauvons des vies.',back:'Retour à l\'accueil',
    soon:'Bientôt disponible',none:'Aucun don planifié pour le moment.',noHist:'Aucun don enregistré pour le moment.',
    city:'Alger',
    loginTab:'Connexion',signupTab:'Créer un compte',email:'Adresse e-mail',password:'Mot de passe',
    fullName:'Nom complet',isDonorLbl:'Disponible comme donneur',
    submitLogin:'Se connecter',submitSignup:'Créer mon compte',
    browseGuest:'Continuer sans compte',
    needAuth:'Connectez-vous pour accéder à votre compte',
    checkEmail:'Compte créé ! Vérifiez votre e-mail pour confirmer votre inscription.',
    save:'Enregistrer',saving:'Enregistrement...',saved:'Modifications enregistrées',
    chooseAv:'Choisir un avatar',
    donateTitle:'Enregistrer un don',donateNow:'Don effectué aujourd\'hui',donateSched:'Planifier un prochain don',
    hospital:'Centre / Hôpital',dateLbl:'Date du don',notesLbl:'Remarques (optionnel)',
    submitDonate:'Confirmer le don',submitSched:'Planifier le don',
    markDone:'Marquer effectué',cancelBtn:'Annuler',
    reqTitle:'Demande de sang',reqSub:'Envoyer une alerte directe à ce donneur',
    reqMsg:'Message / Urgence',sendReq:'Envoyer la demande',reqSent:'Demande envoyée au donneur !',
    notifTitle:'Notifications',noNotif:'Aucune notification pour le moment.',
    incoming:'Demande reçue',outgoing:'Demande envoyée',markRead:'Lu',
    learnTitle:'Guide du don de sang',helpTitle:'Aide & Support',aboutTitle:'À propos de BAK',
    noDonors:'Aucun donneur enregistré pour ce filtre.',
    srvMissing:'Le serveur Supabase n\'est pas encore configuré (SUPABASE_URL / SUPABASE_ANON_KEY).',
    donsUnit:'dons',livesUnit:'vies sauvées',
    allWilayas:'Toutes les wilayas',
    viewDonations:'Voir mes dons'
  },
  en:{
    tag:'Give • Save • Live',end:'Together,<br>to save lives',
    h1:'One gesture.',h2:'One life.',h3:'One future.',
    sub:'Give your blood, offer a second chance to those who need it.',
    donate:'Donate blood',find:'Find<br>a donor',join:'Become<br>a donor',
    learn:'Learn more',search:'Search',ph:'Search for a donor...',all:'All',
    prof:'My profile',eng:'Committed donor',notDonor:'BAK Member',
    blood:'Blood group',wil:'Province',birth:'Date of birth',phone:'Phone',
    stats:'My statistics',dons:'Donations',lives:'Lives saved',edit:'Edit my profile',
    set:'Settings',lang:'Language',dark:'Dark mode',notif:'Notifications',
    help:'Help & support',about:'About BAK',logout:'Log out',loginBtn:'Sign in',
    home:'Home',mine:'My donations',hist:'History',next:'Next donation',
    findT:'Find a donor',contact:'Contact',requestBtn:'Request',
    thx:'Thank you!',thxT:'Your blood donation<br>makes a real difference.',
    tog:'Together,<br>let\'s save lives.',back:'Back to home',
    soon:'Coming soon',none:'No donation scheduled yet.',noHist:'No donations recorded yet.',
    city:'Algiers',
    loginTab:'Sign in',signupTab:'Create account',email:'Email address',password:'Password',
    fullName:'Full name',isDonorLbl:'Available as a blood donor',
    submitLogin:'Sign in',submitSignup:'Create account',
    browseGuest:'Browse without an account',
    needAuth:'Sign in to access your account',
    checkEmail:'Account created! Please check your email to confirm.',
    save:'Save changes',saving:'Saving...',saved:'Profile updated',
    chooseAv:'Choose an avatar',
    donateTitle:'Record a donation',donateNow:'Completed today',donateSched:'Schedule upcoming donation',
    hospital:'Hospital / Center',dateLbl:'Donation date',notesLbl:'Notes (optional)',
    submitDonate:'Confirm donation',submitSched:'Schedule donation',
    markDone:'Mark completed',cancelBtn:'Cancel',
    reqTitle:'Blood request',reqSub:'Send a direct notification to this donor',
    reqMsg:'Message / Urgency',sendReq:'Send request',reqSent:'Request sent to donor!',
    notifTitle:'Notifications',noNotif:'No notifications yet.',
    incoming:'Incoming request',outgoing:'Sent request',markRead:'Mark read',
    learnTitle:'Blood donation guide',helpTitle:'Help & Support',aboutTitle:'About BAK',
    noDonors:'No donors found for this filter.',
    srvMissing:'Supabase is not configured on the server yet (SUPABASE_URL / SUPABASE_ANON_KEY).',
    donsUnit:'donations',livesUnit:'lives saved',
    allWilayas:'All provinces',
    viewDonations:'View my donations'
  },
  ar:{
    tag:'تبرّع • أنقذ • عِش',end:'معًا،<br>لإنقاذ الأرواح',
    h1:'لفتة واحدة.',h2:'حياة واحدة.',h3:'ومستقبل واحد.',
    sub:'تبرّع بدمك، وامنح فرصة ثانية لمن يحتاجها.',
    donate:'تبرّع بالدم',find:'ابحث عن<br>متبرّع',join:'كن<br>متبرّعًا',
    learn:'اعرف المزيد',search:'بحث',ph:'ابحث عن متبرّع...',all:'الكل',
    prof:'ملفي الشخصي',eng:'متبرّع ملتزم',notDonor:'عضو BAK',
    blood:'فصيلة الدم',wil:'الولاية',birth:'تاريخ الميلاد',phone:'رقم الهاتف',
    stats:'إحصائياتي',dons:'تبرعات',lives:'أرواح أُنقذت',edit:'تعديل ملفي',
    set:'الإعدادات',lang:'اللغة',dark:'الوضع الداكن',notif:'الإشعارات',
    help:'المساعدة والدعم',about:'حول BAK',logout:'تسجيل الخروج',loginBtn:'تسجيل الدخول',
    home:'الرئيسية',mine:'تبرعاتي',hist:'السجل',next:'التبرع القادم',
    findT:'ابحث عن متبرّع',contact:'اتصل',requestBtn:'طلب دم',
    thx:'شكرًا لك!',thxT:'تبرّعك بالدم<br>يصنع فرقًا حقيقيًا.',
    tog:'معًا،<br>ننقذ الأرواح.',back:'العودة للرئيسية',
    soon:'قريبًا',none:'لا يوجد تبرع مجدول حاليًا.',noHist:'لا توجد تبرعات مسجلة بعد.',
    city:'الجزائر',
    loginTab:'تسجيل الدخول',signupTab:'إنشاء حساب',email:'البريد الإلكتروني',password:'كلمة المرور',
    fullName:'الاسم الكامل',isDonorLbl:'متاح للتبرع بالدم',
    submitLogin:'دخول',submitSignup:'إنشاء الحساب',
    browseGuest:'تصفح بدون حساب',
    needAuth:'سجّل الدخول للوصول إلى حسابك',
    checkEmail:'تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني للتأكيد.',
    save:'حفظ التغييرات',saving:'جارٍ الحفظ...',saved:'تم حفظ التعديلات',
    chooseAv:'اختر صورة رمزية',
    donateTitle:'تسجيل تبرع',donateNow:'تبرع مكتمل اليوم',donateSched:'جدولة تبرع قادم',
    hospital:'المستشفى / المركز',dateLbl:'تاريخ التبرع',notesLbl:'ملاحظات (اختياري)',
    submitDonate:'تأكيد التبرع',submitSched:'جدولة التبرع',
    markDone:'تحديد كمكتمل',cancelBtn:'إلغاء',
    reqTitle:'طلب تبرع بالدم',reqSub:'أرسل إشعارًا مباشرًا لهذا المتبرّع',
    reqMsg:'رسالة / تفاصيل الحالة',sendReq:'إرسال الطلب',reqSent:'تم إرسال الطلب للمتبرّع!',
    notifTitle:'الإشعارات',noNotif:'لا توجد إشعارات حاليًا.',
    incoming:'طلب وارد',outgoing:'طلب مرسل',markRead:'تمت القراءة',
    learnTitle:'دليل التبرع بالدم',helpTitle:'المساعدة والدعم',aboutTitle:'حول BAK',
    noDonors:'لا يوجد متبرعون مطابقون للبحث.',
    srvMissing:'لم يتم ضبط مفاتيح Supabase على الخادم بعد (SUPABASE_URL / SUPABASE_ANON_KEY).',
    donsUnit:'تبرعات',livesUnit:'أرواح أُنقذت',
    allWilayas:'جميع الولايات',
    viewDonations:'عرض تبرعاتي'
  }
};

const t=k=>(I18[lang]&&I18[lang][k])||I18.fr[k]||k;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const P={
  home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  heart:'<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
  gear:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  chev:'<path d="M9 5l7 7-7 7"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  head:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  pen:'<path d="M4 20l1-4L17 4l3 3L8 19z"/>',
  cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>'
};
const DROP='<path d="M12 2.5c3.5 4.6 6 7.8 6 11a6 6 0 0 1-12 0c0-3.2 2.5-6.4 6-11z"/>';
const ic=(n,c='')=>n==='infof'?`<svg class="i ${c}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 11v5M12 8h.01" stroke="#f6dcd2" stroke-width="2.2"/></svg>`:n==='drop'?`<svg class="i f ${c}" viewBox="0 0 24 24">${DROP}</svg>`:n==='heartf'?`<svg class="i f ${c}" viewBox="0 0 24 24">${P.heart}</svg>`:`<svg class="i ${c}" viewBox="0 0 24 24">${P[n]}</svg>`;
const ecg=c=>`<svg class="ecg ${c||''}" viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M0 20H95l8-4 6 4h10l8-18 10 36 8-18h14l6-4 8 4H300" fill="none" stroke="#e0212e" stroke-width="1.6"/></svg>`;
const fd=s=>{try{return new Date(s).toLocaleDateString(lang==='ar'?'ar-DZ-u-nu-latn':lang,{day:'numeric',month:'long',year:'numeric'}).replace(/(^|\s)(\p{L})/gu,(m,a,c)=>a+c.toUpperCase())}catch(_e){return esc(s)}};
const cells=(a)=>a.map(([f,s])=>`<img class="cl" src="assets/${f}.png" alt="" style="${s}">`).join('');
const hd=(title,right='')=>`<div class="hd"><button data-back aria-label="back">${ic('back','bk')}</button><h1>${title}</h1>${right||'<span></span>'}</div>`;
const nav=(a)=>`<nav>${[['home','#/home','home',t('home')],['search','#/search','search',t('search')],['don','#/donations','heart',t('mine')],['set','#/settings',a==='prof'?'user':'gear',t('set')]].map(([k,h,i,l])=>`<button data-go="${h}" class="${(a===k||(a==='prof'&&k==='set'))?'on':''}">${ic(i)}<span>${l}</span></button>`).join('')}</nav>`;

const app=document.getElementById('app');

function toast(msg){
  const e=document.createElement('div');
  e.className='toast';
  e.textContent=msg||t('soon');
  app.appendChild(e);
  setTimeout(()=>e.remove(),2200);
}

/* ---------- Backend API Client ---------- */
function saveSession(s){
  session=s;
  if(s)S.set('bak.session',JSON.stringify(s));
  else S.del('bak.session');
}

async function api(url,opts={}){
  const headers={'Content-Type':'application/json',...(opts.headers||{})};
  if(session&&session.access_token&&!headers.Authorization){
    headers.Authorization='Bearer '+session.access_token;
  }
  let res=await fetch(url,{...opts,headers,credentials:'include'});
  if(res.status===401&&session&&session.refresh_token&&!url.startsWith('/api/auth/refresh')){
    const r=await fetch('/api/auth/refresh',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'include',
      body:JSON.stringify({refresh_token:session.refresh_token})
    });
    if(r.ok){
      const d=await r.json();
      if(d.session)saveSession(d.session);
      if(d.user)currentUser=d.user;
      if(d.profile)currentProfile=d.profile;
      headers.Authorization='Bearer '+d.session.access_token;
      res=await fetch(url,{...opts,headers,credentials:'include'});
    }else{
      saveSession(null);
      currentUser=null;
      currentProfile=null;
    }
  }
  const data=await res.json().catch(()=>({}));
  if(!res.ok){
    const err=new Error(data.error==='SUPABASE_NOT_CONFIGURED'?t('srvMissing'):(data.message||data.error||'Request failed'));
    err.code=data.error||'ERROR';
    err.status=res.status;
    throw err;
  }
  return data;
}

async function hydrateAuth(){
  if(!session||!session.access_token)return false;
  try{
    const d=await api('/api/auth/me');
    currentUser=d.user;
    currentProfile=d.profile;
    userStats=d.stats||{donations:0,lives_saved:0};
    loadNotifications().catch(()=>{});
    return true;
  }catch(_e){
    currentUser=null;
    currentProfile=null;
    return false;
  }
}

async function loadDonors(){
  try{
    const qs=new URLSearchParams();
    if(userCoords){qs.set('lat',userCoords.lat);qs.set('lng',userCoords.lng)}
    const d=await api('/api/donors'+(qs.toString()?'?'+qs.toString():''));
    donors=d.donors||[];
    donorsLoaded=true;
    return donors;
  }catch(err){
    donors=[];
    donorsLoaded=true;
    return [];
  }
}

async function loadDonations(){
  if(!currentUser)return[];
  const d=await api('/api/donations');
  donationsList=d.donations||[];
  const comp=donationsList.filter(x=>x.status==='completed').length;
  userStats={donations:comp,lives_saved:comp*3};
  return donationsList;
}

async function loadNotifications(){
  if(!currentUser)return[];
  const d=await api('/api/notifications');
  notificationsList=d.notifications||[];
  return notificationsList;
}

function unreadCount(){
  if(!currentUser)return 0;
  return notificationsList.filter(n=>n.donor_id===currentUser.id&&!n.is_read).length;
}

function requireLogin(targetRoute){
  if(currentUser)return true;
  pendingRoute=targetRoute||location.hash||'#/home';
  authErr=t('needAuth');
  authOk='';
  location.hash='#/auth';
  return false;
}

/* ---------- Card & List Helpers ---------- */
const cardHTML=d=>`
  <div class="top">
    <span class="av"><img src="assets/${esc(d.a)}.png" alt=""></span>
    <div class="inf"><b>${esc(d.n)}</b><span class="meta">${ic('drop','red')}<em>${esc(d.g)}</em><small>${esc(d.w)}</small></span></div>
    <span class="dist" style="position:static">${ic('pin')}${d.d} km</span>
  </div>
  <div class="acts">
    ${d.tel?`<a class="btn" href="tel:${esc(d.tel)}">${t('contact')} ${ic('phone')}</a>`:`<button class="btn" data-go="#/request/${esc(d.id)}">${t('contact')} ${ic('phone')}</button>`}
    <button class="btn sec" data-go="#/request/${esc(d.id)}">${t('requestBtn')}</button>
  </div>`;

/* ---------- Views ---------- */
const V={
splash:()=>`<div class="scr splash"><div class="bg"></div>${cells([['torn-tr','top:0;right:0;width:46%'],['torn-bl','bottom:0;left:0;width:60%'],['cell','top:12%;left:-8px;width:62px;transform:rotate(-20deg)'],['cell','top:48%;right:-14px;width:80px'],['cell','bottom:5%;right:6%;width:70px;transform:rotate(30deg)']])}<img class="logo" src="assets/logo.png" alt="BAK"><h2>BAK</h2><p>${t('tag')}</p>${ecg()}<div class="end">${t('end')}</div><div class="pbar"><i></i></div></div>`,

auth:()=>`<div class="scr"><div class="bg"></div>${cells([['cell','top:16%;right:-18px;width:72px'],['cell','bottom:14%;left:-18px;width:72px']])}<div class="body">${hd(authTab==='login'?t('loginTab'):t('signupTab'))}
  <div class="tabs">
    <button data-atab="login" class="${authTab==='login'?'on':''}">${t('loginTab')}</button>
    <button data-atab="signup" class="${authTab==='signup'?'on':''}">${t('signupTab')}</button>
  </div>
  ${authErr?`<div class="errbox">${esc(authErr)}</div>`:''}
  ${authOk?`<div class="okbox">${esc(authOk)}</div>`:''}
  <form id="authForm" class="fcard">
    ${authTab==='signup'?`
      <div class="fld"><label>${t('fullName')}</label><input name="full_name" required placeholder="Ahmed Benali"></div>
    `:''}
    <div class="fld"><label>${t('email')}</label><input name="email" type="email" required placeholder="name@example.com" autocomplete="email"></div>
    <div class="fld"><label>${t('password')}</label><input name="password" type="password" minlength="6" required placeholder="••••••" autocomplete="${authTab==='login'?'current-password':'new-password'}"></div>
    ${authTab==='signup'?`
      <div class="fgrid">
        <div class="fld"><label>${t('blood')}</label><select name="blood_group">${GROUPS.map(g=>`<option value="${g}">${g}</option>`).join('')}</select></div>
        <div class="fld"><label>${t('wil')}</label><select name="wilaya">${WILAYAS.map(w=>`<option value="${w}">${esc(w)}</option>`).join('')}</select></div>
      </div>
      <div class="fgrid">
        <div class="fld"><label>${t('phone')}</label><input name="phone" type="tel" placeholder="+213550000000"></div>
        <div class="fld"><label>${t('birth')}</label><input name="birth_date" type="date"></div>
      </div>
      <label class="chk"><span>${t('isDonorLbl')}</span><input type="checkbox" name="is_donor" checked style="width:20px;height:20px;accent-color:#d6121f"></label>
    `:''}
    <button class="btn" type="submit" ${busy?'disabled':''}>${authTab==='login'?t('submitLogin'):t('submitSignup')}</button>
  </form>
  <button class="linkbtn" data-go="#/home">${t('browseGuest')}</button>
</div></div>`,

home:()=>{
  const av=currentProfile?esc(currentProfile.avatar||'me'):'me';
  const unread=unreadCount();
  return `<div class="scr"><div class="bg"></div>${cells([['cells','bottom:10%;right:-50px;width:150px;opacity:.7']])}<div class="body">
    <div class="brand">
      <img src="assets/logo.png" alt=""><b>BAK</b>
      <div class="acct">
        ${currentUser
          ?`<button class="avbtn" data-go="#/profile" aria-label="profile"><img src="assets/${av}.png" alt=""></button>`
          :`<button class="loginpill" data-go="#/auth">${ic('user')}<span>${t('loginBtn')}</span></button>`}
        <button aria-label="notifications" data-go="#/notifications">${ic('bell')}${unread>0?'<i></i>':''}</button>
      </div>
    </div>
    <div class="hero">${ecg()}<img src="assets/drop-hand.png" alt=""><h3><span>${t('h1')}</span><span>${t('h2')}</span><span>${t('h3')}</span></h3><p>${t('sub')}</p></div>
    <button class="btn" data-go="#/donate">${ic('drop')}<span>${t('donate')}</span>${ic('chev','chev')}</button>
    <div class="tiles">
      <button class="tile" data-go="#/map" style="background-image:url(assets/tile-find.png)"><span>${t('find')}</span></button>
      <button class="tile" data-go="${currentUser?'#/profile':'#/auth/signup'}" style="background-image:url(assets/tile-join.png)"><span>${t('join')}</span></button>
    </div>
    <button class="learn" data-go="#/learn"><span>${t('learn')}</span>${ic('chev','chev')}</button>
  </div>${nav('home')}</div>`;
},

search:()=>`<div class="scr"><div class="bg"></div><div class="body">${hd(t('search'),`<button data-go="${currentUser?'#/profile':'#/auth'}" aria-label="profile" class="dc">${ic('drop')}</button>`)}
  <div class="sbox">
    <label>${ic('search')}<input id="q" value="${esc(q)}" placeholder="${t('ph')}" autocomplete="off"></label>
    <button data-togglefilter class="${showFilter?'on':''}" aria-label="filter">${ic('filter')}</button>
  </div>
  <div class="chips">${['all',...GROUPS].map(g=>`<button class="chip ${grp===g?'on':''}" data-g="${g}">${g==='all'?t('all'):g}</button>`).join('')}</div>
  ${showFilter?`<div class="wbar"><button class="chip ${wFilter==='all'?'on':''}" data-w="all">${t('allWilayas')}</button>${WILAYAS.map(w=>`<button class="chip ${wFilter===w?'on':''}" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div>`:''}
  <div id="list"></div>
</div>${nav('search')}</div>`,

profile:()=>{
  const p=currentProfile||{full_name:currentUser?.email||'BAK',blood_group:'O+',wilaya:t('city'),birth_date:'',avatar:'me',is_donor:true};
  return `<div class="scr"><div class="bg"></div>${cells([['cell','top:30%;left:-24px;width:90px'],['cell','top:22%;right:-16px;width:80px;transform:rotate(40deg)']])}<div class="body pf">
    ${hd(t('prof'),`<button data-go="#/edit-profile" aria-label="edit" style="color:#e0212e">${ic('pen')}</button>`)}
    <div class="phw">${ecg('')}<div class="ph"><img src="assets/${esc(p.avatar||'me')}.png" alt=""><button data-go="#/edit-profile" aria-label="photo">${ic('cam')}</button></div></div>
    <h2>${esc(p.full_name)}</h2>
    <p>${p.is_donor?`${t('eng')} ❤️`:t('notDonor')}</p>
    <div class="info">
      <div><span>${ic('drop','red')}${t('blood')}</span><b>${esc(p.blood_group||'O+')}</b></div>
      <div><span>${ic('pin')}${t('wil')}</span><b>${esc(p.wilaya||t('city'))}</b></div>
      <div><span>${ic('cal')}${t('birth')}</span><b>${esc(p.birth_date||'—')}</b></div>
      <i></i>
    </div>
    <h4>${t('stats')}</h4>
    <div class="stats">
      <div class="stat">${ic('drop')}<b>${userStats.donations}</b><small>${t('dons')}</small></div>
      <div class="stat">${ic('heartf')}<b>${userStats.lives_saved}</b><small>${t('lives')}</small></div>
    </div>
    <button class="btn sm" data-go="#/edit-profile">${t('edit')}</button>
  </div>${nav('prof')}</div>`;
},

'edit-profile':()=>{
  const p=currentProfile||{full_name:'',blood_group:'O+',wilaya:'Alger',birth_date:'',phone:'',avatar:'me',is_donor:true};
  return `<div class="scr"><div class="bg"></div><div class="body">${hd(t('edit'))}
    <form id="editProfileForm" class="fcard">
      <div class="fld"><label>${t('chooseAv')}</label></div>
      <div class="avpick">${AVATARS.map(av=>`<button type="button" data-av="${av}" class="${(p.avatar||'me')===av?'on':''}"><img src="assets/${av}.png" alt="${av}"></button>`).join('')}</div>
      <input type="hidden" name="avatar" value="${esc(p.avatar||'me')}">
      <div class="fld"><label>${t('fullName')}</label><input name="full_name" required value="${esc(p.full_name)}"></div>
      <div class="fgrid">
        <div class="fld"><label>${t('blood')}</label><select name="blood_group">${GROUPS.map(g=>`<option value="${g}" ${p.blood_group===g?'selected':''}>${g}</option>`).join('')}</select></div>
        <div class="fld"><label>${t('wil')}</label><select name="wilaya">${WILAYAS.map(w=>`<option value="${w}" ${p.wilaya===w?'selected':''}>${esc(w)}</option>`).join('')}</select></div>
      </div>
      <div class="fgrid">
        <div class="fld"><label>${t('phone')}</label><input name="phone" type="tel" value="${esc(p.phone||'')}" placeholder="+213550000000"></div>
        <div class="fld"><label>${t('birth')}</label><input name="birth_date" type="date" value="${esc(p.birth_date||'')}"></div>
      </div>
      <label class="chk"><span>${t('isDonorLbl')}</span><input type="checkbox" name="is_donor" ${p.is_donor!==false?'checked':''} style="width:20px;height:20px;accent-color:#d6121f"></label>
      <button class="btn" type="submit" ${busy?'disabled':''}>${busy?t('saving'):t('save')}</button>
    </form>
  </div>${nav('prof')}</div>`;
},

settings:()=>{
  const notifOn=currentProfile?currentProfile.notifications_enabled!==false:true;
  return `<div class="scr"><div class="bg"></div>${cells([['cells','bottom:6%;left:-60px;width:150px;opacity:.8']])}<div class="body">${hd(t('set'))}
    <div class="set">
      <div class="lang"><div class="lg">${ic('globe')}<span>${t('lang')}</span></div><div class="seg">${['fr','en','ar'].map(l=>`<button data-l="${l}" class="${lang===l?'on':''}">${l.toUpperCase()}</button>`).join('')}</div></div>
      <div><span class="l">${ic('moon','f')}${t('dark')}</span><button class="tg ${light?'':'on'}" data-dark aria-label="dark mode"></button></div>
      <button data-go="#/notifications"><span class="l">${ic('bell','f')}${t('notif')} (${notifOn?'ON':'OFF'})</span>${ic('chev','chev')}</button>
      <button data-go="#/help"><span class="l">${ic('head')}${t('help')}</span>${ic('chev','chev')}</button>
      <button data-go="#/about"><span class="l">${ic('infof')}${t('about')}</span>${ic('chev','chev')}</button>
      ${currentUser
        ?`<button class="out" data-logout><span class="l">${ic('out')}${t('logout')}</span>${ic('chev','chev')}</button>`
        :`<button class="out" data-go="#/auth"><span class="l">${ic('user')}${t('loginBtn')}</span>${ic('chev','chev')}</button>`}
    </div>
  </div>${nav('set')}</div>`;
},

map:(id)=>{
  const listPool=donors.filter(x=>grp==='all'||x.g===grp);
  const d=listPool.find(x=>String(x.id)===String(id))||listPool[0]||donors[0];
  return `<div class="scr"><div class="bg"></div><div class="body" style="display:flex;flex-direction:column">
    ${hd(t('findT'),`<button data-cyclegrp aria-label="filter" title="${esc(grp)}">${ic('filter')}</button>`)}
    <div class="mapw">
      <img src="assets/map.jpg" alt="map">
      <div id="map"></div>
      <div class="mctl">
        <button data-mall aria-label="all">${ic('drop')}</button>
        <button data-mme aria-label="locate">${ic('pin')}</button>
      </div>
      <div class="mcard">${d?cardHTML(d):`<div style="text-align:center;padding:8px 0">${t('noDonors')}</div>`}</div>
    </div>
  </div>${nav('search')}</div>`;
},

request:(id)=>{
  const d=donors.find(x=>String(x.id)===String(id));
  const bg=(d&&d.g)||(currentProfile&&currentProfile.blood_group)||'O+';
  const w=(d&&d.w)||(currentProfile&&currentProfile.wilaya)||'Alger';
  return `<div class="scr"><div class="bg"></div><div class="body">${hd(t('reqTitle'))}
    <form id="reqForm" class="fcard" data-donor="${esc(id||'')}">
      <h3>${d?esc(d.n):t('reqTitle')}</h3>
      <p class="sub">${t('reqSub')}</p>
      <div class="fgrid">
        <div class="fld"><label>${t('blood')}</label><select name="blood_group">${GROUPS.map(g=>`<option value="${g}" ${bg===g?'selected':''}>${g}</option>`).join('')}</select></div>
        <div class="fld"><label>${t('wil')}</label><select name="wilaya">${WILAYAS.map(wi=>`<option value="${wi}" ${w===wi?'selected':''}>${esc(wi)}</option>`).join('')}</select></div>
      </div>
      <div class="fld"><label>${t('reqMsg')}</label><textarea name="message" rows="3" placeholder="CHU Mustapha Pacha..."></textarea></div>
      <button class="btn" type="submit" ${busy?'disabled':''}>${t('sendReq')}</button>
    </form>
  </div>${nav('search')}</div>`;
},

donate:()=>{
  const p=currentProfile||{blood_group:'O+'};
  const today=new Date().toISOString().slice(0,10);
  return `<div class="scr"><div class="bg"></div><div class="body">${hd(t('donateTitle'))}
    <form id="donateForm" class="fcard">
      <div class="fld"><label>${t('hospital')}</label>
        <div class="pres">${HOSPITALS.map(h=>`<button type="button" data-hosp="${esc(h)}">${esc(h)}</button>`).join('')}</div>
        <input id="hospInput" name="hospital" required placeholder="Hôpital Central d'Alger">
      </div>
      <div class="fgrid">
        <div class="fld"><label>${t('blood')}</label><select name="blood_group">${GROUPS.map(g=>`<option value="${g}" ${p.blood_group===g?'selected':''}>${g}</option>`).join('')}</select></div>
        <div class="fld"><label>${t('dateLbl')}</label><input name="donation_date" type="date" value="${today}" required></div>
      </div>
      <div class="fld"><label>${t('notesLbl')}</label><input name="notes" placeholder="..."></div>
      <div class="fgrid" style="margin-top:6px">
        <button class="btn" type="submit" data-status="completed" ${busy?'disabled':''}>${t('submitDonate')}</button>
        <button class="btn" type="submit" data-status="scheduled" style="background:linear-gradient(#5a2024,#331013)" ${busy?'disabled':''}>${t('submitSched')}</button>
      </div>
    </form>
  </div>${nav('don')}</div>`;
},

thanks:()=>`<div class="scr thx"><div class="bg"></div>${cells([['cell','top:6%;left:-14px;width:76px;transform:rotate(-25deg)'],['cell','bottom:12%;right:-18px;width:86px']])}<img class="bag" src="assets/bag.png" alt=""><div class="ring">${ic('check')}</div><h2>${t('thx')}</h2><p>${t('thxT')}</p><div class="hr">${ecg()}${ic('heart')}</div><div class="q">${t('tog')}</div><button class="btn" data-go="#/donations"><span>${t('viewDonations')}</span>${ic('chev','chev')}</button><button class="linkbtn" style="position:absolute;bottom:8px" data-go="#/home">${t('back')}</button></div>`,

donations:()=>{
  const completed=donationsList.filter(x=>x.status==='completed');
  const scheduled=donationsList.filter(x=>x.status==='scheduled');
  return `<div class="scr"><div class="bg"></div><div class="body">${hd(t('mine'),`<button data-go="#/donate" aria-label="add" style="color:#e0212e">${ic('plus')}</button>`)}
    <div class="tabs">
      <button data-t="hist" class="${tab==='hist'?'on':''}">${t('hist')}</button>
      <button data-t="next" class="${tab==='next'?'on':''}">${t('next')}</button>
    </div>
    ${tab==='hist'
      ?(completed.length
        ?`<div class="dlist">${completed.map(x=>`<div class="ditem"><span class="ic">${ic('cal')}</span><span class="tx"><b>${fd(x.donation_date)}</b>${esc(x.hospital)}</span><span class="bd">${esc(x.blood_group)}</span></div>`).join('')}</div>
          <div class="sum">${ic('heartf')}<div><b>${completed.length} ${t('donsUnit')}</b><span>${completed.length*3} ${t('livesUnit')}</span></div></div>`
        :`<div class="emptycard">${t('noHist')}<button class="btn" data-go="#/donate">${ic('drop')}<span>${t('donate')}</span></button></div>`)
      :(scheduled.length
        ?`<div class="dlist">${scheduled.map(x=>`<div class="ditem"><span class="ic">${ic('cal')}</span><span class="tx"><b>${fd(x.donation_date)}</b>${esc(x.hospital)}<div class="dacts"><button data-comp="${esc(x.id)}">${t('markDone')}</button><button class="ghost" data-del="${esc(x.id)}">${t('cancelBtn')}</button></div></span><span class="bd">${esc(x.blood_group)}</span></div>`).join('')}</div><button class="btn" data-go="#/donate">${ic('plus')}<span>${t('submitSched')}</span></button>`
        :`<div class="next">${t('none')}<button class="btn" data-go="#/donate">${ic('drop')}<span>${t('donate')}</span></button></div>`)}
  </div>${nav('don')}</div>`;
},

notifications:()=>{
  const uid=currentUser&&currentUser.id;
  return `<div class="scr"><div class="bg"></div><div class="body">${hd(t('notifTitle'))}
    ${notificationsList.length
      ?notificationsList.map(n=>{
        const isIn=n.donor_id===uid;
        return `<div class="nitem ${isIn&&!n.is_read?'unread':''}">
          <div class="ntop"><b>${isIn?t('incoming'):t('outgoing')} • ${esc(n.requester_name)}</b><span class="nbadge">${esc(n.blood_group)}</span></div>
          <p>${esc(n.wilaya)}${n.message?` — ${esc(n.message)}`:''}</p>
          <div class="dacts">
            ${n.requester_phone?`<a href="tel:${esc(n.requester_phone)}"><button type="button">${t('contact')}</button></a>`:''}
            ${isIn&&!n.is_read?`<button type="button" class="ghost" data-nread="${esc(n.id)}">${t('markRead')}</button>`:''}
          </div>
        </div>`;
      }).join('')
      :`<div class="emptycard">${t('noNotif')}<button class="btn" data-go="#/search">${ic('search')}<span>${t('search')}</span></button></div>`}
  </div>${nav('home')}</div>`;
},

learn:()=>`<div class="scr"><div class="bg"></div><div class="body">${hd(t('learnTitle'))}
  <div class="fcard">
    <h3>${t('learnTitle')}</h3>
    <p class="sub">${t('sub')}</p>
    <div class="compat">
      <div><b>O-</b><span>Donne à tous / Universal</span></div>
      <div><b>O+</b><span>O+, A+, B+, AB+</span></div>
      <div><b>A-</b><span>A-, A+, AB-, AB+</span></div>
      <div><b>A+</b><span>A+, AB+</span></div>
      <div><b>B-</b><span>B-, B+, AB-, AB+</span></div>
      <div><b>B+</b><span>B+, AB+</span></div>
      <div><b>AB-</b><span>AB-, AB+</span></div>
      <div><b>AB+</b><span>Reçoit de tous</span></div>
    </div>
  </div>
  <button class="btn" data-go="#/donate">${ic('drop')}<span>${t('donate')}</span></button>
  <button class="linkbtn" data-go="#/search">${t('search')}</button>
</div>${nav('home')}</div>`,

help:()=>`<div class="scr"><div class="bg"></div><div class="body">${hd(t('helpTitle'))}
  <div class="fcard">
    <h3>${t('helpTitle')}</h3>
    <p class="sub">SAMU: 14 • Protection Civile: 1021 • BAK Support: support@bak-blood.org</p>
    <p class="sub">18 - 65 ans • &gt; 50 kg • Intervalle minimum: 8 semaines entre deux dons.</p>
    <button class="btn" data-go="#/search">${ic('search')}<span>${t('findT')}</span></button>
  </div>
</div>${nav('set')}</div>`,

about:()=>`<div class="scr"><div class="bg"></div><div class="body">${hd(t('aboutTitle'))}
  <div class="fcard" style="text-align:center">
    <img src="assets/logo.png" alt="BAK" style="width:88px;margin-bottom:8px">
    <h3>BAK — ${t('tag')}</h3>
    <p class="sub">${t('sub')}</p>
    <button class="btn" data-go="#/home">${t('back')}</button>
  </div>
</div>${nav('set')}</div>`
};

/* ---------- Donors List Renderer ---------- */
function list(){
  const el=document.getElementById('list');
  if(!el)return;
  const r=donors.filter(d=>{
    const okGrp=grp==='all'||d.g===grp;
    const okW=wFilter==='all'||(d.w||'').toLowerCase()===wFilter.toLowerCase();
    const okQ=!q||(d.n||'').toLowerCase().includes(q.toLowerCase())||(d.w||'').toLowerCase().includes(q.toLowerCase());
    return okGrp&&okW&&okQ;
  });
  el.innerHTML=r.length
    ?r.map(d=>`<div class="row" data-go="#/map/${esc(d.id)}"><span class="av"><img src="assets/${esc(d.a)}.png" alt=""><i></i></span><div class="inf"><b>${esc(d.n)}</b><span class="meta">${ic('drop','red')}<em>${esc(d.g)}</em><small>${esc(d.w)}</small></span></div><span class="dist">${ic('pin')}${d.d} km</span><button class="plus" data-req="${esc(d.id)}" aria-label="+">${ic('plus')}</button></div>`).join('')
    :`<div class="empty">${t('noDonors')}</div>`;
}

/* ---------- Map Engine (Leaflet / Google Maps) ---------- */
const CFG=window.BAK_CONFIG||{};
let mapCtl=null;
const pinSVG=(s,sel)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${Math.round(s*1.25)}" viewBox="0 0 24 30"><path d="M12 1c4 5.2 8 9.6 8 14.2a8 8 0 0 1-16 0C4 10.6 8 6.2 12 1z" fill="#d6121f" stroke="#fff" stroke-width="${sel?1.6:1.2}"/>${sel?'<path d="M12 21s-4.6-2.9-4.6-6.2a2.6 2.6 0 0 1 4.6-1.6 2.6 2.6 0 0 1 4.6 1.6c0 3.3-4.6 6.2-4.6 6.2z" fill="#fff"/>':''}</svg>`;
const loadScript=(src,css)=>new Promise((ok,ko)=>{if(css){const l=document.createElement('link');l.rel='stylesheet';l.href=css;document.head.appendChild(l)}const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=ko;document.head.appendChild(s)});

function leafletEngine(el,pool,start,pick){
  const m=L.map(el,{zoomControl:false,attributionControl:false,zoomSnap:.5});
  L.control.attribution({position:'topleft',prefix:false}).addTo(m);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(m);
  const mk={};
  const icon=on=>L.divIcon({className:'pin',html:pinSVG(on?42:28,on),iconSize:on?[42,52]:[28,35],iconAnchor:on?[21,52]:[14,35]});
  pool.forEach(d=>{
    mk[d.id]=L.marker([d.lat,d.lng],{icon:icon(start&&d.id===start.id),zIndexOffset:start&&d.id===start.id?1000:0}).addTo(m);
    mk[d.id].on('click',()=>pick(d.id));
  });
  let cur=start?start.id:null,me=null;
  if(start){m.setView([start.lat,start.lng],12,{animate:false});m.panBy([0,90],{animate:false})}
  else{m.setView([36.7538,3.0588],6,{animate:false})}
  return{
    select(d){
      if(cur&&mk[cur]){mk[cur].setIcon(icon(false));mk[cur].setZIndexOffset(0)}
      cur=d.id;
      if(mk[cur]){mk[cur].setIcon(icon(true));mk[cur].setZIndexOffset(1000)}
      m.setView([d.lat,d.lng],Math.max(m.getZoom(),12),{animate:false});
      m.panBy([0,90],{animate:false});
    },
    all(){if(pool.length)m.fitBounds(L.latLngBounds(pool.map(d=>[d.lat,d.lng])),{padding:[40,40]})},
    me(p){if(me)me.remove();me=L.circleMarker([p.lat,p.lng],{radius:8,color:'#fff',weight:3,fillColor:'#2a7bff',fillOpacity:1}).addTo(m);m.setView([p.lat,p.lng],13)},
    destroy(){m.remove()}
  };
}

function googleEngine(el,pool,start,pick){
  const g=google.maps;
  const center=start?{lat:start.lat,lng:start.lng}:{lat:36.7538,lng:3.0588};
  const m=new g.Map(el,{center,zoom:start?12:6,disableDefaultUI:true,gestureHandling:'greedy'});
  const gi=on=>({url:'data:image/svg+xml;utf8,'+encodeURIComponent(pinSVG(on?42:28,on)),scaledSize:new g.Size(on?42:28,on?52:35),anchor:new g.Point(on?21:14,on?52:35)});
  const mk={};let cur=start?start.id:null,me=null;
  pool.forEach(d=>{
    mk[d.id]=new g.Marker({position:{lat:d.lat,lng:d.lng},map:m,icon:gi(start&&d.id===start.id),title:d.n,zIndex:start&&d.id===start.id?1000:1});
    mk[d.id].addListener('click',()=>pick(d.id));
  });
  if(start)m.panBy(0,-90);
  return{
    select(d){
      if(cur&&mk[cur]){mk[cur].setIcon(gi(false));mk[cur].setZIndex(1)}
      cur=d.id;
      if(mk[cur]){mk[cur].setIcon(gi(true));mk[cur].setZIndex(1000)}
      m.panTo({lat:d.lat,lng:d.lng});m.panBy(0,-90);
    },
    all(){if(!pool.length)return;const b=new g.LatLngBounds();pool.forEach(d=>b.extend({lat:d.lat,lng:d.lng}));m.fitBounds(b,40)},
    me(p){if(me)me.setMap(null);me=new g.Marker({position:p,map:m,icon:{path:g.SymbolPath.CIRCLE,scale:8,fillColor:'#2a7bff',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});m.setCenter(p);m.setZoom(13)},
    destroy(){}
  };
}

async function initMap(id){
  const el=document.getElementById('map');if(!el)return;
  if(!donorsLoaded)await loadDonors();
  const pool=donors.filter(x=>grp==='all'||x.g===grp);
  const start=pool.find(x=>String(x.id)===String(id))||pool[0]||null;
  const c=document.querySelector('.mcard');
  if(c)c.innerHTML=start?cardHTML(start):`<div style="text-align:center;padding:8px 0">${t('noDonors')}</div>`;
  const pick=i=>{
    const d=pool.find(x=>String(x.id)===String(i));
    if(!d||!mapCtl)return;
    mapCtl.select(d);
    if(c)c.innerHTML=cardHTML(d);
  };
  try{
    let eng;
    if(CFG.gmapsKey){if(!(window.google&&window.google.maps))await loadScript('https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(CFG.gmapsKey)+'&language='+lang);eng=googleEngine}
    else{if(!window.L)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css');eng=leafletEngine}
    if(document.getElementById('map')!==el)return;
    mapCtl=eng(el,pool,start,pick);
    const mall=document.querySelector('[data-mall]');if(mall)mall.onclick=()=>mapCtl&&mapCtl.all();
    const mme=document.querySelector('[data-mme]');
    if(mme)mme.onclick=()=>{
      if(!navigator.geolocation)return toast();
      navigator.geolocation.getCurrentPosition(async p=>{
        userCoords={lat:p.coords.latitude,lng:p.coords.longitude};
        if(mapCtl)mapCtl.me(userCoords);
        await loadDonors();
      },()=>toast(),{timeout:8000});
    };
  }catch(_e){
    el.remove();
    document.querySelectorAll('.mctl').forEach(x=>x.remove());
  }
}

/* ---------- Form Wiring ---------- */
function bindForms(){
  const af=document.getElementById('authForm');
  if(af)af.onsubmit=async e=>{
    e.preventDefault();
    if(busy)return;
    const fdObj=Object.fromEntries(new FormData(af).entries());
    fdObj.is_donor=!!af.querySelector('[name="is_donor"]')?.checked;
    busy=true;authErr='';authOk='';render();
    try{
      const endpoint=authTab==='login'?'/api/auth/login':'/api/auth/signup';
      const res=await api(endpoint,{method:'POST',body:JSON.stringify(fdObj)});
      if(res.emailConfirmationRequired){
        authOk=t('checkEmail');
        authTab='login';
      }else{
        saveSession(res.session);
        currentUser=res.user;
        currentProfile=res.profile;
        await hydrateAuth();
        const dest=pendingRoute||'#/home';
        pendingRoute='';
        location.hash=dest;
        return;
      }
    }catch(err){
      authErr=err.message;
    }finally{
      busy=false;
      render();
    }
  };

  const ef=document.getElementById('editProfileForm');
  if(ef)ef.onsubmit=async e=>{
    e.preventDefault();
    if(busy)return;
    const fdObj=Object.fromEntries(new FormData(ef).entries());
    fdObj.is_donor=!!ef.querySelector('[name="is_donor"]')?.checked;
    busy=true;
    try{
      const res=await api('/api/profile',{method:'PUT',body:JSON.stringify(fdObj)});
      currentProfile=res.profile;
      donorsLoaded=false;
      toast(t('saved'));
      location.hash='#/profile';
    }catch(err){
      toast(err.message);
    }finally{
      busy=false;
    }
  };

  const df=document.getElementById('donateForm');
  if(df)df.onsubmit=async e=>{
    e.preventDefault();
    if(busy)return;
    const submitter=e.submitter;
    const status=(submitter&&submitter.dataset.status)||'completed';
    const fdObj=Object.fromEntries(new FormData(df).entries());
    fdObj.status=status;
    busy=true;
    try{
      await api('/api/donations',{method:'POST',body:JSON.stringify(fdObj)});
      await loadDonations();
      if(status==='completed'){
        location.hash='#/thanks';
      }else{
        tab='next';
        location.hash='#/donations';
      }
    }catch(err){
      toast(err.message);
    }finally{
      busy=false;
    }
  };

  const rf=document.getElementById('reqForm');
  if(rf)rf.onsubmit=async e=>{
    e.preventDefault();
    if(busy)return;
    const fdObj=Object.fromEntries(new FormData(rf).entries());
    fdObj.donor_id=rf.dataset.donor;
    busy=true;
    try{
      await api('/api/requests',{method:'POST',body:JSON.stringify(fdObj)});
      toast(t('reqSent'));
      location.hash='#/notifications';
    }catch(err){
      toast(err.message);
    }finally{
      busy=false;
    }
  };
}

/* ---------- Router & Render ---------- */
let timer;
const PROTECTED=new Set(['profile','edit-profile','donations','donate','notifications','request']);

async function render(){
  clearTimeout(timer);
  if(mapCtl){try{mapCtl.destroy()}catch(_e){}mapCtl=null}

  const h=location.hash.replace('#/','')||'splash';
  const [r,a]=h.split('/');

  if(r==='auth'&&(a==='signup'||a==='login')){
    authTab=a;
  }

  if(PROTECTED.has(r)&&!currentUser){
    requireLogin('#/'+h);
    return;
  }

  const f=V[r]||V.home;
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.documentElement.classList.toggle('light',light);

  app.innerHTML=f(a);
  bindForms();

  if(r==='search'){
    if(!donorsLoaded)await loadDonors();
    list();
    const i=document.getElementById('q');
    if(i)i.oninput=e=>{q=e.target.value;list()};
  }
  if(r==='map')initMap(a);
  if(r==='donations'&&currentUser){
    loadDonations().then(()=>{if(location.hash.startsWith('#/donations')){app.innerHTML=V.donations();bindForms()}}).catch(()=>{});
  }
  if(r==='notifications'&&currentUser){
    loadNotifications().then(()=>{if(location.hash.startsWith('#/notifications')){app.innerHTML=V.notifications();bindForms()}}).catch(()=>{});
  }
  if(r==='splash'){
    timer=setTimeout(()=>{
      location.replace(currentUser?'#/home':'#/auth');
    },2200);
  }
}

document.addEventListener('click',async e=>{
  const reqBtn=e.target.closest('[data-req]');
  if(reqBtn){
    e.stopPropagation();
    const id=reqBtn.dataset.req;
    if(requireLogin('#/request/'+id))location.hash='#/request/'+id;
    return;
  }

  const x=e.target.closest('[data-go],[data-back],[data-g],[data-w],[data-l],[data-t],[data-atab],[data-av],[data-hosp],[data-comp],[data-del],[data-nread],[data-dark],[data-togglefilter],[data-cyclegrp],[data-logout],[data-toast]');
  if(!x)return;

  if(x.dataset.go){
    location.hash=x.dataset.go;
  }else if('back' in x.dataset){
    history.length>1?history.back():location.hash='#/home';
  }else if(x.dataset.g){
    grp=x.dataset.g;render();
  }else if(x.dataset.w){
    wFilter=x.dataset.w;render();
  }else if(x.dataset.l){
    lang=x.dataset.l;S.set('bak.lang',lang);render();
  }else if(x.dataset.t){
    tab=x.dataset.t;render();
  }else if(x.dataset.atab){
    authTab=x.dataset.atab;authErr='';authOk='';render();
  }else if(x.dataset.av){
    const inp=document.querySelector('#editProfileForm [name="avatar"]');
    if(inp)inp.value=x.dataset.av;
    document.querySelectorAll('.avpick button').forEach(b=>b.classList.toggle('on',b.dataset.av===x.dataset.av));
  }else if(x.dataset.hosp){
    const hi=document.getElementById('hospInput');
    if(hi)hi.value=x.dataset.hosp;
  }else if(x.dataset.comp){
    try{
      await api('/api/donations/'+encodeURIComponent(x.dataset.comp),{method:'PATCH',body:JSON.stringify({status:'completed'})});
      await loadDonations();
      location.hash='#/thanks';
    }catch(err){toast(err.message)}
  }else if(x.dataset.del){
    try{
      await api('/api/donations/'+encodeURIComponent(x.dataset.del),{method:'DELETE'});
      await loadDonations();
      render();
    }catch(err){toast(err.message)}
  }else if(x.dataset.nread){
    try{
      await api('/api/notifications/'+encodeURIComponent(x.dataset.nread)+'/read',{method:'PATCH'});
      await loadNotifications();
      render();
    }catch(err){toast(err.message)}
  }else if('togglefilter' in x.dataset){
    showFilter=!showFilter;render();
  }else if('cyclegrp' in x.dataset){
    const seq=['all',...GROUPS];
    grp=seq[(seq.indexOf(grp)+1)%seq.length];
    toast(grp==='all'?t('all'):grp);
    render();
  }else if('dark' in x.dataset){
    light=!light;S.set('bak.light',light?'1':'0');render();
  }else if('logout' in x.dataset){
    await api('/api/auth/logout',{method:'POST'}).catch(()=>{});
    saveSession(null);
    currentUser=null;
    currentProfile=null;
    donationsList=[];
    notificationsList=[];
    userStats={donations:0,lives_saved:0};
    location.hash='#/auth';
  }else{
    toast();
  }
});

addEventListener('hashchange',render);

(async()=>{
  await hydrateAuth();
  loadDonors().catch(()=>{});
  render();
})();

if('serviceWorker' in navigator&&/^https:|localhost/.test(location.protocol+location.hostname)){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
})();
