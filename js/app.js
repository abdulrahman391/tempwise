/* TempWise demo app — zones, sensors, settings, account.
 * Settings are shared between open windows through js/sync.js (localStorage).
 * Sensor readings are simulated. */
(() => {
/* ================= icons ================= */
const I = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg>',
  sensor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 12.5a10 10 0 0114 0"/><path d="M8.5 15.5a5 5 0 017 0"/><circle cx="12" cy="19" r="1.3" fill="currentColor"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>',
  refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-2.6-6.4L21 8"/><path d="M21 3v5h-5"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  flame:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/></svg>',
  drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3s7 7.5 7 12a7 7 0 01-14 0c0-4.5 7-12 7-12z"/></svg>',
  wifi:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 8.5a15 15 0 0120 0"/><path d="M5 12a10 10 0 0114 0"/><path d="M8.5 15.5a5 5 0 017 0"/><path d="M3 3l18 18"/></svg>',
  leaf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 014 13c0-6 7-10 16-10 0 9-4 16-10 16"/><path d="M4 21c3-6 7-9 11-11"/></svg>',
  people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6.5 6.5 0 013.5 6"/></svg>',
  snow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M4 7l16 10M20 7L4 17"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  therm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 14.8V5a2 2 0 10-4 0v9.8a4 4 0 104 0z"/></svg>',
  palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16" cy="10" r="1.2" fill="currentColor"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
  laptop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/></svg>',
  wave:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 00-4 0v5M14 10V4a2 2 0 00-4 0v6M10 10.5V6a2 2 0 00-4 0v8a8 8 0 0016 0v-2a2 2 0 00-4 0"/></svg>',
};
let _lid=0;
const logo = () => { const n=++_lid; return `<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient><linearGradient id="lh${n}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--heat)"/><stop offset="1" stop-color="#ffd166"/></linearGradient></defs><path d="M8 30L32 9l24 21" fill="none" stroke="url(#lg${n})" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 27v26h36V27" fill="none" stroke="url(#lg${n})" stroke-width="4" stroke-linejoin="round" opacity=".55"/><rect x="28" y="21" width="8" height="22" rx="4" fill="none" stroke="#e7f0f8" stroke-width="3"/><circle cx="32" cy="46" r="6.5" fill="url(#lh${n})"/><rect x="30.5" y="30" width="3" height="14" rx="1.5" fill="url(#lh${n})"/></svg>`; };

/* ================= model ================= */
const DEFAULTS = {
  zones:{
    gym:{name:'Gym floor',sensor:'Sensor 01',target:21,mode:'cool'},
    shop:{name:'Workshop',sensor:'Sensor 02',target:20,mode:'auto'},
    work:{name:'Loading bay',sensor:'Sensor 03',target:22,mode:'auto'},
    store:{name:'Storage room',sensor:'Sensor 04',target:18,mode:'off'},
  },
  settings:{
    units:'C',
    notifications:{push:true,email:false,highTemp:true,humidity:true,offline:true},
    automation:{eco:true,occupancy:true,precool:false},
    thresholds:{high:28,humidity:65},
    schedule:{open:'06:00',close:'22:00'},
    accent:'#2fa8ff',
  }
};
const ZONES = ['gym','shop','work','store'];
const OFFLINE = new Set(['store']);
const ACCENTS = ['#2fa8ff','#1fd1c4','#3ddc97','#ffb347','#ff6b8a'];
const LABELS = {
  'settings.units':'Temperature unit','settings.accent':'Accent color',
  'settings.notifications.push':'Push notifications','settings.notifications.email':'Email digest',
  'settings.notifications.highTemp':'High-temperature alerts','settings.notifications.humidity':'Humidity alerts','settings.notifications.offline':'Offline sensor alerts',
  'settings.automation.eco':'Eco schedule','settings.automation.occupancy':'Occupancy cooling','settings.automation.precool':'Pre-cool before opening',
  'settings.thresholds.high':'High-temperature limit','settings.thresholds.humidity':'Humidity limit',
  'settings.schedule.open':'Opening time','settings.schedule.close':'Closing time',
};
function labelFor(p){
  if (LABELS[p]) return LABELS[p];
  const m = p.match(/^zones\.(\w+)\.(target|mode)$/);
  if (m) return `${synced.zones[m[1]]?.name||m[1]} ${m[2]==='target'?'target':'mode'}`;
  return p;
}

const clone = o => JSON.parse(JSON.stringify(o));
const getPath = (o,p) => p.split('.').reduce((a,k)=>a==null?a:a[k],o);
function setPath(o,p,v){const ks=p.split('.');let a=o;for(let i=0;i<ks.length-1;i++){a[ks[i]]=a[ks[i]]&&typeof a[ks[i]]==='object'?a[ks[i]]:{};a=a[ks[i]];}a[ks[ks.length-1]]=v;}
function mergeDefaults(d,s){ if(s==null||typeof d!=='object'||Array.isArray(d)) return s==null?clone(d):s; const out={}; for(const k of Object.keys(d)) out[k]=(s&&typeof s==='object'&&k in s)?mergeDefaults(d[k],s[k]):clone(d[k]); return out; }
function leaves(o,pre='',out={}){for(const k of Object.keys(o)){const p=pre?pre+'.'+k:k;const v=o[k];if(v&&typeof v==='object')leaves(v,p,out);else out[p]=v;}return out;}

const ls = { get(k){try{return localStorage.getItem('tempwise:'+k)}catch{return null}}, set(k,v){try{localStorage.setItem('tempwise:'+k,v)}catch{}} };
const ss = { get(k){try{return sessionStorage.getItem(k)}catch{return null}}, set(k,v){try{sessionStorage.setItem(k,v)}catch{}} };

/* This device (one id per tab/session so two tabs can test sync) */
const DEV = (() => {
  let id = ss.get('tw-dev'); if(!id){ id='d'+Math.random().toString(36).slice(2,10); ss.set('tw-dev',id); }
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua)?'iPhone':/iPad/.test(ua)?'iPad':/Android/.test(ua)?'Android':/Mac/.test(ua)?'Mac':/Windows/.test(ua)?'Windows PC':/Linux/.test(ua)?'Linux':'Device';
  const br = /Edg\//.test(ua)?'Edge':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)?'Safari':'Browser';
  const mobile = /iPhone|Android|iPad/.test(ua);
  return {id,name:`${br} on ${os} (tab ${id.slice(-3)})`,mobile};
})();

