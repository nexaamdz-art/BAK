(()=>{
const S={
  get(k,d){try{return localStorage.getItem(k)??d}catch(_e){return d}},
  set(k,v){try{localStorage.setItem(k,v)}catch(_e){}},
  del(k){try{localStorage.removeItem(k)}catch(_e){}},
  json(k,d=null){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(_e){return d}}
};

const GROUPS=['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const WILAYAS=[
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira',
  'Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda',
  'Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',"M'Sila",'Mascara','Ouargla',
  'Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela',
  'Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar',
  'Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet',"El M'Ghair",'El Meniaa'
];
const AVATARS=['me','av1','av2','av3','av4','av5'];
const WILAYA_HOSPITALS={
  Adrar:['EPH Ibn Sina (Adrar)','CTS Adrar'],
  Chlef:['EPH Soeurs Bedj (Chlef)','EPH Ouled Mohamed (Chlef)','CTS Chlef'],
  Laghouat:['EPH Ahmidat Hamidou (Laghouat)','CTS Laghouat'],
  'Oum El Bouaghi':['EPH Mohamed Boudiaf (Oum El Bouaghi)','EPH Zerdani Salah (Aïn Beïda)','CTS Oum El Bouaghi'],
  Batna:['CHU Touhami Benflis (Batna)','EPH Batna','CTS Batna'],
  'Béjaïa':['CHU Khellil Amrane (Béjaïa)','EPH Frantz Fanon (Béjaïa)','CTS Béjaïa'],
  Biskra:['EPH Bachir Bennacer (Biskra)','EPH Hakim Saâdane (Biskra)','CTS Biskra'],
  'Béchar':['EPH Tourabi Boudjemaa (Béchar)','CTS Béchar'],
  Blida:['CHU Frantz Fanon (Blida)','EPH Boufarik','CTS Blida'],
  Bouira:['EPH Mohamed Boudiaf (Bouira)','EPH Lakhdaria','CTS Bouira'],
  Tamanrasset:['EPH Mesbah Baghdadi (Tamanrasset)','CTS Tamanrasset'],
  'Tébessa':['EPH Bouguerra Boulaâras (Tébessa)','EPH Alia Salah','CTS Tébessa'],
  Tlemcen:['CHU Tidjani Damerdji (Tlemcen)','EPH Maghnia','CTS Tlemcen'],
  Tiaret:['EPH Youcef Damerdji (Tiaret)','EPH Frenda','CTS Tiaret'],
  'Tizi Ouzou':['CHU Nedir Mohamed (Tizi Ouzou)','EPH Azazga','CTS Tizi Ouzou'],
  Alger:['CHU Mustapha Pacha',"Hôpital Central d'Alger (Aïn Naâdja)",'CHU Bab El Oued','CHU Beni Messous','EHS Salim Zemirli','CTS Alger'],
  Djelfa:['EPH Mohand Akli (Djelfa)','CTS Djelfa'],
  Jijel:['EPH Mohamed Seddik Benyahia (Jijel)','EPH El Milia','CTS Jijel'],
  'Sétif':['CHU Saâdna Abdenour (Sétif)','EPH El Eulma','CTS Sétif'],
  'Saïda':['EPH Ahmed Medeghri (Saïda)','CTS Saïda'],
  Skikda:['EPH Abderazak Bouhara (Skikda)','EPH Azzaba','CTS Skikda'],
  'Sidi Bel Abbès':['CHU Abdelkader Hassani (Sidi Bel Abbès)','CTS Sidi Bel Abbès'],
  Annaba:['CHU Ibn Rochd (Annaba)','CHU Dorban (Annaba)','CTS Annaba'],
  Guelma:['EPH El Hakim Okbi (Guelma)','EPH Oued Zenati','CTS Guelma'],
  Constantine:['CHU Benbadis (Constantine)','Hôpital Militaire Régional (Constantine)','CTS Constantine'],
  'Médéa':['EPH Mohamed Boudiaf (Médéa)','EPH Berrouaghia','CTS Médéa'],
  Mostaganem:['EPH Ernesto Che Guevara (Mostaganem)','CHU Mostaganem','CTS Mostaganem'],
  "M'Sila":['EPH Zahraoui (M\'Sila)','EPH Bou Saâda','CTS M\'Sila'],
  Mascara:['EPH Meslem Tayeb (Mascara)','EPH Sig','CTS Mascara'],
  Ouargla:['EPH Mohamed Boudiaf (Ouargla)','CHU Ouargla','CTS Ouargla'],
  Oran:['CHU Oran (Dr Benzerdjeb)','EHU 1er Novembre 1954 (Oran)','Hôpital Militaire Régional (Oran)','CTS Oran'],
  'El Bayadh':['EPH Mohamed Boudiaf (El Bayadh)','CTS El Bayadh'],
  Illizi:['EPH Tarek Ibn Ziad (Illizi)','CTS Illizi'],
  'Bordj Bou Arréridj':['EPH Lakhdar Bouzidi (Bordj Bou Arréridj)','CTS Bordj Bou Arréridj'],
  'Boumerdès':['EPH Thénia','EPH Bordj Menaïel','EPH Dellys','CTS Boumerdès'],
  'El Tarf':['EPH El Tarf (El Hadi Bendjedid)','EPH El Kala','CTS El Tarf'],
  Tindouf:['EPH Si El Haouès (Tindouf)','CTS Tindouf'],
  Tissemsilt:['EPH Tissemsilt','CTS Tissemsilt'],
  'El Oued':['EPH Bachir Bennacer (El Oued)','CTS El Oued'],
  Khenchela:['EPH Ahmed Ben Bella (Khenchela)','EPH Ali Boushaba (Khenchela)','CTS Khenchela'],
  'Souk Ahras':['EPH Ibn Rochd (Souk Ahras)','CTS Souk Ahras'],
  Tipaza:['EPH Tagzait (Tipaza)','EPH Koléa','EPH Hadjout','CTS Tipaza'],
  Mila:['EPH Frères Maghlaoui (Mila)','EPH Chelghoum Laïd','CTS Mila'],
  'Aïn Defla':['EPH Makour Hamou (Aïn Defla)','EPH Khemis Miliana','CTS Aïn Defla'],
  'Naâma':['EPH Frères Kadri (Naâma)','EPH Mecheria','CTS Naâma'],
  'Aïn Témouchent':['EPH Ahmed Medeghri (Aïn Témouchent)','CTS Aïn Témouchent'],
  'Ghardaïa':['EPH Brahim Tirichine (Ghardaïa)','CTS Ghardaïa'],
  Relizane:['EPH Mohamed Boudiaf (Relizane)','EPH Oued Rhiou','CTS Relizane'],
  Timimoun:['EPH El Hadi Benali (Timimoun)','CTS Timimoun'],
  'Bordj Badji Mokhtar':['EPH Bordj Badji Mokhtar','CTS Bordj Badji Mokhtar'],
  'Ouled Djellal':['EPH Achour Ziane (Ouled Djellal)','CTS Ouled Djellal'],
  'Béni Abbès':['EPH Mohamed Boudiaf (Béni Abbès)','CTS Béni Abbès'],
  'In Salah':['EPH In Salah','CTS In Salah'],
  'In Guezzam':['EPH In Guezzam','CTS In Guezzam'],
  Touggourt:['EPH Slimane Amirat (Touggourt)','CTS Touggourt'],
  Djanet:['EPH Djanet','CTS Djanet'],
  "El M'Ghair":["EPH El M'Ghair","CTS El M'Ghair"],
  'El Meniaa':['EPH Mohamed Chaâbani (El Meniaa)','CTS El Meniaa']
};
let donateWilaya='';
let extraHospitals={};
function hospitalsForWilaya(w){
  const base=WILAYA_HOSPITALS[w]||[`EPH ${w}`,`CTS ${w}`];
  const extra=extraHospitals[w]||[];
  const out=[...base];
  for(const h of extra){if(!out.some(x=>x.toLowerCase()===h.toLowerCase()))out.push(h)}
  return out;
}

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
let pendingEmail='';
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
    viewDonations:'Voir mes dons',
    medTitle:'Questionnaire médical du donneur',
    gender:'Genre',
    male:'Homme',
    female:'Femme',
    qPregnant:'Êtes-vous enceinte ou avez-vous accouché / allaité lors des 6 derniers mois ?',
    qWeight:'Pesez-vous 50 kg ou plus ?',
    qIllness:'Avez-vous une maladie chronique ou transmissible (diabète, hépatite, cœur...) ?',
    qIllnessDet:'Précisez (optionnel)',
    qSurgery:'Chirurgie, tatouage ou piercing lors des 6 derniers mois ?',
    qMeds:'Prenez-vous un traitement médical actuellement ?',
    qLastDon:'Date du dernier don (optionnel)',
    yes:'Oui',no:'Non',
    elig_eligible:'Éligible au don',
    elig_review:'Avis médical requis',
    elig_deferred:'Non éligible actuellement',
    mapSearchPh:'Ville, hôpital, quartier...',
    mapSearchNone:'Aucun lieu trouvé.',
    geoErr:'Localisation indisponible.',
    emailExists:'Cet e-mail est déjà enregistré. Connectez-vous.',
    resendBtn:'Renvoyer le lien',
    resendSent:'Lien renvoyé ! Vérifiez aussi les spams.',
    hospSearchBtn:'Proches',
    hospSearching:'Recherche...',
    hospNone:'Aucun autre hôpital trouvé.',
    medDisclaimer:'Cette évaluation est indicative et ne remplace pas l\'avis d\'un médecin ou du centre de transfusion.'
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
    viewDonations:'View my donations',
    medTitle:'Donor Health Questionnaire',
    gender:'Gender',
    male:'Male',
    female:'Female',
    qPregnant:'Are you pregnant or have you given birth / breastfed in the last 6 months?',
    qWeight:'Do you weigh 50 kg or more?',
    qIllness:'Do you have any chronic or infectious illness (heart disease, hepatitis, insulin diabetes...)?',
    qIllnessDet:'Please specify (optional)',
    qSurgery:'Surgery, tattoo, or piercing in the last 6 months?',
    qMeds:'Are you currently taking any medication?',
    qLastDon:'Date of last blood donation (optional)',
    yes:'Yes',no:'No',
    elig_eligible:'Eligible to donate',
    elig_review:'Medical review advised',
    elig_deferred:'Currently deferred',
    mapSearchPh:'City, hospital, area...',
    mapSearchNone:'Place not found.',
    geoErr:'Location unavailable.',
    emailExists:'This email is already registered. Please sign in.',
    resendBtn:'Resend confirmation link',
    resendSent:'Link resent! Also check your Spam folder.',
    hospSearchBtn:'Nearby',
    hospSearching:'Searching...',
    hospNone:'No additional hospitals found.',
    medDisclaimer:'This assessment is indicative and does not replace advice from a doctor or the blood transfusion center.'
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
    viewDonations:'عرض تبرعاتي',
    medTitle:'الاستبيان الصحي للمتبرّع',
    gender:'الجنس',
    male:'ذكر',
    female:'أنثى',
    qPregnant:'هل أنتِ حامل حاليًا أو أنجبتِ / أرضعتِ خلال آخر 6 أشهر؟',
    qWeight:'هل يبلغ وزنك 50 كغ أو أكثر؟',
    qIllness:'هل تعاني من أي أمراض مزمنة أو معدية (أمراض القلب، التهاب الكبد، السكري...)؟',
    qIllnessDet:'حدّد الحالة (اختياري)',
    qSurgery:'هل أجريت عملية جراحية أو حجامة/وشمًا خلال آخر 6 أشهر؟',
    qMeds:'هل تتناول أي أدوية حاليًا؟',
    qLastDon:'تاريخ آخر تبرع بالدم (اختياري)',
    yes:'نعم',no:'لا',
    elig_eligible:'مؤهّل للتبرع',
    elig_review:'يُنصح باستشارة الطبيب',
    elig_deferred:'غير مؤهّل حاليًا',
    mapSearchPh:'مدينة، مستشفى، حي...',
    mapSearchNone:'لم يتم العثور على الموقع.',
    geoErr:'تعذر تحديد الموقع.',
    emailExists:'هذا البريد مسجّل بالفعل. يرجى تسجيل الدخول.',
    resendBtn:'إعادة إرسال رابط التأكيد',
    resendSent:'تمت إعادة الإرسال! تفقد مجلد الرسائل غير المرغوب فيها (Spam) أيضًا.',
    hospSearchBtn:'الأقرب',
    hospSearching:'جارٍ البحث...',
    hospNone:'لم يتم العثور على مستشفيات أخرى.',
    medDisclaimer:'هذا التقييم استرشادي ولا يغني عن رأي الطبيب أو مركز نقل الدم.'
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
const cells=(a)=>a.map(([f,s])=>`<img class="cl" src="assets/${f}.webp" alt="" style="${s}">`).join('');
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
    <span class="av"><img src="assets/${esc(d.a||'av1')}.webp" alt=""></span>
    <div class="inf"><b>${esc(d.n||'')}</b><span class="meta">${ic('drop','red')}<em>${esc(d.g||'')}</em><small>${esc(d.w||'')}</small></span></div>
    <span class="dist" style="position:static">${ic('pin')}${Number.isFinite(d.d)?d.d:0} km</span>
  </div>
  <div class="acts">
    <button class="btn" style="grid-column:1/-1" data-go="#/request/${esc(d.id||'')}">${t('requestBtn')}</button>
  </div>`;

const ynRow=(name,label,val)=>`<div class="qrow"><span>${label}</span><div class="yn" data-yn="${name}"><button type="button" data-val="true" class="${val?'on':''}">${t('yes')}</button><button type="button" data-val="false" class="${!val?'on':''}">${t('no')}</button><input type="hidden" name="${name}" value="${val?'true':'false'}"></div></div>`;

const healthQuestionsHTML=(p={})=>{
  const gen=p.gender==='female'?'female':'male';
  const preg=!!p.pregnant_or_breastfeeding;
  const w50=p.weight_over_50!==false;
  const ill=!!p.has_chronic_illness;
  const surg=!!p.recent_surgery_or_tattoo;
  const meds=!!p.taking_medication;
  return `<div class="qsec">
    <h4>${t('medTitle')}</h4>
    <div class="qrow"><span>${t('gender')}</span><div class="yn" data-yn="gender"><button type="button" data-val="male" class="${gen==='male'?'on':''}">${t('male')}</button><button type="button" data-val="female" class="${gen==='female'?'on':''}">${t('female')}</button><input type="hidden" name="gender" value="${gen}"></div></div>
    <div id="pregnantWrap" style="display:${gen==='female'?'block':'none'}">${ynRow('pregnant_or_breastfeeding',t('qPregnant'),preg)}</div>
    ${ynRow('weight_over_50',t('qWeight'),w50)}
    ${ynRow('has_chronic_illness',t('qIllness'),ill)}
    <div id="illnessDetailsWrap" class="fld" style="display:${ill?'flex':'none'};margin-top:4px"><label>${t('qIllnessDet')}</label><input name="illness_details" value="${esc(p.illness_details||'')}" placeholder="..."></div>
    ${ynRow('recent_surgery_or_tattoo',t('qSurgery'),surg)}
    ${ynRow('taking_medication',t('qMeds'),meds)}
    <div class="fld" style="margin-top:6px"><label>${t('qLastDon')}</label><input name="last_donation_date" type="date" value="${esc(p.last_donation_date||'')}"></div>
    <p style="font-size:12.5px;color:#6b4a43;margin-top:8px;line-height:1.35">${t('medDisclaimer')}</p>
  </div>`;
};

/* ---------- Views ---------- */
const V={
splash:()=>`<div class="scr splash"><div class="bg"></div>${cells([['torn-tr','top:0;right:0;width:46%'],['torn-bl','bottom:0;left:0;width:60%'],['cell','top:12%;left:-8px;width:62px;transform:rotate(-20deg)'],['cell','top:48%;right:-14px;width:80px'],['cell','bottom:5%;right:6%;width:70px;transform:rotate(30deg)']])}<img class="logo" src="assets/logo.webp?v=24" alt="BAK"><h2>BAK</h2><p>${t('tag')}</p>${ecg()}<div class="end">${t('end')}</div><div class="pbar"><i></i></div></div>`,

auth:()=>`<div class="scr"><div class="bg"></div>${cells([['cell','top:16%;right:-18px;width:72px'],['cell','bottom:14%;left:-18px;width:72px']])}<div class="body">${hd(authTab==='login'?t('loginTab'):t('signupTab'))}
  <div class="tabs">
    <button data-atab="login" class="${authTab==='login'?'on':''}">${t('loginTab')}</button>
    <button data-atab="signup" class="${authTab==='signup'?'on':''}">${t('signupTab')}</button>
  </div>
  ${authErr?`<div class="errbox">${esc(authErr)}</div>`:''}
  ${authOk?`<div class="okbox">${esc(authOk)}${pendingEmail?` <button type="button" data-resend style="text-decoration:underline;font-weight:700;color:#145c2c;margin-inline-start:6px">${t('resendBtn')}</button>`:''}</div>`:''}
  <form id="authForm" class="fcard">
    ${authTab==='signup'?`
      <div class="fld"><label>${t('fullName')}</label><input name="full_name" required placeholder="Ahmed Benali"></div>
    `:''}
    <div class="fld"><label>${t('email')}</label><input name="email" type="email" required placeholder="name@example.com" autocomplete="email"></div>
    <div class="fld"><label>${t('password')}</label><input name="password" type="password" minlength="6" required placeholder="••••••" autocomplete="${authTab==='login'?'current-password':'new-password'}"></div>
    ${authTab==='signup'?`
      <div class="fgrid">
        <div class="fld"><label>${t('blood')}</label><select name="blood_group">${GROUPS.map(g=>`<option value="${g}">${g}</option>`).join('')}</select></div>
        <div class="fld"><label>${t('wil')}</label><select name="wilaya">${WILAYAS.map(w=>`<option value="${esc(w)}" ${w==='Alger'?'selected':''}>${esc(w)}</option>`).join('')}</select></div>
      </div>
      <div class="fgrid">
        <div class="fld"><label>${t('phone')}</label><input name="phone" type="tel" placeholder="+213550000000"></div>
        <div class="fld"><label>${t('birth')}</label><input name="birth_date" type="date"></div>
      </div>
      ${healthQuestionsHTML({})}
      <label class="chk"><span>${t('isDonorLbl')}</span><input type="checkbox" name="is_donor" checked style="width:20px;height:20px;accent-color:#d6121f"></label>
    `:''}
    <button class="btn" type="submit" ${busy?'disabled':''}>${authTab==='login'?t('submitLogin'):t('submitSignup')}</button>
  </form>
  <button class="linkbtn" data-go="#/home">${t('browseGuest')}</button>
</div></div>`,

home:()=>{
  const av=currentProfile?esc(currentProfile.avatar||'me'):'me';
  const unread=unreadCount();
  return `<div class="scr"><div class="bg"></div>${cells([['cells','bottom:76px;inset-inline-end:-56px;width:126px;opacity:.4'],['cell','top:62%;inset-inline-start:-22px;width:48px;opacity:.22;transform:rotate(-18deg)']])}<div class="body">
    <div class="brand">
      <img src="assets/logo.webp?v=24" alt=""><b>BAK</b>
      <div class="acct">
        ${currentUser
          ?`<button class="avbtn" data-go="#/profile" aria-label="profile"><img src="assets/${av}.webp" alt=""></button>`
          :`<button class="loginpill" data-go="#/auth">${ic('user')}<span>${t('loginBtn')}</span></button>`}
        <button aria-label="notifications" data-go="#/notifications">${ic('bell')}${unread>0?'<i></i>':''}</button>
      </div>
    </div>
    <div class="hero">${ecg()}<img src="assets/drop-hand.webp" alt=""><h3><span>${t('h1')}</span><span>${t('h2')}</span><span>${t('h3')}</span></h3><p>${t('sub')}</p></div>
    <button class="btn" data-go="#/donate">${ic('drop')}<span>${t('donate')}</span>${ic('chev','chev')}</button>
    <div class="tiles">
      <button class="tile" data-go="#/map" style="background-image:url(assets/tile-find.webp)"><span>${t('find')}</span></button>
      <button class="tile" data-go="${currentUser?'#/profile':'#/auth/signup'}" style="background-image:url(assets/tile-join.webp)"><span>${t('join')}</span></button>
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
  const p=currentProfile||{full_name:currentUser?.email||'BAK',blood_group:'O+',wilaya:t('city'),birth_date:'',avatar:'me',is_donor:true,eligibility_status:'eligible'};
  const elig=p.eligibility_status||'eligible';
  return `<div class="scr"><div class="bg"></div>${cells([['cell','top:30%;left:-24px;width:90px'],['cell','top:22%;right:-16px;width:80px;transform:rotate(40deg)']])}<div class="body pf">
    ${hd(t('prof'),`<button data-go="#/edit-profile" aria-label="edit" style="color:#e0212e">${ic('pen')}</button>`)}
    <div class="phw">${ecg('')}<div class="ph"><img src="assets/${esc(p.avatar||'me')}.webp" alt=""><button data-go="#/edit-profile" aria-label="photo">${ic('cam')}</button></div></div>
    <h2>${esc(p.full_name)}</h2>
    <p>${p.is_donor?`${t('eng')} ❤️`:t('notDonor')}</p>
    <div class="elig ${esc(elig)}">${t('elig_'+elig)}</div>
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
      <div class="avpick">${AVATARS.map(av=>`<button type="button" data-av="${av}" class="${(p.avatar||'me')===av?'on':''}"><img src="assets/${av}.webp" alt="${av}"></button>`).join('')}</div>
      <input type="hidden" name="avatar" value="${esc(p.avatar||'me')}">
      <div class="fld"><label>${t('fullName')}</label><input name="full_name" required value="${esc(p.full_name)}"></div>
      <div class="fgrid">
        <div class="fld"><label>${t('blood')}</label><select name="blood_group">${GROUPS.map(g=>`<option value="${g}" ${p.blood_group===g?'selected':''}>${g}</option>`).join('')}</select></div>
        <div class="fld"><label>${t('wil')}</label><select name="wilaya">${WILAYAS.map(w=>`<option value="${esc(w)}" ${p.wilaya===w?'selected':''}>${esc(w)}</option>`).join('')}</select></div>
      </div>
      <div class="fgrid">
        <div class="fld"><label>${t('phone')}</label><input name="phone" type="tel" value="${esc(p.phone||'')}" placeholder="+213550000000"></div>
        <div class="fld"><label>${t('birth')}</label><input name="birth_date" type="date" value="${esc(p.birth_date||'')}"></div>
      </div>
      ${healthQuestionsHTML(p)}
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
      <img src="assets/map.webp" alt="map">
      <div id="map"></div>
      <form id="mapSearchForm" class="msearch">
        <input id="mapSearchInput" type="search" placeholder="${t('mapSearchPh')}" autocomplete="off">
        <button type="submit" aria-label="search">${ic('search')}</button>
      </form>
      <div class="mctl">
        <button data-mall aria-label="all">${ic('drop')}</button>
        <button data-mme aria-label="locate">${ic('pin')}</button>
        <button data-mzin aria-label="zoom in" style="font-weight:900;font-size:20px">+</button>
        <button data-mzout aria-label="zoom out" style="font-weight:900;font-size:20px">−</button>
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
        <div class="fld"><label>${t('wil')}</label><select name="wilaya">${WILAYAS.map(wi=>`<option value="${esc(wi)}" ${w===wi?'selected':''}>${esc(wi)}</option>`).join('')}</select></div>
      </div>
      <div class="fld"><label>${t('reqMsg')}</label><textarea name="message" rows="3" placeholder="${esc(hospitalsForWilaya(w)[0]||'CHU Mustapha Pacha')}..."></textarea></div>
      <button class="btn" type="submit" ${busy?'disabled':''}>${t('sendReq')}</button>
    </form>
  </div>${nav('search')}</div>`;
},

donate:()=>{
  const p=currentProfile||{blood_group:'O+',wilaya:'Alger'};
  const w=(donateWilaya&&WILAYAS.includes(donateWilaya))?donateWilaya:(WILAYAS.includes(p.wilaya)?p.wilaya:'Alger');
  donateWilaya=w;
  const hospList=hospitalsForWilaya(w);
  const today=new Date().toISOString().slice(0,10);
  return `<div class="scr"><div class="bg"></div><div class="body">${hd(t('donateTitle'))}
    <form id="donateForm" class="fcard">
      <div class="fld"><label>${t('wil')}</label>
        <select id="donateWilaya" name="wilaya">${WILAYAS.map(wi=>`<option value="${esc(wi)}" ${w===wi?'selected':''}>${esc(wi)}</option>`).join('')}</select>
      </div>
      <div class="fld">
        <div class="hosp-top">
          <label>${t('hospital')}</label>
          <button type="button" class="hosp-geo" data-findhosp>${ic('pin')}<span>${t('hospSearchBtn')}</span></button>
        </div>
        <div id="hospPresets" class="pres">${hospList.map(h=>`<button type="button" data-hosp="${esc(h)}">${esc(h)}</button>`).join('')}</div>
        <input id="hospInput" name="hospital" required placeholder="${esc(hospList[0]||'Hôpital Central')}">
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

thanks:()=>`<div class="scr thx"><div class="bg"></div>${cells([['cell','top:6%;left:-14px;width:76px;transform:rotate(-25deg)'],['cell','bottom:12%;right:-18px;width:86px']])}<img class="bag" src="assets/bag.webp" alt=""><div class="ring">${ic('check')}</div><h2>${t('thx')}</h2><p>${t('thxT')}</p><div class="hr">${ecg()}${ic('heart')}</div><div class="q">${t('tog')}</div><button class="btn" data-go="#/donations"><span>${t('viewDonations')}</span>${ic('chev','chev')}</button><button class="linkbtn" style="position:absolute;bottom:8px" data-go="#/home">${t('back')}</button></div>`,

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
    <img src="assets/logo.webp?v=24" alt="BAK" style="width:88px;margin-bottom:8px">
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
    ?r.map(d=>`<div class="row" data-go="#/map/${esc(d.id)}"><span class="av"><img src="assets/${esc(d.a)}.webp" alt=""><i></i></span><div class="inf"><b>${esc(d.n)}</b><span class="meta">${ic('drop','red')}<em>${esc(d.g)}</em><small>${esc(d.w)}</small></span></div><span class="dist">${ic('pin')}${d.d} km</span><button class="plus" data-req="${esc(d.id)}" aria-label="+">${ic('plus')}</button></div>`).join('')
    :`<div class="empty">${t('noDonors')}</div>`;
}

/* ---------- Free Map Engine (Leaflet + OpenStreetMap, No API Key) ---------- */
let mapCtl=null;
const pinSVG=(s,sel)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${Math.round(s*1.25)}" viewBox="0 0 24 30"><path d="M12 1c4 5.2 8 9.6 8 14.2a8 8 0 0 1-16 0C4 10.6 8 6.2 12 1z" fill="#d6121f" stroke="#fff" stroke-width="${sel?1.6:1.2}"/>${sel?'<path d="M12 21s-4.6-2.9-4.6-6.2a2.6 2.6 0 0 1 4.6-1.6 2.6 2.6 0 0 1 4.6 1.6c0 3.3-4.6 6.2-4.6 6.2z" fill="#fff"/>':''}</svg>`;
const loadScript=(src,css)=>Promise.all([
  css?new Promise(r=>{const l=document.createElement('link');l.rel='stylesheet';l.href=css;l.onload=r;l.onerror=r;document.head.appendChild(l)}):Promise.resolve(),
  new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})
]);