let synced = clone(DEFAULTS);          // what every device shares
let overlay = {};                      // local-only changes: {path:value}
try{ overlay = JSON.parse(ss.get('tw-overlay')||'{}')||{} }catch{ overlay={} }
let localMode = ss.get('tw-local')==='1';
let devices = {};
let lastWriter = null;
let syncState = 'connecting';          // connecting | synced | saving | offline | error
let syncMsg = '';
let lastSyncAt = null;
let me = {name:'',avatarUrl:''};
let screen = ls.get('tw-signed')==='1' ? (ss.get('tw-screen')||'home') : 'login';
let zoneSel = ss.get('tw-zone')||'gym';
let flashKeys = new Set();

const eff = p => (p in overlay) ? overlay[p] : getPath(synced,p);
const isLocal = p => (p in overlay) && overlay[p] !== getPath(synced,p);
const localCount = () => Object.keys(overlay).filter(isLocal).length;
function saveOverlay(){ for(const k of Object.keys(overlay)) if(!isLocal(k)) delete overlay[k]; ss.set('tw-overlay',JSON.stringify(overlay)); }

/* ================= sync (db) ================= */
let hasLoaded = false;
let ref = null, writing = false, dirty = false, writeTimer = null;

function setValue(p,v){
  if (localMode){ overlay[p]=v; saveOverlay(); render(); return; }
  delete overlay[p]; saveOverlay();
  setPath(synced,p,v);
  applyAccent(); render(); scheduleWrite();
}
function scheduleWrite(){
  if (!ref){ return; }
  clearTimeout(writeTimer); syncState='saving'; paintSync();
  writeTimer = setTimeout(()=>{ writeTimer=null; flush(); }, 450);
}
async function flush(retried){
  if (!ref) return;
  if (writing){ dirty=true; return; }
  writing = true;
  const at = Date.now();
  const devs = {...devices,[DEV.id]:{name:DEV.name,mobile:DEV.mobile,at}};
  const keep = Object.entries(devs).sort((a,b)=>b[1].at-a[1].at).slice(0,8);
  devices = Object.fromEntries(keep);
  const body = {state:clone(synced), lastWriter:{device:DEV.id,name:DEV.name,at}, devices};
  try{
    await ref.set(body);
    lastWriter = body.lastWriter; lastSyncAt = at; syncState='synced'; syncMsg='';
  }catch(e){
    writing=false;
    if (e && e.code==='unavailable' && !retried){ setTimeout(()=>flush(true), 600+Math.random()*800); return; }
    syncState='error';
    syncMsg = e && e.code==='invalid_argument' ? 'You can view settings but not change them on this page.' : 'Couldn’t save to your other devices. Your change is kept here; try Refresh.';
  }
  writing=false; paintSync();
  if (dirty){ dirty=false; flush(); }
}
function applyRemote(snap, manual){
  const initial = !hasLoaded; hasLoaded = true;
  if (!snap.exists){ syncState='synced'; lastSyncAt=Date.now(); paintSync(); return; }
  if (snap.metadata && snap.metadata.hasPendingWrites) return;
  if (writeTimer || writing) return;   // our newer edit is on its way; it wins
  const d = snap.data()||{};
  const before = leaves(synced);
  synced = mergeDefaults(DEFAULTS, d.state);
  devices = d.devices||{};
  const after = leaves(synced);
  const changed = Object.keys(after).filter(k=>after[k]!==before[k]);
  const lw = d.lastWriter;
  const fromOther = lw && lw.device!==DEV.id && (!lastWriter || lw.at>lastWriter.at);
  lastWriter = lw||lastWriter; lastSyncAt = Date.now(); syncState='synced'; syncMsg='';
  applyAccent();
  if (changed.length && !initial && (fromOther || manual)){
    flashKeys = new Set(changed.map(k=>k.split('.').slice(0,2).join('.')));
    const what = changed.length===1 ? labelFor(changed[0]) : `${labelFor(changed[0])} and ${changed.length-1} more`;
    toast(`${what} updated from ${lw&&lw.device!==DEV.id?lw.name:'another device'}`);
    setTimeout(()=>{flashKeys.clear();},1700);
  } else if (manual){ toast('Everything is up to date'); }
  saveOverlay(); render();
}
async function refresh(btn){
  if (btn){ btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin'); }
  if (!ref){ toast('Sync isn’t available in this view'); return; }
  try{ applyRemote(await ref.get(), true); }
  catch(e){ syncState='error'; syncMsg='Couldn’t reach your other devices. Check your connection and try again.'; paintSync(); }
}
async function connect(){
  const sync = window.TempWiseSync;
  const prof = sync ? sync.profile() : {name:''};
  me = {name:prof.name||'', avatarUrl:''};
  ref = sync ? sync.open() : null;
  if (!ref){ syncState='offline'; render(); return; }
  ref.onSnapshot(s=>applyRemote(s,false), e=>{ syncState='error'; syncMsg='Live sync stopped. Reload the page to reconnect.'; paintSync(); });
  render();
}

/* ================= helpers ================= */
const units = () => eff('settings.units');
const fmt = (c,dec) => { const v = units()==='F' ? c*9/5+32 : c; return v.toFixed(dec ?? (units()==='F'?0:1)); };
const deg = () => '°'+units();
function ago(t){ if(!t) return 'never'; const s=Math.round((Date.now()-t)/1000); if(s<10) return 'just now'; if(s<60) return s+' s ago'; const m=Math.round(s/60); if(m<60) return m+' min ago'; const h=Math.round(m/60); return h<24? h+' h ago' : Math.round(h/24)+' d ago'; }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function applyAccent(){ document.documentElement.style.setProperty('--accent', eff('settings.accent')); }
let toastT;
function toast(msg){ const t=document.getElementById('toast'); t.innerHTML=I.refresh+'<span></span>'; t.querySelector('span').textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,3600); }

/* ================= simulated sensors ================= */
const R = { gym:{t:24.6,h:48}, shop:{t:23.1,h:66}, work:{t:22.4,h:52}, store:{t:25.3,h:58} };
const seen = { gym:Date.now()-4000, shop:Date.now()-9000, work:Date.now()-6000, store:Date.now()-18*60000 };
function tick(){
  for (const z of ZONES){
    if (OFFLINE.has(z)) continue;
    const zc = synced.zones[z];               // the real thermostat follows SYNCED targets only
    const goal = zc.mode==='off' ? 27.5 : zc.target;
    R[z].t += (goal-R[z].t)*0.06 + (Math.random()-.5)*0.08;
    R[z].h = Math.max(30,Math.min(80,R[z].h+(Math.random()-.5)*0.6));
    seen[z]=Date.now();
  }
  paintLive();
}
setInterval(tick,3000);
function zoneStatus(z){
  if (OFFLINE.has(z)) return {k:'bad',t:'Offline'};
  const th = eff('settings.thresholds');
  if (R[z].t>=th.high) return {k:'bad',t:'Too hot'};
  if (R[z].h>=th.humidity) return {k:'warn',t:'Humid'};
  return {k:'ok',t:'Normal'};
}

/* ================= views ================= */
function sw(path){ const on=!!eff(path); return `<button class="sw" role="switch" aria-checked="${on}" data-toggle="${path}" aria-label="${esc(LABELS[path]||path)}"></button>`; }
const ltag = p => isLocal(p) ? `<span class="tag local">Local</span>` : '';

function topbar(){
  return `<div class="top">
    <div class="brand">${logo()}<b>Temp<span>Wise</span></b></div>
    <div class="top-actions">
      <span class="sync" id="sync" data-s="${syncState}"><span class="dot"></span><span id="synctxt"></span></span>
      <button class="iconbtn" data-act="refresh" aria-label="Refresh from other windows" title="Refresh from other windows">${I.refresh}</button>
      <button class="localtoggle" data-act="local" aria-pressed="${localMode}" title="Try changes on this device only"><span class="sw" aria-checked="${localMode}"></span>Local mode</button>
    </div>
  </div>
  ${localMode || localCount() ? `<div class="banner">
      <div class="txt">${localMode?`<b>Local mode is on.</b> Changes stay on this device. Thermostats and your other devices keep the synced values.`:`<b>You have local changes</b> that only this device can see.`} ${localCount()?`<span class="num">${localCount()}</span> local change${localCount()>1?'s':''}.`:''}</div>
      <button class="btn ghost" data-act="discard" ${localCount()?'':'disabled'}>Discard</button>
      <button class="btn localbtn" data-act="push" ${localCount()?'':'disabled'}>Sync to all devices</button>
    </div>` : ''}
  ${syncState==='offline' ? `<div class="banner offline"><div class="txt">Browser storage is blocked, so settings can’t be saved or shared between windows. Allow site data for this page to turn sync on.</div></div>` : ''}
  ${syncState==='error' && syncMsg ? `<div class="banner offline"><div class="txt">${esc(syncMsg)}</div><button class="btn" data-act="refresh">Refresh</button></div>` : ''}`;
}
function syncText(){
  if (syncState==='connecting') return 'Connecting…';
  if (syncState==='saving') return 'Saving to your devices…';
  if (syncState==='offline') return 'This device only';
  if (syncState==='error') return 'Sync problem';
  return `Synced · ${ago(lastSyncAt)}`;
}
function paintSync(){ const el=document.getElementById('sync'); if(!el) return render(); el.dataset.s=syncState; document.getElementById('synctxt').textContent=syncText(); }