function spreadPositions(pool){
  const seen={};
  const coords={};
  pool.forEach(d=>{
    const key=`${Number(d.lat).toFixed(3)},${Number(d.lng).toFixed(3)}`;
    const idx=seen[key]||0;
    seen[key]=idx+1;
    if(idx===0){
      coords[d.id]=[d.lat,d.lng];
    }else{
      const angle=(idx*137.5)*Math.PI/180;
      const radius=0.005*Math.sqrt(idx);
      coords[d.id]=[d.lat+Math.sin(angle)*radius,d.lng+Math.cos(angle)*radius];
    }
  });
  return coords;
}

function leafletEngine(el,pool,start,pick){
  const m=L.map(el,{zoomControl:false,attributionControl:false,zoomSnap:.5});
  L.control.attribution({position:'topleft',prefix:false}).addTo(m);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(m);
  const mk={};
  const pos=spreadPositions(pool);
  const icon=on=>L.divIcon({className:'pin',html:pinSVG(on?42:28,on),iconSize:on?[42,52]:[28,35],iconAnchor:on?[21,52]:[14,35]});
  pool.forEach(d=>{
    const ll=pos[d.id]||[d.lat,d.lng];
    mk[d.id]=L.marker(ll,{icon:icon(start&&d.id===start.id),zIndexOffset:start&&d.id===start.id?1000:0}).addTo(m);
    mk[d.id].bindTooltip(`${d.n} (${d.g})`,{direction:'top',offset:[0,-32]});
    mk[d.id].on('click',()=>pick(d.id));
  });
  let cur=start?start.id:null,me=null,placeMk=null;
  if(start){
    const ll=pos[start.id]||[start.lat,start.lng];
    m.setView(ll,12,{animate:false});
    m.panBy([0,90],{animate:false});
  }else{
    m.setView([36.7538,3.0588],6,{animate:false});
  }
  setTimeout(()=>{try{m.invalidateSize()}catch(_e){}},160);
  return{
    select(d){
      if(cur&&mk[cur]){mk[cur].setIcon(icon(false));mk[cur].setZIndexOffset(0)}
      cur=d.id;
      if(mk[cur]){mk[cur].setIcon(icon(true));mk[cur].setZIndexOffset(1000)}
      const ll=pos[d.id]||[d.lat,d.lng];
      m.setView(ll,Math.max(m.getZoom(),12),{animate:true});
      m.panBy([0,90],{animate:true});
    },
    all(){
      if(pool.length){
        m.fitBounds(L.latLngBounds(pool.map(d=>pos[d.id]||[d.lat,d.lng])),{padding:[48,48]});
      }else{
        m.setView([36.7538,3.0588],6,{animate:true});
      }
    },
    me(p){
      if(me)me.remove();
      me=L.circleMarker([p.lat,p.lng],{radius:8,color:'#fff',weight:3,fillColor:'#2a7bff',fillOpacity:1}).addTo(m);
      m.setView([p.lat,p.lng],13);
    },
    focus(p,label){
      if(placeMk)placeMk.remove();
      placeMk=L.circleMarker([p.lat,p.lng],{radius:7,color:'#fff',weight:2.5,fillColor:'#e0212e',fillOpacity:.9}).addTo(m);
      if(label)placeMk.bindTooltip(label,{permanent:false,direction:'top'}).openTooltip();
      m.setView([p.lat,p.lng],13,{animate:true});
      m.panBy([0,60],{animate:true});
    },
    zoomIn(){m.zoomIn()},
    zoomOut(){m.zoomOut()},
    destroy(){m.remove()}
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
    if(!window.L){
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      );
    }
    if(document.getElementById('map')!==el)return;
    mapCtl=leafletEngine(el,pool,start,pick);
    const mall=document.querySelector('[data-mall]');if(mall)mall.onclick=()=>mapCtl&&mapCtl.all();
    const mzin=document.querySelector('[data-mzin]');if(mzin)mzin.onclick=()=>mapCtl&&mapCtl.zoomIn();
    const mzout=document.querySelector('[data-mzout]');if(mzout)mzout.onclick=()=>mapCtl&&mapCtl.zoomOut();
    const mme=document.querySelector('[data-mme]');
    if(mme)mme.onclick=()=>{
      if(!navigator.geolocation)return toast(t('geoErr'));
      navigator.geolocation.getCurrentPosition(async p=>{
        userCoords={lat:p.coords.latitude,lng:p.coords.longitude};
        if(mapCtl)mapCtl.me(userCoords);
        await loadDonors();
      },()=>toast(t('geoErr')),{timeout:8000});
    };
    const msf=document.getElementById('mapSearchForm');
    if(msf)msf.onsubmit=async e=>{
      e.preventDefault();
      const inp=document.getElementById('mapSearchInput');
      const query=(inp&&inp.value||'').trim();
      if(query.length<2)return;
      try{
        const res=await api(`/api/geocode?q=${encodeURIComponent(query)}&lang=${encodeURIComponent(lang)}`);
        const hit=res.results&&res.results[0];
        if(hit&&mapCtl){
          mapCtl.focus({lat:hit.lat,lng:hit.lng},hit.name.split(',')[0]);
        }else{
          toast(t('mapSearchNone'));
        }
      }catch(_err){
        toast(t('mapSearchNone'));
      }
    };
  }catch(_e){
    el.remove();
    document.querySelectorAll('.mctl,.msearch').forEach(x=>x.remove());
  }
}

function parseHealthForm(fdObj){
  if('gender' in fdObj)fdObj.gender=fdObj.gender==='female'?'female':'male';
  if('pregnant_or_breastfeeding' in fdObj)fdObj.pregnant_or_breastfeeding=fdObj.gender==='female'&&fdObj.pregnant_or_breastfeeding==='true';
  if('weight_over_50' in fdObj)fdObj.weight_over_50=fdObj.weight_over_50==='true';
  if('has_chronic_illness' in fdObj)fdObj.has_chronic_illness=fdObj.has_chronic_illness==='true';
  if('recent_surgery_or_tattoo' in fdObj)fdObj.recent_surgery_or_tattoo=fdObj.recent_surgery_or_tattoo==='true';
  if('taking_medication' in fdObj)fdObj.taking_medication=fdObj.taking_medication==='true';
}

/* ---------- Form Wiring ---------- */
function bindForms(){
  const af=document.getElementById('authForm');
  if(af)af.onsubmit=async e=>{
    e.preventDefault();
    if(busy)return;
    const fdObj=Object.fromEntries(new FormData(af).entries());
    fdObj.is_donor=!!af.querySelector('[name="is_donor"]')?.checked;
    parseHealthForm(fdObj);
    busy=true;authErr='';authOk='';render();
    try{
      const endpoint=authTab==='login'?'/api/auth/login':'/api/auth/signup';
      const res=await api(endpoint,{method:'POST',body:JSON.stringify(fdObj)});
      if(res.emailConfirmationRequired){
        pendingEmail=fdObj.email||'';
        authOk=t('checkEmail');
        authTab='login';
      }else{
        pendingEmail='';
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
      authErr=err.code==='EMAIL_EXISTS'?t('emailExists'):err.message;
      if(err.code==='EMAIL_EXISTS')authTab='login';
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
    parseHealthForm(fdObj);
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

  const dw=document.getElementById('donateWilaya');
  if(dw)dw.onchange=()=>{
    donateWilaya=dw.value;
    const listH=hospitalsForWilaya(donateWilaya);
    const pr=document.getElementById('hospPresets');
    const hi=document.getElementById('hospInput');
    if(pr)pr.innerHTML=listH.map(h=>`<button type="button" data-hosp="${esc(h)}">${esc(h)}</button>`).join('');
    if(hi)hi.placeholder=listH[0]||'';
  };
  const hiEl=document.getElementById('hospInput');
  if(hiEl)hiEl.oninput=()=>{
    const curVal=hiEl.value.trim().toLowerCase();
    document.querySelectorAll('#hospPresets button').forEach(b=>b.classList.toggle('on',b.dataset.hosp.toLowerCase()===curVal));
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

/* ---------- Real Asset Preloader ---------- */
const PRELOAD_ASSETS=[
  'assets/logo.webp?v=24','assets/torn-tr.webp','assets/torn-bl.webp','assets/cell.webp','assets/cells.webp',
  'assets/drop-hand.webp','assets/tile-find.webp','assets/tile-join.webp','assets/bar-learn.webp',
  'assets/paper.webp','assets/paper-wide.webp','assets/paper-lines2.webp','assets/paper-lines3.webp',
  'assets/paper-tall-lines.webp','assets/bar.webp','assets/bag.webp','assets/map.webp',
  'assets/me.webp','assets/av1.webp','assets/av2.webp','assets/av3.webp','assets/av4.webp','assets/av5.webp'
];
const preloadedImgs=[];
let preloadPct=4;
let preloadDone=false;
let preloadPromise=null;
let authPromise=null;

function setSplashBar(pct){
  preloadPct=pct;
  const bar=document.querySelector('.splash .pbar i');
  if(bar)bar.style.width=pct+'%';
}

function loadImgAsset(src){
  return new Promise(resolve=>{
    const img=new Image();
    img.decoding='async';
    let settled=false;
    const finish=()=>{
      if(settled)return;
      settled=true;
      resolve();
    };
    const tOut=setTimeout(finish,5000);
    const doneOk=()=>{
      clearTimeout(tOut);
      if(typeof img.decode==='function'){
        img.decode().catch(()=>{}).finally(finish);
      }else{
        finish();
      }
    };
    img.onload=doneOk;
    img.onerror=()=>{clearTimeout(tOut);finish()};
    img.src=src;
    preloadedImgs.push(img);
    if(img.complete&&img.naturalWidth>0)doneOk();
  });
}

function startPreload(){
  if(preloadPromise)return preloadPromise;
  const total=PRELOAD_ASSETS.length+1;
  let completed=0;
  const bump=()=>{
    completed++;
    setSplashBar(Math.max(4,Math.min(100,Math.round((completed/total)*100))));
  };
  const imgTasks=PRELOAD_ASSETS.map(src=>loadImgAsset(src).then(bump));
  const fontsReady=document.fonts&&document.fonts.ready
    ?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))])
    :Promise.resolve();
  const initTask=Promise.all([authPromise||Promise.resolve(),fontsReady]).then(bump);
  preloadPromise=Promise.all([...imgTasks,initTask]).then(()=>{
    preloadDone=true;
    setSplashBar(100);
  });
  return preloadPromise;
}

/* ---------- Router & Render ---------- */
let timer;
const navStack=[];
let goingBack=false;
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

  if(r!=='splash'){
    const cur='#/'+h;
    if(!goingBack&&navStack[navStack.length-1]!==cur){
      navStack.push(cur);
    }
    goingBack=false;
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
    setSplashBar(preloadDone?100:preloadPct);
    startPreload().then(()=>{
      timer=setTimeout(()=>{
        const curH=location.hash.replace('#/','')||'splash';
        if(curH==='splash'){
          location.replace(currentUser?'#/home':'#/auth');
        }
      },240);
    });
  }
}