function gauge(z){
  const MIN=10, MAX=32, A0=-210, A1=30;
  const ang = c => A0 + (Math.max(MIN,Math.min(MAX,c))-MIN)/(MAX-MIN)*(A1-A0);
  const pt = (a,r) => [100+r*Math.cos(a*Math.PI/180), 100+r*Math.sin(a*Math.PI/180)];
  const arc = (a0,a1,r) => { const [x0,y0]=pt(a0,r),[x1,y1]=pt(a1,r); return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
  const tEff = eff(`zones.${z}.target`), tSync = synced.zones[z].target, cur = R[z].t;
  const loc = isLocal(`zones.${z}.target`);
  const [tx,ty] = pt(ang(tEff),78), [sx,sy]=pt(ang(tSync),78), [cx,cy]=pt(ang(cur),66);
  const ticks = []; for(let c=MIN;c<=MAX;c+=2){ const [a,b]=pt(ang(c),90),[d,e]=pt(ang(c),c%4?94:97); ticks.push(`<line x1="${a.toFixed(1)}" y1="${b.toFixed(1)}" x2="${d.toFixed(1)}" y2="${e.toFixed(1)}" stroke="var(--line)" stroke-width="1.5"/>`); }
  return `<svg viewBox="0 0 200 172" aria-hidden="true">
    <defs><linearGradient id="ga" x1="0" x2="1"><stop offset="0" stop-color="var(--cold)"/><stop offset=".55" stop-color="var(--accent-2)"/><stop offset="1" stop-color="var(--heat)"/></linearGradient></defs>
    ${ticks.join('')}
    <path d="${arc(A0,A1,78)}" fill="none" stroke="var(--surface-2)" stroke-width="12" stroke-linecap="round"/>
    <path d="${arc(A0,ang(tEff),78)}" fill="none" stroke="url(#ga)" stroke-width="12" stroke-linecap="round"/>
    ${loc?`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5" fill="var(--bg)" stroke="var(--muted)" stroke-width="2" stroke-dasharray="2 2"/>`:''}
    <circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="9" fill="var(--fg)" stroke="${loc?'var(--local)':'var(--bg)'}" stroke-width="3"/>
    <circle data-live="curdot" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.5" fill="var(--fg)" opacity=".75"/>
  </svg>`;
}

function viewHome(){
  const z = zoneSel, zc = synced.zones[z], off = OFFLINE.has(z);
  const mode = eff(`zones.${z}.mode`), tPath=`zones.${z}.target`, loc=isLocal(tPath);
  const hour = new Date().getHours();
  const greet = hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const energy = [2.1,1.8,1.6,1.5,1.9,2.8,3.6,3.9,4.2,4.4,4.1,3.8].map((v,i)=>v*(eff('settings.automation.eco')?0.85:1));
  const nowIdx = Math.min(11,Math.floor(hour/2));
  const kwh = energy.slice(0,nowIdx+1).reduce((a,b)=>a+b,0);
  const avgH = ZONES.filter(q=>!OFFLINE.has(q)).reduce((a,q)=>a+R[q].h,0)/3;
  return `
  <div class="head"><div class="eyebrow">${esc(greet)}${me.name?', '+esc(me.name.split(' ')[0]):''}</div><h1 class="h1">Every zone, comfortable.</h1><p class="sub">Set targets here. Changes reach every open TempWise window right away.</p></div>
  <div class="chips" role="group" aria-label="Zones">
    ${ZONES.map(q=>{const s=zoneStatus(q);return `<button class="chip" data-zone="${q}" aria-pressed="${q===z}"><span class="dot" style="background:var(--${s.k==='ok'?'good':s.k})"></span>${esc(synced.zones[q].name)} <span class="t" data-live="chip-${q}">${OFFLINE.has(q)?'—':fmt(R[q].t)+'°'}</span>${isLocal(`zones.${q}.target`)||isLocal(`zones.${q}.mode`)?'<span class="tag local">L</span>':''}</button>`}).join('')}
  </div>
  <div class="grid home">
    <div class="col">
      <div class="card thermo ${flashKeys.has('zones.'+z)?'flash':''}">
        <div class="thermo-top">
          <div><h3 style="justify-content:flex-start">${esc(zc.name)} ${ltag(tPath)||ltag(`zones.${z}.mode`)}</h3><div class="meta">${esc(zc.sensor)} · ${off?'last seen '+ago(seen[z]):'live'}</div></div>
          ${(()=>{const s=zoneStatus(z);return `<span class="tag ${s.k}" data-live="status-${z}">${s.t}</span>`})()}
        </div>
        <div class="gauge" data-live="gauge">
          ${gauge(z)}
          <div class="center">
            <div class="lbl">${loc?'Local preview':'Target'}</div>
            <div class="big num" style="${loc?'color:var(--local)':''}">${mode==='off'?'Off':fmt(eff(tPath))}<sup>${mode==='off'?'':deg()}</sup></div>
            <div class="now">Now <b class="num" data-live="now-${z}">${off?'—':fmt(R[z].t)+deg()}</b></div>
          </div>
        </div>
        ${loc?`<p class="shadow-note">The thermostat is still holding ${fmt(zc.target)}${deg()}. This preview only lives on this device.</p>`:''}
        <div class="stepper">
          <button class="stepbtn" data-step="${tPath}" data-delta="-1" aria-label="Lower target" ${off||mode==='off'?'disabled':''}>−</button>
          <div class="hint">${off?'Sensor offline':mode==='off'?'Zone is off':localMode?'Changes stay on this device':'Syncs to all windows'}</div>
          <button class="stepbtn" data-step="${tPath}" data-delta="1" aria-label="Raise target" ${off||mode==='off'?'disabled':''}>+</button>
        </div>
        <div class="seg" role="group" aria-label="Mode">
          ${['cool','heat','auto','off'].map(m=>`<button data-set="zones.${z}.mode" data-value="${m}" aria-pressed="${mode===m}" ${off?'disabled':''}>${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}
        </div>
      </div>
    </div>
    <div class="col">
      <div class="card">
        <h3>Energy today <span class="meta">${eff('settings.automation.eco')?'Eco schedule on':'Eco schedule off'}</span></h3>
        <div class="stat"><span class="v num">${kwh.toFixed(1)}</span><span class="u">kWh so far</span></div>
        <div class="bars">${energy.map((v,i)=>`<i class="${i>nowIdx?'dim':''}" style="height:${(v/4.4*100).toFixed(0)}%"></i>`).join('')}</div>
        <div class="axis"><span>00:00</span><span>12:00</span><span>24:00</span></div>
      </div>
      <div class="card">
        <h3>Average humidity <span class="meta">limit ${eff('settings.thresholds.humidity')}%</span></h3>
        <div class="stat"><span class="v num" data-live="avgh">${avgH.toFixed(0)}</span><span class="u">% RH across 3 live sensors</span></div>
        <div class="hbar"><i data-live="avghbar" style="width:${avgH.toFixed(0)}%"></i></div>
      </div>
      <div class="card"><h3>Alerts <button class="btn ghost" data-go="sensors" style="padding:4px 8px;font-size:12.5px">All sensors</button></h3><div class="alerts" data-live="alerts">${alertsHTML()}</div></div>
    </div>
  </div>`;
}
function alertsHTML(){
  const n = eff('settings.notifications'), out=[];
  for (const z of ZONES){ const s=zoneStatus(z), nm=esc(synced.zones[z].name);
    if (s.t==='Offline' && n.offline) out.push(`<div class="alert"><span class="ic bad">!</span><div>${nm} sensor is offline<small>No reading for ${ago(seen[z]).replace(' ago','')}</small></div></div>`);
    if (s.t==='Too hot' && n.highTemp) out.push(`<div class="alert"><span class="ic bad">↑</span><div>${nm} is above ${fmt(eff('settings.thresholds.high'),0)}${deg()}<small>Currently ${fmt(R[z].t)}${deg()}</small></div></div>`);
    if (s.t==='Humid' && n.humidity) out.push(`<div class="alert"><span class="ic warn">≈</span><div>${nm} humidity is ${R[z].h.toFixed(0)}%<small>Your limit is ${eff('settings.thresholds.humidity')}%</small></div></div>`);
  }
  return out.length ? out.join('') : `<div class="alert"><span class="ic ok">✓</span><div>All clear<small>No zone needs attention</small></div></div>`;
}

function viewSensors(){
  const st = ZONES.map(zoneStatus);
  const c = k => st.filter(s=>s.k===k).length;
  return `<div class="head"><div class="eyebrow">Sensors</div><h1 class="h1">Sensor status</h1><p class="sub">Readings are simulated in this demo and refresh every few seconds. Tap a zone to adjust it.</p></div>
  <div class="summary" data-live="summary">
    <div class="card"><span class="n num" style="color:var(--good)">${c('ok')}</span><span class="k">Working</span></div>
    <div class="card"><span class="n num" style="color:var(--warn)">${c('warn')}</span><span class="k">Need attention</span></div>
    <div class="card"><span class="n num" style="color:var(--bad)">${c('bad')}</span><span class="k">Offline or hot</span></div>
  </div>
  <div class="grid sensors">
  ${ZONES.map(z=>{const s=zoneStatus(z), off=OFFLINE.has(z), zc=synced.zones[z];
    return `<div class="card sensor ${flashKeys.has('zones.'+z)?'flash':''}">
      <div class="sensor-head"><div><b>${esc(zc.name)}</b><div class="meta">${esc(zc.sensor)} · target ${fmt(eff(`zones.${z}.target`))}${deg()} ${ltag(`zones.${z}.target`)}</div></div><span class="tag ${s.k}" data-live="status-${z}">${s.t}</span></div>
      <div class="readings">
        <div class="reading"><div class="v num" data-live="st-${z}">${off?'—':fmt(R[z].t)+'°'}</div><div class="k">Temperature</div></div>
        <div class="reading"><div class="v num" data-live="sh-${z}">${off?'—':R[z].h.toFixed(0)+'%'}</div><div class="k">Humidity</div></div>
      </div>
      <div class="sensor-foot"><span data-live="seen-${z}">${off?'No signal for '+ago(seen[z]).replace(' ago',''):'Updated '+ago(seen[z])}</span>
        ${off?`<button class="btn" data-act="reconnect" data-z="${z}">Try reconnecting</button>`:`<button class="btn" data-zone="${z}" data-go="home">Adjust</button>`}</div>
    </div>`}).join('')}
  </div>`;
}

function row(icon,title,sub,ctl,path,wrap){
  return `<div class="row ${wrap?'wrap':''} ${path&&isLocal(path)?'local-row':''}"><span class="ri">${I[icon]}</span><div class="rt"><b>${title} ${path?ltag(path):''}</b>${sub?`<small>${sub}</small>`:''}</div><div class="ctl">${ctl}</div></div>`;
}
function mini(path,step,suffixFn){ return `<div class="mini"><button data-step="${path}" data-delta="-${step}" aria-label="Decrease">−</button><span class="num">${suffixFn(eff(path))}</span><button data-step="${path}" data-delta="${step}" aria-label="Increase">+</button></div>`; }
function viewSettings(){
  const S='settings.';
  return `<div class="head"><div class="eyebrow">Settings</div><h1 class="h1">Settings</h1><p class="sub">${localMode?'Local mode is on: anything you change here stays on this device until you sync it.':'Changes save automatically and appear in your other open windows within seconds.'}</p></div>
  <div class="section"><div class="section-title eyebrow">Units &amp; appearance</div><div class="rows">
    ${row('therm','Temperature unit','Used on every screen',`<div class="seg">${['C','F'].map(u=>`<button data-set="${S}units" data-value="${u}" aria-pressed="${eff(S+'units')===u}">°${u}</button>`).join('')}</div>`,S+'units')}
    ${row('palette','Accent color','Highlights, buttons and charts',`<div class="swatches">${ACCENTS.map(c=>`<button class="swatch" style="background:${c}" data-set="${S}accent" data-value="${c}" aria-pressed="${eff(S+'accent')===c}" aria-label="Accent ${c}"></button>`).join('')}</div>`,S+'accent',true)}
  </div></div>
  <div class="section"><div class="section-title eyebrow">Automation</div><div class="rows">
    ${row('leaf','Eco schedule','Relax targets by 2° outside opening hours',sw(S+'automation.eco'),S+'automation.eco')}
    ${row('people','Occupancy cooling','Cool harder when a zone is busy',sw(S+'automation.occupancy'),S+'automation.occupancy')}
    ${row('snow','Pre-cool before opening','Start 30 minutes before opening time',sw(S+'automation.precool'),S+'automation.precool')}
    ${row('clock','Opening time','',`<input class="time" type="time" id="t-open" data-input="${S}schedule.open" value="${esc(eff(S+'schedule.open'))}">`,S+'schedule.open')}
    ${row('clock','Closing time','',`<input class="time" type="time" id="t-close" data-input="${S}schedule.close" value="${esc(eff(S+'schedule.close'))}">`,S+'schedule.close')}
  </div></div>
  <div class="section"><div class="section-title eyebrow">Alert limits</div><div class="rows">
    ${row('flame','High temperature','Alert when any zone reaches this',mini(S+'thresholds.high',1,v=>fmt(v,0)+deg()),S+'thresholds.high',true)}
    ${row('drop','Humidity','Alert when relative humidity reaches this',mini(S+'thresholds.humidity',5,v=>v+'%'),S+'thresholds.humidity',true)}
  </div></div>
  <div class="section"><div class="section-title eyebrow">Notifications</div><div class="rows">
    ${row('bell','Push notifications','On phones and tablets',sw(S+'notifications.push'),S+'notifications.push')}
    ${row('mail','Daily email digest','A summary every morning',sw(S+'notifications.email'),S+'notifications.email')}
    ${row('flame','High-temperature alerts','',sw(S+'notifications.highTemp'),S+'notifications.highTemp')}
    ${row('drop','Humidity alerts','',sw(S+'notifications.humidity'),S+'notifications.humidity')}
    ${row('wifi','Offline sensor alerts','',sw(S+'notifications.offline'),S+'notifications.offline')}
  </div></div>`;
}

function viewAccount(){
  const devs = Object.entries(devices).sort((a,b)=>b[1].at-a[1].at);
  if (!devices[DEV.id]) devs.unshift([DEV.id,{name:DEV.name,mobile:DEV.mobile,at:null}]);
  return `<div class="head"><div class="eyebrow">Account</div><h1 class="h1">Account &amp; devices</h1><p class="sub">Manage your profile and the devices that share your settings.</p></div>
  <div class="grid" style="gap:14px">
    <div class="card profile">${me.avatarUrl?`<img src="${esc(me.avatarUrl)}" alt="">`:`<span class="ri" style="width:52px;height:52px;border-radius:50%;background:var(--surface-2);display:grid;place-items:center">${I.user}</span>`}<div><b>${esc(me.name||'Your account')}</b><div class="meta">${ref?'Settings sync is on for this browser':'Settings stay on this device'}</div></div></div>
    <div class="section"><div class="section-title eyebrow">Windows sharing your settings</div><div class="rows">
      ${devs.map(([id,d])=>`<div class="device"><span class="ri">${d.mobile?I.phone:I.laptop}</span><div class="rt">${esc(d.name)}${id===DEV.id?' <span class="tag ok">This device</span>':''}<small>${d.at?'Last change '+ago(d.at):'No changes yet'}</small></div></div>`).join('')}
      <div class="howto">Open TempWise in a second tab or window. Changes there show up here automatically, or tap <b>Refresh</b> to check now. To sync phones and computers, connect a backend (see the README).</div>
    </div></div>
    <div class="section"><div class="section-title eyebrow">Sync</div><div class="rows">
      ${row('refresh','Refresh from other windows',`Last checked ${ago(lastSyncAt)}${lastWriter?` · last change from ${esc(lastWriter.device===DEV.id?'this device':lastWriter.name)}`:''}`,`<button class="btn" data-act="refresh">Refresh</button>`)}
      ${row('refresh','Reset demo data','Put every zone and setting back to its default',`<button class="btn" data-act="reset">Reset</button>`)}
      ${row('phone','Local mode','Try changes on this device without touching thermostats or other devices',`<button class="sw" role="switch" aria-checked="${localMode}" data-act="local" aria-label="Local mode"></button>`)}
    </div></div>
    <button class="btn danger" data-act="logout" style="padding:12px">Log out</button>
  </div>`;
}

function viewLogin(){
  const saved = window.TempWiseSync ? window.TempWiseSync.profile().name : '';
  return `<div class="auth"><div class="auth-card">
    <div><svg class="logo" viewBox="0 0 64 64">${logo().replace(/^<svg[^>]*>|<\/svg>$/g,'')}</svg>
    <h1>Temp<span>Wise</span></h1><div class="tagline">Perfect temperature. Automatically.</div></div>
    <div><div class="welcome">${saved?'Welcome back':'Welcome'}</div><p class="fine" style="margin-top:4px">Climate control for shops, gyms and work floors</p></div>
    <label class="field"><span>Your name</span><input id="login-name" type="text" autocomplete="name" placeholder="Optional" value="${esc(saved)}" maxlength="40"></label>
    <button class="btn primary" data-act="login">Continue →</button>
    <p class="fine">This is a demo. Your name and settings stay in this browser and are never sent anywhere.</p>
  </div></div>`;
}
function viewLoggedOut(){
  return `<div class="auth"><div class="auth-card">
    <div class="wave">${I.wave}</div>
    <div><h1 style="font-size:26px">See you soon!</h1><p class="tagline" style="margin-top:8px">You’ve logged out on this device. Thermostats keep running on your synced settings.</p></div>
    <button class="btn primary" data-act="login">Log in again</button>
  </div></div>`;
}

/* ================= render ================= */
const NAV = [['home','Home','home'],['sensors','Sensors','sensor'],['settings','Settings','gear'],['account','Account','user']];
function render(){
  applyAccent();
  const root = document.getElementById('root');
  const focusId = document.activeElement && document.activeElement.id;
  if (screen==='login'){ root.innerHTML = viewLogin(); return; }
  if (screen==='loggedout'){ root.innerHTML = viewLoggedOut(); return; }
  const body = screen==='sensors'?viewSensors():screen==='settings'?viewSettings():screen==='account'?viewAccount():viewHome();
  const nav = NAV.map(([k,l,i])=>`<button class="tab" data-go="${k}" aria-current="${screen===k?'page':'false'}">${I[i]}<span>${l}</span></button>`).join('');
  root.innerHTML = `<div class="app">
    <nav class="rail" aria-label="Main"><div class="brand">${logo()}<b>Temp<span>Wise</span></b></div>${nav}<div class="spacer"></div><div class="meta" style="padding:0 12px;color:var(--faint);font-size:12px">${esc(DEV.name)}</div></nav>
    <main class="main">${topbar()}${body}</main>
    <nav class="tabbar" aria-label="Main">${nav}</nav>
  </div>`;
  document.getElementById('synctxt').textContent = syncText();
  if (focusId){ const f=document.getElementById(focusId); if(f) f.focus(); }
}
function paintLive(){
  const q = s => document.querySelector(`[data-live="${s}"]`);
  for (const z of ZONES){
    const off = OFFLINE.has(z);
    const set=(k,v)=>{const e=q(k); if(e) e.textContent=v;};
    set('chip-'+z, off?'—':fmt(R[z].t)+'°');
    set('now-'+z, off?'—':fmt(R[z].t)+deg());
    set('st-'+z, off?'—':fmt(R[z].t)+'°');
    set('sh-'+z, off?'—':R[z].h.toFixed(0)+'%');
    set('seen-'+z, off?'No signal for '+ago(seen[z]).replace(' ago',''):'Updated '+ago(seen[z]));
    const st=q('status-'+z); if(st){const s=zoneStatus(z); st.className='tag '+s.k; st.textContent=s.t;}
  }
  const al=q('alerts'); if(al) al.innerHTML=alertsHTML();
  const avg = ZONES.filter(z=>!OFFLINE.has(z)).reduce((a,z)=>a+R[z].h,0)/3;
  const ah=q('avgh'); if(ah) ah.textContent=avg.toFixed(0);
  const ab=q('avghbar'); if(ab) ab.style.width=avg.toFixed(0)+'%';
  const g=q('gauge'); if(g){ const svg=g.querySelector('svg'); if(svg) svg.outerHTML=gauge(zoneSel); }
  const t=document.getElementById('synctxt'); if(t) t.textContent=syncText();
}

/* ================= events ================= */
function go(s){ screen=s; ss.set('tw-screen',s); render(); window.scrollTo(0,0); }
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.zone){ zoneSel=b.dataset.zone; ss.set('tw-zone',zoneSel); if(!b.dataset.go){ render(); return; } }
  if (b.dataset.go){ go(b.dataset.go); return; }
  if (b.dataset.toggle){ setValue(b.dataset.toggle, !eff(b.dataset.toggle)); return; }
  if (b.dataset.set){ setValue(b.dataset.set, b.dataset.value); return; }
  if (b.dataset.step){
    const p=b.dataset.step, d=+b.dataset.delta;
    if (p.endsWith('.target')){ const stepC = units()==='F' ? 5/9 : 0.5; const v=Math.round((eff(p)+d*stepC)*100)/100; setValue(p, Math.max(10,Math.min(32,v))); }
    else if (p.endsWith('thresholds.high')){ const stepC = units()==='F'?5/9:1; setValue(p, Math.max(18,Math.min(40,Math.round((eff(p)+d*stepC)*100)/100))); }
    else setValue(p, Math.max(30,Math.min(90,eff(p)+d)));
    return;
  }
  switch (b.dataset.act){
    case 'refresh': refresh(b.classList.contains('iconbtn')?b:null); break;
    case 'local': localMode=!localMode; ss.set('tw-local',localMode?'1':'0'); toast(localMode?'Local mode on: changes stay on this device':'Local mode off: changes sync again'); render(); break;
    case 'discard': overlay={}; saveOverlay(); applyAccent(); toast('Local changes discarded'); render(); break;
    case 'push': { const n=localCount(); for(const [p,v] of Object.entries(overlay)) setPath(synced,p,v); overlay={}; saveOverlay(); localMode=false; ss.set('tw-local','0'); applyAccent(); render(); scheduleWrite(); toast(`${n} change${n>1?'s':''} sent to all devices`); break; }
    case 'reconnect': toast(`Still no signal from ${synced.zones[b.dataset.z].sensor}. Check its power and Wi-Fi.`); break;
    case 'reset': synced=clone(DEFAULTS); overlay={}; saveOverlay(); applyAccent(); render(); scheduleWrite(); toast('Demo data reset to defaults'); break;
    case 'logout': ls.set('tw-signed','0'); screen='loggedout'; render(); break;
    case 'login': { const inp=document.getElementById('login-name'); if (inp && window.TempWiseSync) window.TempWiseSync.setProfile(inp.value.trim()); if (window.TempWiseSync) me.name = window.TempWiseSync.profile().name || ''; }
      ls.set('tw-signed','1'); go(ss.get('tw-screen')&&ss.get('tw-screen')!=='login'?ss.get('tw-screen'):'home'); break;
  }
});
document.addEventListener('change', e => {
  const el = e.target; if (el.dataset && el.dataset.input && el.value) setValue(el.dataset.input, el.value);
});
document.addEventListener('keydown', e => { if (e.key==='Enter' && e.target && e.target.id==='login-name') document.querySelector('[data-act=login]').click(); });
setInterval(()=>{ const t=document.getElementById('synctxt'); if(t) t.textContent=syncText(); },15000);

render();
connect();
})();