document.addEventListener('click',async e=>{
  const ynBtn=e.target.closest('.yn button');
  if(ynBtn){
    const wrap=ynBtn.closest('.yn');
    const val=ynBtn.dataset.val;
    const inp=wrap.querySelector('input[type="hidden"]');
    if(inp)inp.value=val;
    wrap.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===ynBtn));
    if(wrap.dataset.yn==='has_chronic_illness'){
      const det=document.getElementById('illnessDetailsWrap');
      if(det)det.style.display=val==='true'?'flex':'none';
    }else if(wrap.dataset.yn==='gender'){
      const pw=document.getElementById('pregnantWrap');
      if(pw){
        pw.style.display=val==='female'?'block':'none';
        if(val!=='female'){
          const pi=pw.querySelector('input[name="pregnant_or_breastfeeding"]');
          if(pi)pi.value='false';
          pw.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.val==='false'));
        }
      }
    }
    return;
  }

  const reqBtn=e.target.closest('[data-req]');
  if(reqBtn){
    e.stopPropagation();
    const id=reqBtn.dataset.req;
    if(requireLogin('#/request/'+id))location.hash='#/request/'+id;
    return;
  }

  const x=e.target.closest('[data-go],[data-back],[data-g],[data-w],[data-l],[data-t],[data-atab],[data-av],[data-hosp],[data-findhosp],[data-comp],[data-del],[data-nread],[data-dark],[data-togglefilter],[data-cyclegrp],[data-logout],[data-resend],[data-toast]');
  if(!x)return;

  if(x.dataset.go){
    location.hash=x.dataset.go;
  }else if('back' in x.dataset){
    if(navStack.length>0)navStack.pop();
    const prev=navStack[navStack.length-1]||'#/home';
    goingBack=true;
    location.hash=prev;
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
    document.querySelectorAll('#hospPresets button').forEach(b=>b.classList.toggle('on',b===x));
  }else if('findhosp' in x.dataset){
    const lbl=x.querySelector('span');
    if(lbl)lbl.textContent=t('hospSearching');
    x.disabled=true;
    try{
      const dw=document.getElementById('donateWilaya');
      const w=(dw&&dw.value)||donateWilaya||'Alger';
      let coords=null;
      if(navigator.geolocation){
        coords=await new Promise(res=>{
          navigator.geolocation.getCurrentPosition(p=>res({lat:p.coords.latitude,lng:p.coords.longitude}),()=>res(null),{timeout:4500});
        });
      }
      const qs=new URLSearchParams({wilaya:w,lang});
      if(coords){qs.set('lat',coords.lat);qs.set('lng',coords.lng)}
      const res=await api('/api/hospitals?'+qs.toString());
      const names=(res.hospitals||[]).map(h=>h.name).filter(Boolean);
      if(names.length){
        extraHospitals[w]=names;
        const listH=hospitalsForWilaya(w);
        const pr=document.getElementById('hospPresets');
        const hi=document.getElementById('hospInput');
        const cur=(hi&&hi.value.trim().toLowerCase())||'';
        if(pr)pr.innerHTML=listH.map(h=>`<button type="button" data-hosp="${esc(h)}" class="${h.toLowerCase()===cur?'on':''}">${esc(h)}</button>`).join('');
      }else{
        toast(t('hospNone'));
      }
    }catch(_err){
      toast(t('hospNone'));
    }finally{
      if(lbl)lbl.textContent=t('hospSearchBtn');
      x.disabled=false;
    }
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
  }else if('resend' in x.dataset){
    if(!pendingEmail)return;
    try{
      await api('/api/auth/resend',{method:'POST',body:JSON.stringify({email:pendingEmail})});
      toast(t('resendSent'));
    }catch(err){toast(err.message)}
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
  if(location.hash&&(location.hash.includes('access_token=')||location.hash.includes('error_description='))){
    const hp=new URLSearchParams(location.hash.replace(/^#/, ''));
    const at=hp.get('access_token');
    const rt=hp.get('refresh_token');
    const ed=hp.get('error_description');
    if(at){
      saveSession({access_token:at,refresh_token:rt||''});
      history.replaceState(null,'',location.pathname+location.search+'#/home');
    }else if(ed){
      authErr=ed;
      history.replaceState(null,'',location.pathname+location.search+'#/auth');
    }
  }
  authPromise=hydrateAuth().catch(()=>false);
  loadDonors().catch(()=>{});
  const initH=location.hash.replace('#/','')||'splash';
  if(initH==='splash'){
    render();
  }else{
    startPreload();
    await authPromise;
    render();
  }
})();

if('serviceWorker' in navigator&&/^https:|localhost/.test(location.protocol+location.hostname)){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
})();
