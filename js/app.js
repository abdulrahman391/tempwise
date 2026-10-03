/* TempWise demo app
 *
 * Screens: Home, Sensors, Activity, Settings, Account (+ login / logged out).
 *
 * How the pieces fit:
 *   synced   the settings every open window shares (saved through js/sync.js)
 *   overlay  changes made in Local mode; they live in this tab only
 *   eff(p)   the value this tab shows for a setting: overlay first, then synced
 *   sim      simulated sensors; the "thermostat" follows the SYNCED values only,
 *            so Local mode can never move it
 */
(() => {
'use strict';

/* ================= icons ================= */
const ic = (d, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  home: ic('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>'),
  sensor: ic('<path d="M5 12.5a10 10 0 0114 0"/><path d="M8.5 15.5a5 5 0 017 0"/><circle cx="12" cy="19" r="1.3" fill="currentColor"/>'),
  pulse: ic('<path d="M3 12h4l2-6 4 12 2-6h6"/>'),
  gear: ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>'),
  refresh: ic('<path d="M21 12a9 9 0 11-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>', 2),
  bell: ic('<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>'),
  mail: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  flame: ic('<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/>'),
  drop: ic('<path d="M12 3s7 7.5 7 12a7 7 0 01-14 0c0-4.5 7-12 7-12z"/>'),
  wifi: ic('<path d="M2 8.5a15 15 0 0120 0"/><path d="M5 12a10 10 0 0114 0"/><path d="M8.5 15.5a5 5 0 017 0"/><path d="M3 3l18 18"/>'),
  leaf: ic('<path d="M11 20A7 7 0 014 13c0-6 7-10 16-10 0 9-4 16-10 16"/><path d="M4 21c3-6 7-9 11-11"/>'),
  people: ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6.5 6.5 0 013.5 6"/>'),
  snow: ic('<path d="M12 2v20M4 7l16 10M20 7L4 17"/>'),
  clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  cal: ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  therm: ic('<path d="M14 14.8V5a2 2 0 10-4 0v9.8a4 4 0 104 0z"/>'),
  palette: ic('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16" cy="10" r="1.2" fill="currentColor"/>'),
  phone: ic('<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
  laptop: ic('<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>'),
  wave: ic('<path d="M18 11V6a2 2 0 00-4 0v5M14 10V4a2 2 0 00-4 0v6M10 10.5V6a2 2 0 00-4 0v8a8 8 0 0016 0v-2a2 2 0 00-4 0"/>', 1.7),
  plus: ic('<path d="M12 5v14M5 12h14"/>', 2),
  trash: ic('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  down: ic('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'),
  up: ic('<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>'),
  sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: ic('<path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/>'),
  auto: ic('<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 010 18" fill="currentColor"/>'),
  bolt: ic('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  check: ic('<path d="M5 12l5 5 9-10"/>', 2),
  grid: ic('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
};
let _lid = 0;
const logo = () => { const n = ++_lid; return `<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient><linearGradient id="lh${n}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--heat)"/><stop offset="1" stop-color="#ffd166"/></linearGradient></defs><path d="M8 30L32 9l24 21" fill="none" stroke="url(#lg${n})" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 27v26h36V27" fill="none" stroke="url(#lg${n})" stroke-width="4" stroke-linejoin="round" opacity=".55"/><rect x="28" y="21" width="8" height="22" rx="4" fill="none" stroke="var(--fg)" stroke-width="3"/><circle cx="32" cy="46" r="6.5" fill="url(#lh${n})"/><rect x="30.5" y="30" width="3" height="14" rx="1.5" fill="url(#lh${n})"/></svg>`; };

/* ================= model ================= */
const DAYS = [['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],['thu','Thursday'],['fri','Friday'],['sat','Saturday'],['sun','Sunday']];
const DAY_BY_JS = ['sun','mon','tue','wed','thu','fri','sat'];
const sched = (o, c) => ({open:o, close:c, closed:false});

const DEFAULTS = {
  zones:{
    gym:  {name:'Gym floor',    sensor:'Sensor 01', target:21, comfort:21, mode:'cool', offline:false},
    shop: {name:'Workshop',     sensor:'Sensor 02', target:20, comfort:20, mode:'auto', offline:false},
    work: {name:'Loading bay',  sensor:'Sensor 03', target:22, comfort:22, mode:'auto', offline:false},
    store:{name:'Storage room', sensor:'Sensor 04', target:18, comfort:18, mode:'off',  offline:true},
  },
  order:['gym','shop','work','store'],
  settings:{
    units:'C', accent:'#2fa8ff', setback:2,
    notifications:{push:true, email:false, highTemp:true, humidity:true, offline:true},
    automation:{eco:true, occupancy:true, precool:false},
    thresholds:{high:28, humidity:65},
    schedule:{
      mon:sched('06:00','22:00'), tue:sched('06:00','22:00'), wed:sched('06:00','22:00'), thu:sched('06:00','22:00'),
      fri:sched('06:00','22:00'), sat:sched('08:00','20:00'), sun:sched('09:00','18:00'),
    },
  },
  log:[],
};
const ACCENTS = ['#2fa8ff','#1fd1c4','#3ddc97','#ffb347','#ff6b8a'];
const MAX_ZONES = 8;
const SCENES = [
  {k:'comfort', name:'Comfort', note:'Every zone at its comfort target', f:z => ({target:z.comfort, mode:z.mode==='off'?'auto':z.mode})},
  {k:'busy',    name:'Busy',    note:'1.5° cooler for crowded rooms',    f:z => ({target:z.comfort-1.5, mode:z.mode==='heat'?'heat':'cool'})},
  {k:'eco',     name:'Eco',     note:'Relax every zone by the setback',  f:z => ({target:z.comfort+synced.settings.setback, mode:'auto'})},
  {k:'off',     name:'All off', note:'Turn every zone off',              f:z => ({target:z.target, mode:'off'})},
];

const LABELS = {
  'settings.units':'Temperature unit', 'settings.accent':'Accent color', 'settings.setback':'Eco setback',
  'settings.notifications.push':'Push notifications', 'settings.notifications.email':'Email digest',
  'settings.notifications.highTemp':'High-temperature alerts', 'settings.notifications.humidity':'Humidity alerts', 'settings.notifications.offline':'Offline sensor alerts',
  'settings.automation.eco':'Eco schedule', 'settings.automation.occupancy':'Occupancy cooling', 'settings.automation.precool':'Pre-cool before opening',
  'settings.thresholds.high':'High-temperature limit', 'settings.thresholds.humidity':'Humidity limit',
};
function labelFor(p){
  if (LABELS[p]) return LABELS[p];
  let m = p.match(/^zones\.(\w+)\.(\w+)$/);
  if (m){
    const z = synced.zones[m[1]], nm = z ? z.name : m[1];
    const f = {target:'target', mode:'mode', name:'name', sensor:'sensor name', offline:'sensor offline', comfort:'comfort target'}[m[2]] || m[2];
    return `${nm} ${f}`;
  }
  m = p.match(/^settings\.schedule\.(\w+)\.(open|close|closed)$/);
  if (m){ const d = DAYS.find(x => x[0]===m[1]); return `${d?d[1]:m[1]} ${{open:'opening time', close:'closing time', closed:'hours'}[m[2]]}`; }
  return p.split('.').pop();
}

const clone = o => JSON.parse(JSON.stringify(o));
const clamp = (a,b,v) => Math.max(a, Math.min(b, v));
const getPath = (o,p) => p.split('.').reduce((a,k) => a==null ? a : a[k], o);
function setPath(o,p,v){ const ks=p.split('.'); let a=o; for (let i=0;i<ks.length-1;i++){ a[ks[i]] = a[ks[i]] && typeof a[ks[i]]==='object' ? a[ks[i]] : {}; a=a[ks[i]]; } a[ks[ks.length-1]] = v; }
function leaves(o, pre='', out={}){
  for (const k of Object.keys(o)){
    if (!pre && (k==='log' || k==='order')) continue;
    const p = pre ? pre+'.'+k : k, v = o[k];
    if (v && typeof v==='object') leaves(v, p, out); else out[p] = v;
  }
  return out;
}
function mergeDefaults(d, s){
  if (s==null || typeof d!=='object' || d===null || Array.isArray(d)) return s==null ? clone(d) : s;
  const out = {};
  for (const k of Object.keys(d)) out[k] = (s && typeof s==='object' && k in s) ? mergeDefaults(d[k], s[k]) : clone(d[k]);
  return out;
}
/* Make any stored document safe to use: keep the user's zones, fill in missing settings. */
function normalize(st){
  st = st && typeof st==='object' ? st : {};
  const zones = {};
  const src = st.zones && typeof st.zones==='object' && Object.keys(st.zones).length ? st.zones : DEFAULTS.zones;
  for (const id of Object.keys(src).slice(0, MAX_ZONES)){
    if (!/^\w+$/.test(id)) continue;
    const z = src[id] || {};
    const target = typeof z.target==='number' ? clamp(10,32,z.target) : 21;
    zones[id] = {
      name:String(z.name || 'Zone').slice(0,40), sensor:String(z.sensor || 'Sensor').slice(0,40),
      target, comfort:typeof z.comfort==='number' ? clamp(10,32,z.comfort) : target,
      mode:['cool','heat','auto','off'].includes(z.mode) ? z.mode : 'auto', offline:!!z.offline,
    };
  }
  let order = Array.isArray(st.order) ? st.order.filter(id => zones[id]) : [];
  Object.keys(zones).forEach(id => { if (!order.includes(id)) order.push(id); });
  return {
    zones, order,
    settings:mergeDefaults(DEFAULTS.settings, st.settings),
    log:Array.isArray(st.log) ? st.log.filter(e => e && e.text).slice(0,40) : [],
  };
}

/* ================= storage helpers ================= */
const ls = { get(k){ try { return localStorage.getItem('tempwise:'+k); } catch { return null; } }, set(k,v){ try { localStorage.setItem('tempwise:'+k, v); } catch {} } };
const ss = { get(k){ try { return sessionStorage.getItem(k); } catch { return null; } }, set(k,v){ try { sessionStorage.setItem(k, v); } catch {} } };

/* This window (one id per tab, so two tabs behave like two devices) */
const DEV = (() => {
  let id = ss.get('tw-dev'); if (!id){ id = 'd'+Math.random().toString(36).slice(2,10); ss.set('tw-dev', id); }
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua)?'iPhone':/iPad/.test(ua)?'iPad':/Android/.test(ua)?'Android':/Mac/.test(ua)?'Mac':/Windows/.test(ua)?'Windows PC':/Linux/.test(ua)?'Linux':'Device';
  const br = /Edg\//.test(ua)?'Edge':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)?'Safari':'Browser';
  return {id, name:`${br} on ${os} (tab ${id.slice(-3)})`, mobile:/iPhone|Android|iPad/.test(ua)};
})();

let synced = normalize(null);
let overlay = {};
try { overlay = JSON.parse(ss.get('tw-overlay') || '{}') || {}; } catch { overlay = {}; }
let localMode = ss.get('tw-local') === '1';
let devices = {}, lastWriter = null, lastSyncAt = null, hasLoaded = false;
let syncState = 'connecting', syncMsg = '';
let me = {name:''};
let screen = ls.get('tw-signed') === '1' ? (ss.get('tw-screen') || 'home') : 'login';
let zoneId = ss.get('tw-zone') || 'gym';
let flashKeys = new Set();
let pendingRemove = null;
let installEvt = null;
let ref = null, writing = false, dirty = false, writeTimer = null;

const eff = p => (p in overlay) ? overlay[p] : getPath(synced, p);
const isLocal = p => (p in overlay) && overlay[p] !== getPath(synced, p);
const localCount = () => Object.keys(overlay).filter(isLocal).length;
function saveOverlay(){ for (const k of Object.keys(overlay)) if (!isLocal(k)) delete overlay[k]; ss.set('tw-overlay', JSON.stringify(overlay)); }
const curZone = () => { if (!synced.zones[zoneId]) zoneId = synced.order[0]; return zoneId; };

/* ================= theme (per device) ================= */
function theme(){ return ls.get('theme') || 'dark'; }
function applyTheme(){
  const t = theme(), root = document.documentElement;
  if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim() || '#06111c');
}
function applyAccent(){ document.documentElement.style.setProperty('--accent', eff('settings.accent')); }

/* ================= changing things ================= */
function logEvent(key, text){
  const l = synced.log, now = Date.now(), first = l[0];
  if (first && first.key === key && first.dev === DEV.id && now - first.t < 8000){ first.t = now; first.text = text; }
  else l.unshift({t:now, dev:DEV.id, who:DEV.name, key, text});
  synced.log = l.slice(0, 40);
}
function fmtVal(p, v){
  if (typeof v === 'boolean') return p.endsWith('.closed') ? (v ? 'closed' : 'open') : (v ? 'on' : 'off');
  if (/\.(target|comfort)$/.test(p) || p === 'settings.thresholds.high') return fmt(v) + deg();
  if (p === 'settings.setback') return fmtD(v) + deg();
  if (p === 'settings.thresholds.humidity') return v + '%';
  return String(v);
}
/* Apply one or more settings. In Local mode they go to the overlay and nothing is saved or logged. */
function applyPaths(pairs, key, text){
  if (localMode){ pairs.forEach(([p,v]) => { overlay[p] = v; }); saveOverlay(); render(); return; }
  pairs.forEach(([p,v]) => { delete overlay[p]; setPath(synced, p, v); });
  saveOverlay(); logEvent(key, text || `${labelFor(pairs[0][0])} → ${fmtVal(pairs[0][0], pairs[0][1])}`);
  applyAccent(); render(); scheduleWrite();
}
const setValue = (p, v, text) => applyPaths([[p, v]], p, text);
/* Structural changes (add or remove a zone, import) always go to the shared settings. */
function mutate(fn, key, text){
  if (localMode){ toast('Turn off Local mode first. Zones and imports always change the shared settings.'); return false; }
  fn(); saveOverlay(); logEvent(key, text); applyAccent(); render(); scheduleWrite(); return true;
}

/* ================= sync ================= */
function scheduleWrite(){
  if (!ref) return;
  clearTimeout(writeTimer); syncState = 'saving'; paintSync();
  writeTimer = setTimeout(() => { writeTimer = null; flush(); }, 450);
}
async function flush(retried){
  if (!ref) return;
  if (writing){ dirty = true; return; }
  writing = true;
  const at = Date.now();
  const devs = {...devices, [DEV.id]:{name:DEV.name, mobile:DEV.mobile, at}};
  devices = Object.fromEntries(Object.entries(devs).sort((a,b) => b[1].at - a[1].at).slice(0, 8));
  const body = {state:clone(synced), lastWriter:{device:DEV.id, name:DEV.name, at}, devices};
  try {
    await ref.set(body);
    lastWriter = body.lastWriter; lastSyncAt = at; syncState = 'synced'; syncMsg = '';
  } catch (e) {
    writing = false;
    if (e && e.code === 'unavailable' && !retried){ setTimeout(() => flush(true), 600 + Math.random()*800); return; }
    syncState = 'error';
    syncMsg = 'Couldn’t save your settings. They are kept in this window; try Refresh.';
  }
  writing = false; paintSync();
  if (dirty){ dirty = false; flush(); }
}
function applyRemote(snap, manual){
  const initial = !hasLoaded; hasLoaded = true;
  if (!snap.exists){ syncState = 'synced'; lastSyncAt = Date.now(); paintSync(); return; }
  if (snap.metadata && snap.metadata.hasPendingWrites) return;
  if (writeTimer || writing) return;
  const d = snap.data() || {};
  const before = leaves(synced);
  synced = normalize(d.state);
  devices = d.devices || {};
  const after = leaves(synced);
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(k => before[k] !== after[k]);
  const lw = d.lastWriter;
  const fromOther = lw && lw.device !== DEV.id && (!lastWriter || lw.at > lastWriter.at);
  lastWriter = lw || lastWriter; lastSyncAt = Date.now(); syncState = 'synced'; syncMsg = '';
  applyAccent();
  if (changed.length && !initial && (fromOther || manual)){
    flashKeys = new Set(changed.map(k => k.split('.').slice(0,2).join('.')));
    const l0 = synced.log[0];
    const text = l0 && lw && l0.dev === lw.device ? l0.text : (changed.length === 1 ? labelFor(changed[0]) + ' updated' : `${changed.length} settings updated`);
    toast(`${lw && lw.device !== DEV.id ? lw.name + ': ' : ''}${text}`);
    setTimeout(() => flashKeys.clear(), 1700);
  } else if (manual){ toast('Everything is up to date'); }
  for (const k of Object.keys(overlay)) if (k.startsWith('zones.') && !synced.zones[k.split('.')[1]]) delete overlay[k];
  saveOverlay(); render();
}
async function refresh(btn){
  if (btn){ btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin'); }
  if (!ref){ toast('Sync isn’t available in this window'); return; }
  try { applyRemote(await ref.get(), true); }
  catch (e) { syncState = 'error'; syncMsg = 'Couldn’t read your saved settings. Try again.'; paintSync(); }
}
async function connect(){
  const sync = window.TempWiseSync;
  me = {name:(sync ? sync.profile().name : '') || ''};
  ref = sync ? sync.open() : null;
  if (!ref){ syncState = 'offline'; render(); return; }
  ref.onSnapshot(s => applyRemote(s, false), () => { syncState = 'error'; syncMsg = 'Live sync stopped. Reload the page to reconnect.'; paintSync(); });
  render();
}

/* ================= helpers ================= */
const units = () => eff('settings.units');
const fmt = (c, dec) => { const v = units()==='F' ? c*9/5+32 : c; return v.toFixed(dec ?? (units()==='F' ? 0 : 1)); };
const fmtD = c => { const v = units()==='F' ? c*1.8 : c; return (Math.round(v*10)/10).toString(); };
const deg = () => '°' + units();
const pad = n => String(n).padStart(2, '0');
function ago(t){ if (!t) return 'never'; const s = Math.round((Date.now()-t)/1000); if (s < 10) return 'just now'; if (s < 60) return s+' s ago'; const m = Math.round(s/60); if (m < 60) return m+' min ago'; const h = Math.round(m/60); return h < 24 ? h+' h ago' : Math.round(h/24)+' d ago'; }
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastT;
function toast(msg){ const t = document.getElementById('toast'); t.innerHTML = I.refresh + '<span></span>'; t.querySelector('span').textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 4000); }
function download(name, text, type){
  const url = URL.createObjectURL(new Blob([text], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ================= schedule ================= */
const toMin = hm => { const [h,m] = String(hm).split(':').map(Number); return (h||0)*60 + (m||0); };
function scheduleState(now = new Date()){
  const S = synced.settings.schedule, mins = now.getHours()*60 + now.getMinutes();
  const today = S[DAY_BY_JS[now.getDay()]];
  const open = !!today && !today.closed && mins >= toMin(today.open) && mins < toMin(today.close);
  const minsToOpen = today && !today.closed && mins < toMin(today.open) ? toMin(today.open) - mins : null;
  let label;
  if (open) label = `Open until ${today.close}`;
  else {
    label = 'Closed all week';
    for (let i = 0; i < 8; i++){
      const dk = DAY_BY_JS[(now.getDay()+i) % 7], d = S[dk];
      if (!d || d.closed) continue;
      if (i === 0 && mins >= toMin(d.open)) continue;
      label = `Closed · opens ${i===0 ? 'today' : i===1 ? 'tomorrow' : DAYS.find(x => x[0]===dk)[1].slice(0,3)} ${d.open}`;
      break;
    }
  }
  return {open, minsToOpen, label};
}

/* ================= simulated sensors ================= */
const TICK = 2000, MAXH = 90;
const R = {}, hist = {}, seen = {}, prevStatus = {};
let alertLog = [];
function sim(id){
  if (!R[id]){
    const z = synced.zones[id];
    R[id] = {t:z.target + Math.random()*2.6 - 0.6, h:45 + Math.random()*20, occ:Math.floor(Math.random()*14)};
    let t = R[id].t, h = R[id].h; const now = Date.now(), arr = [];
    for (let i = 0; i < MAXH; i++){ arr.unshift({t:now - i*TICK, temp:t, hum:h}); t += (Math.random()-.5)*.14; h = clamp(30, 80, h + (Math.random()-.5)*.7); }
    hist[id] = z.offline ? [] : arr;
    seen[id] = z.offline ? now - 18*60000 : now;
  }
  return R[id];
}
/* What the real thermostat is aiming for right now (uses SYNCED values only). */
function goalFor(id){
  const z = synced.zones[id], st = synced.settings, r = sim(id);
  if (z.mode === 'off') return {g:27.5, why:''};
  let g = z.target, why = '';
  const sc = scheduleState();
  if (st.automation.eco && !sc.open){ g += (z.mode === 'heat' ? -1 : 1) * st.setback; why = 'eco schedule'; }
  else if (st.automation.precool && sc.minsToOpen !== null && sc.minsToOpen <= 30 && z.mode !== 'heat'){ g -= 1; why = 'pre-cooling'; }
  else if (st.automation.occupancy && r.occ > 10 && z.mode !== 'heat'){ g -= 0.5; why = 'busy room'; }
  return {g, why};
}
function zoneStatus(id){
  const z = synced.zones[id];
  if (z.offline) return {k:'bad', t:'Offline'};
  const r = sim(id), th = eff('settings.thresholds');
  if (r.t >= th.high) return {k:'bad', t:'Too hot'};
  if (r.h >= th.humidity) return {k:'warn', t:'Humid'};
  return {k:'ok', t:'Normal'};
}
function pushAlert(kind, text){ alertLog.unshift({t:Date.now(), kind, text}); alertLog = alertLog.slice(0, 30); }
function tick(){
  const n = synced.settings.notifications;
  for (const id of synced.order){
    const z = synced.zones[id], r = sim(id), s = zoneStatus(id).t;
    if (prevStatus[id] && prevStatus[id] !== s){
      if (s === 'Offline' && n.offline) pushAlert('bad', `${z.name} sensor went offline`);
      else if (s === 'Too hot' && n.highTemp) pushAlert('bad', `${z.name} reached ${fmt(r.t)}${deg()}`);
      else if (s === 'Humid' && n.humidity) pushAlert('warn', `${z.name} humidity is ${r.h.toFixed(0)}%`);
      else if (s === 'Normal') pushAlert('ok', `${z.name} is back to normal`);
    }
    prevStatus[id] = s;
    if (z.offline) continue;
    r.t += (goalFor(id).g - r.t) * 0.07 + (Math.random()-.5)*0.09;
    r.h = clamp(30, 80, r.h + (Math.random()-.5)*0.7);
    r.occ = clamp(0, 24, r.occ + (Math.random() < .2 ? (Math.random() < .5 ? -1 : 1) : 0));
    seen[id] = Date.now();
    hist[id].push({t:Date.now(), temp:r.t, hum:r.h}); if (hist[id].length > MAXH) hist[id].shift();
  }
  paintLive();
}

/* ================= small charts ================= */
function trendSVG(id){
  const z = synced.zones[id], h = hist[id] || [];
  if (z.offline || h.length < 3) return `<div class="empty">No readings. This sensor is offline.</div>`;
  const W = 320, H = 132, L = 34, Rr = 8, T = 10, B = 22;
  const target = eff(`zones.${id}.target`);
  let lo = Math.min(...h.map(p => p.temp), target), hi = Math.max(...h.map(p => p.temp), target);
  lo = Math.floor((lo - 0.4) * 2) / 2; hi = Math.ceil((hi + 0.4) * 2) / 2; if (hi - lo < 2) hi = lo + 2;
  const x = i => L + i * (W - L - Rr) / (h.length - 1), y = v => T + (hi - v) * (H - T - B) / (hi - lo);
  const pts = h.map((p,i) => `${x(i).toFixed(1)},${y(p.temp).toFixed(1)}`).join(' ');
  const area = `${x(0).toFixed(1)},${H-B} ${pts} ${x(h.length-1).toFixed(1)},${H-B}`;
  const ticks = [lo, (lo+hi)/2, hi];
  const span = Math.round((h[h.length-1].t - h[0].t) / 1000);
  const last = h[h.length-1];
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperature trend for ${esc(z.name)}">
    <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${ticks.map(v => `<line x1="${L}" x2="${W-Rr}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="var(--line)" stroke-width="1"/><text x="${L-6}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end" fill="var(--faint)" font-size="9.5" font-family="var(--body)">${fmt(v, units()==='F'?0:1)}°</text>`).join('')}
    <line x1="${L}" x2="${W-Rr}" y1="${y(target).toFixed(1)}" y2="${y(target).toFixed(1)}" stroke="var(--heat)" stroke-width="1.2" stroke-dasharray="4 3"/>
    <polygon points="${area}" fill="url(#tg)"/>
    <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(h.length-1).toFixed(1)}" cy="${y(last.temp).toFixed(1)}" r="3.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>
    <text x="${L}" y="${H-6}" fill="var(--faint)" font-size="9.5" font-family="var(--body)">${Math.floor(span/60)}:${pad(span%60)} ago</text>
    <text x="${W-Rr}" y="${H-6}" text-anchor="end" fill="var(--faint)" font-size="9.5" font-family="var(--body)">now</text>
    <text x="${W-Rr}" y="${(y(target)-4).toFixed(1)}" text-anchor="end" fill="var(--heat)" font-size="9.5" font-family="var(--body)">target</text>
  </svg>`;
}
function sparkSVG(id){
  const z = synced.zones[id], h = (hist[id] || []).slice(-45);
  if (z.offline || h.length < 3) return '';
  const W = 120, H = 30; let lo = Math.min(...h.map(p => p.temp)), hi = Math.max(...h.map(p => p.temp)); if (hi - lo < 0.6){ const m=(hi+lo)/2; lo = m-.3; hi = m+.3; }
  const pts = h.map((p,i) => `${(i*(W-4)/(h.length-1)+2).toFixed(1)},${(H-3-(p.temp-lo)*(H-6)/(hi-lo)).toFixed(1)}`).join(' ');
  const end = pts.split(' ').pop().split(',');
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${end[0]}" cy="${end[1]}" r="2.4" fill="var(--accent)"/></svg>`;
}
function gauge(id){
  const MIN = 10, MAX = 32, A0 = -210, A1 = 30;
  const ang = c => A0 + (clamp(MIN, MAX, c) - MIN) / (MAX - MIN) * (A1 - A0);
  const pt = (a, r) => [100 + r*Math.cos(a*Math.PI/180), 100 + r*Math.sin(a*Math.PI/180)];
  const arc = (a0, a1, r) => { const [x0,y0] = pt(a0,r), [x1,y1] = pt(a1,r); return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
  const tEff = eff(`zones.${id}.target`), tSync = synced.zones[id].target, cur = sim(id).t;
  const loc = isLocal(`zones.${id}.target`);
  const [tx,ty] = pt(ang(tEff), 78), [sx,sy] = pt(ang(tSync), 78), [cx,cy] = pt(ang(cur), 66);
  const ticks = []; for (let c = MIN; c <= MAX; c += 2){ const [a,b] = pt(ang(c), 90), [d,e] = pt(ang(c), c%4 ? 94 : 97); ticks.push(`<line x1="${a.toFixed(1)}" y1="${b.toFixed(1)}" x2="${d.toFixed(1)}" y2="${e.toFixed(1)}" stroke="var(--line)" stroke-width="1.5"/>`); }
  return `<svg viewBox="0 0 200 172" aria-hidden="true">
    <defs><linearGradient id="ga" x1="0" x2="1"><stop offset="0" stop-color="var(--cold)"/><stop offset=".55" stop-color="var(--accent-2)"/><stop offset="1" stop-color="var(--heat)"/></linearGradient></defs>
    ${ticks.join('')}
    <path d="${arc(A0,A1,78)}" fill="none" stroke="var(--surface-2)" stroke-width="12" stroke-linecap="round"/>
    <path d="${arc(A0,ang(tEff),78)}" fill="none" stroke="url(#ga)" stroke-width="12" stroke-linecap="round"/>
    ${loc ? `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5" fill="var(--bg)" stroke="var(--muted)" stroke-width="2" stroke-dasharray="2 2"/>` : ''}
    <circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="9" fill="var(--fg)" stroke="${loc ? 'var(--local)' : 'var(--surface)'}" stroke-width="3"/>
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.5" fill="var(--fg)" opacity=".75"/>
  </svg>`;
}

/* ================= views ================= */
const sw = (path, on, label) => { const v = on === undefined ? !!eff(path) : on; return `<button class="sw" role="switch" aria-checked="${v}" data-toggle="${path}" aria-label="${esc(label || labelFor(path))}"></button>`; };
const ltag = p => isLocal(p) ? `<span class="tag local">Local</span>` : '';
const THEME_ICON = {dark:'moon', light:'sun', auto:'auto'};

function topbar(){
  return `<div class="top">
    <div class="brand">${logo()}<b>Temp<span>Wise</span></b></div>
    <div class="top-actions">
      <span class="sync" id="sync" data-s="${syncState}"><span class="dot"></span><span id="synctxt"></span></span>
      <button class="iconbtn" data-act="refresh" aria-label="Refresh from other windows" title="Refresh from other windows">${I.refresh}</button>
      <button class="iconbtn" data-act="theme" aria-label="Theme: ${theme()}. Tap to change" title="Theme: ${theme()}">${I[THEME_ICON[theme()]]}</button>
      <button class="localtoggle" data-act="local" aria-pressed="${localMode}" title="Try changes on this window only"><span class="sw" aria-checked="${localMode}"></span>Local mode</button>
    </div>
  </div>
  ${localMode || localCount() ? `<div class="banner">
      <div class="txt">${localMode ? `<b>Local mode is on.</b> Changes stay in this window. The thermostat and your other windows keep the synced values.` : `<b>You have local changes</b> that only this window can see.`} ${localCount() ? `<span class="num">${localCount()}</span> local change${localCount()>1?'s':''}.` : ''}</div>
      <button class="btn ghost" data-act="discard" ${localCount() ? '' : 'disabled'}>Discard</button>
      <button class="btn localbtn" data-act="push" ${localCount() ? '' : 'disabled'}>Sync to all devices</button>
    </div>` : ''}
  ${syncState === 'offline' ? `<div class="banner offline"><div class="txt">Browser storage is blocked, so settings can’t be saved or shared between windows. Allow site data for this page to turn sync on.</div></div>` : ''}
  ${syncState === 'error' && syncMsg ? `<div class="banner offline"><div class="txt">${esc(syncMsg)}</div><button class="btn" data-act="refresh">Refresh</button></div>` : ''}`;
}
function syncText(){
  if (syncState === 'connecting') return 'Connecting…';
  if (syncState === 'saving') return 'Saving…';
  if (syncState === 'offline') return 'This window only';
  if (syncState === 'error') return 'Sync problem';
  return `Synced · ${ago(lastSyncAt)}`;
}
function paintSync(){ const el = document.getElementById('sync'); if (!el) return render(); el.dataset.s = syncState; document.getElementById('synctxt').textContent = syncText(); }

function sceneMatch(){
  const ids = synced.order.filter(id => !synced.zones[id].offline);
  if (!ids.length) return null;
  for (const s of SCENES){
    if (ids.every(id => { const z = synced.zones[id], r = s.f(z), t = clamp(10, 32, r.target); return Math.abs(eff(`zones.${id}.target`) - t) < 0.01 && eff(`zones.${id}.mode`) === r.mode; })) return s.k;
  }
  return null;
}
function holdLine(id){
  const z = synced.zones[id]; if (z.offline || z.mode === 'off') return '';
  const {g, why} = goalFor(id);
  return Math.abs(g - z.target) > 0.04 && why ? `Holding ${fmt(g)}${deg()} for ${why}` : '';
}

function viewHome(){
  const id = curZone(), zc = synced.zones[id], off = zc.offline, r = sim(id);
  const mode = eff(`zones.${id}.mode`), tPath = `zones.${id}.target`, loc = isLocal(tPath);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const sc = scheduleState(), active = sceneMatch();
  const live = synced.order.filter(q => !synced.zones[q].offline);
  const avgH = live.length ? live.reduce((a,q) => a + sim(q).h, 0) / live.length : 0;
  const energy = [2.1,1.8,1.6,1.5,1.9,2.8,3.6,3.9,4.2,4.4,4.1,3.8].map(v => v * (eff('settings.automation.eco') ? 0.85 : 1));
  const nowIdx = Math.min(11, Math.floor(hour / 2));
  const kwh = energy.slice(0, nowIdx + 1).reduce((a,b) => a + b, 0);
  const hl = holdLine(id);
  return `
  <div class="head"><div class="eyebrow">${esc(greet)}${me.name ? ', ' + esc(me.name.split(' ')[0]) : ''}</div>
    <h1 class="h1">Every zone, comfortable.</h1>
    <p class="sub"><span class="pill ${sc.open ? 'on' : ''}">${esc(sc.label)}</span> ${eff('settings.automation.eco') && !sc.open ? '<span class="pill eco">Eco active</span>' : ''}</p></div>
  <div class="scenes" role="group" aria-label="Scenes">
    <span class="eyebrow">Scenes</span>
    ${SCENES.map(s => `<button class="scene" data-scene="${s.k}" aria-pressed="${active === s.k}" title="${esc(s.note)}">${s.name}</button>`).join('')}
  </div>
  <div class="chips" role="group" aria-label="Zones">
    ${synced.order.map(q => { const s = zoneStatus(q); return `<button class="chip" data-zone="${q}" aria-pressed="${q === id}"><span class="dot" style="background:var(--${s.k === 'ok' ? 'good' : s.k})"></span>${esc(synced.zones[q].name)} <span class="t num" data-live="chip-${q}">${synced.zones[q].offline ? '—' : fmt(sim(q).t) + '°'}</span>${isLocal(`zones.${q}.target`) || isLocal(`zones.${q}.mode`) ? '<span class="tag local">L</span>' : ''}</button>`; }).join('')}
  </div>
  <div class="grid home">
    <div class="col">
      <div class="card thermo ${flashKeys.has('zones.' + id) ? 'flash' : ''}">
        <div class="thermo-top">
          <div><h3 style="justify-content:flex-start">${esc(zc.name)} ${ltag(tPath) || ltag(`zones.${id}.mode`)}</h3><div class="meta">${esc(zc.sensor)} · ${off ? 'last seen ' + ago(seen[id]) : 'live'}${!off && eff('settings.automation.occupancy') ? ` · <span data-live="occ">${r.occ}</span> people` : ''}</div></div>
          <span class="tag ${zoneStatus(id).k}" data-live="status-${id}">${zoneStatus(id).t}</span>
        </div>
        <div class="gauge" data-live="gauge">
          ${gauge(id)}
          <div class="center">
            <div class="lbl">${loc ? 'Local preview' : 'Target'}</div>
            <div class="big num" style="${loc ? 'color:var(--local)' : ''}">${mode === 'off' ? 'Off' : fmt(eff(tPath))}<sup>${mode === 'off' ? '' : deg()}</sup></div>
            <div class="now">Now <b class="num" data-live="now-${id}">${off ? '—' : fmt(r.t) + deg()}</b></div>
          </div>
        </div>
        <p class="shadow-note" data-live="hold" ${hl ? '' : 'hidden'}>${esc(hl)}</p>
        ${loc ? `<p class="shadow-note local">The thermostat is still holding ${fmt(zc.target)}${deg()}. This preview only lives in this window.</p>` : ''}
        <div class="stepper">
          <button class="stepbtn" data-step="${tPath}" data-delta="-1" aria-label="Lower target" ${off || mode === 'off' ? 'disabled' : ''}>−</button>
          <div class="hint">${off ? 'Sensor offline' : mode === 'off' ? 'Zone is off' : localMode ? 'Changes stay in this window' : 'Syncs to all windows'}</div>
          <button class="stepbtn" data-step="${tPath}" data-delta="1" aria-label="Raise target" ${off || mode === 'off' ? 'disabled' : ''}>+</button>
        </div>
        <div class="seg" role="group" aria-label="Mode">
          ${['cool','heat','auto','off'].map(m => `<button data-set="zones.${id}.mode" data-value="${m}" data-mode="${m}" aria-pressed="${mode === m}" ${off ? 'disabled' : ''}>${m[0].toUpperCase() + m.slice(1)}</button>`).join('')}
        </div>
      </div>
      <div class="card">
        <h3>Trend <span class="meta">simulated · last few minutes</span></h3>
        <div class="trend" data-live="trend">${trendSVG(id)}</div>
      </div>
    </div>
    <div class="col">
      <div class="card">
        <h3>Energy today <span class="meta">${eff('settings.automation.eco') ? 'Eco schedule on' : 'Eco schedule off'}</span></h3>
        <div class="stat"><span class="v num">${kwh.toFixed(1)}</span><span class="u">kWh so far</span></div>
        <div class="bars" role="img" aria-label="Energy use through the day">${energy.map((v,i) => `<i class="${i > nowIdx ? 'dim' : ''}" style="height:${(v/4.4*100).toFixed(0)}%"></i>`).join('')}</div>
        <div class="axis"><span>00:00</span><span>12:00</span><span>24:00</span></div>
      </div>
      <div class="card">
        <h3>Average humidity <span class="meta">limit ${eff('settings.thresholds.humidity')}%</span></h3>
        <div class="stat"><span class="v num" data-live="avgh">${avgH.toFixed(0)}</span><span class="u">% RH across ${live.length} live sensor${live.length === 1 ? '' : 's'}</span></div>
        <div class="hbar"><i data-live="avghbar" style="width:${avgH.toFixed(0)}%"></i></div>
      </div>
      <div class="card"><h3>Alerts <button class="btn ghost small" data-go="activity">History</button></h3><div class="alerts" data-live="alerts">${alertsHTML()}</div></div>
    </div>
  </div>`;
}
function alertsHTML(){
  const n = eff('settings.notifications'), out = [];
  for (const id of synced.order){
    const s = zoneStatus(id), z = synced.zones[id], nm = esc(z.name);
    if (s.t === 'Offline' && n.offline) out.push(`<div class="alert"><span class="ic bad">!</span><div>${nm} sensor is offline<small>No reading for ${ago(seen[id]).replace(' ago', '')}</small></div></div>`);
    if (s.t === 'Too hot' && n.highTemp) out.push(`<div class="alert"><span class="ic bad">↑</span><div>${nm} is above ${fmt(eff('settings.thresholds.high'), 0)}${deg()}<small>Currently ${fmt(sim(id).t)}${deg()}</small></div></div>`);
    if (s.t === 'Humid' && n.humidity) out.push(`<div class="alert"><span class="ic warn">≈</span><div>${nm} humidity is ${sim(id).h.toFixed(0)}%<small>Your limit is ${eff('settings.thresholds.humidity')}%</small></div></div>`);
  }
  return out.length ? out.join('') : `<div class="alert"><span class="ic ok">✓</span><div>All clear<small>No zone needs attention</small></div></div>`;
}

function viewSensors(){
  const st = synced.order.map(zoneStatus), c = k => st.filter(s => s.k === k).length;
  return `<div class="head"><div class="eyebrow">Sensors</div><h1 class="h1">Sensor status</h1><p class="sub">Readings are simulated in this demo and refresh every couple of seconds. Tap a zone to adjust it.</p></div>
  <div class="summary" data-live="summary">
    <div class="card"><span class="n num" style="color:var(--good)">${c('ok')}</span><span class="k">Working</span></div>
    <div class="card"><span class="n num" style="color:var(--warn)">${c('warn')}</span><span class="k">Need attention</span></div>
    <div class="card"><span class="n num" style="color:var(--bad)">${c('bad')}</span><span class="k">Offline or hot</span></div>
  </div>
  <div class="grid sensors">
  ${synced.order.map(id => { const s = zoneStatus(id), off = synced.zones[id].offline, zc = synced.zones[id];
    return `<div class="card sensor ${flashKeys.has('zones.' + id) ? 'flash' : ''}">
      <div class="sensor-head"><div><b>${esc(zc.name)}</b><div class="meta">${esc(zc.sensor)} · target ${zc.mode === 'off' ? 'off' : fmt(eff(`zones.${id}.target`)) + deg()} ${ltag(`zones.${id}.target`)}</div></div><span class="tag ${s.k}" data-live="status-${id}">${s.t}</span></div>
      <div class="readings">
        <div class="reading"><div class="v num" data-live="st-${id}">${off ? '—' : fmt(sim(id).t) + '°'}</div><div class="k">Temperature</div></div>
        <div class="reading"><div class="v num" data-live="sh-${id}">${off ? '—' : sim(id).h.toFixed(0) + '%'}</div><div class="k">Humidity</div></div>
      </div>
      <div class="spark" data-live="spark-${id}">${sparkSVG(id)}</div>
      <div class="sensor-foot"><span data-live="seen-${id}">${off ? 'No signal for ' + ago(seen[id]).replace(' ago', '') : 'Updated ' + ago(seen[id])}</span>
        ${off ? `<button class="btn" data-act="reconnect" data-z="${id}">Try reconnecting</button>` : `<button class="btn" data-zone="${id}" data-go="home">Adjust</button>`}</div>
    </div>`; }).join('')}
  </div>`;
}

function alertLogHTML(){
  if (!alertLog.length) return `<div class="empty pad">No alerts yet. When a zone runs hot or humid, or a sensor drops out, it appears here.</div>`;
  const icon = {bad:'!', warn:'≈', ok:'✓'};
  return alertLog.map(a => `<div class="row"><span class="ri ${a.kind}">${icon[a.kind]}</span><div class="rt"><b>${esc(a.text)}</b><small>${ago(a.t)}</small></div></div>`).join('');
}
function viewActivity(){
  const log = synced.log;
  return `<div class="head"><div class="eyebrow">Activity</div><h1 class="h1">What happened</h1><p class="sub">Alerts from this session and every change made to the shared settings.</p></div>
  <div class="section"><div class="section-title eyebrow">Alerts this session</div><div class="rows" data-live="alertlog">${alertLogHTML()}</div></div>
  <div class="section"><div class="section-title eyebrow">Recent changes</div><div class="rows">
    ${log.length ? log.map(e => `<div class="row"><span class="ri">${I.pulse}</span><div class="rt"><b>${esc(e.text)}</b><small>${esc(e.dev === DEV.id ? 'This window' : e.who)} · ${ago(e.t)}</small></div></div>`).join('') : `<div class="empty pad">Nothing yet. Change a target, scene or setting and it shows up here for every window.</div>`}
  </div></div>
  ${log.length ? `<button class="btn ghost" data-act="clearlog" style="margin-top:6px">Clear change history</button>` : ''}`;
}

function row(icon, title, sub, ctl, path, wrap){
  return `<div class="row ${wrap ? 'wrap' : ''} ${path && isLocal(path) ? 'local-row' : ''}"><span class="ri">${I[icon]}</span><div class="rt"><b>${title} ${path ? ltag(path) : ''}</b>${sub ? `<small>${sub}</small>` : ''}</div><div class="ctl">${ctl}</div></div>`;
}
function mini(path, step, fn){ return `<div class="mini"><button data-step="${path}" data-delta="-${step}" aria-label="Decrease">−</button><span class="num">${fn(eff(path))}</span><button data-step="${path}" data-delta="${step}" aria-label="Increase">+</button></div>`; }

function viewSettings(){
  const S = 'settings.', n = synced.order.length;
  return `<div class="head"><div class="eyebrow">Settings</div><h1 class="h1">Settings</h1><p class="sub">${localMode ? 'Local mode is on: anything you change here stays in this window until you sync it.' : 'Changes save automatically and appear in your other open windows within seconds.'}</p></div>

  <div class="section"><div class="section-title eyebrow">Units &amp; appearance</div><div class="rows">
    ${row('therm', 'Temperature unit', 'Used on every screen', `<div class="seg">${['C','F'].map(u => `<button data-set="${S}units" data-value="${u}" aria-pressed="${eff(S + 'units') === u}">°${u}</button>`).join('')}</div>`, S + 'units')}
    ${row('sun', 'Theme', 'Saved on this device only', `<div class="seg">${['dark','light','auto'].map(t => `<button data-theme-set="${t}" aria-pressed="${theme() === t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>`, null, true)}
    ${row('palette', 'Accent color', 'Highlights, buttons and charts', `<div class="swatches">${ACCENTS.map(c => `<button class="swatch" style="background:${c}" data-set="${S}accent" data-value="${c}" aria-pressed="${eff(S + 'accent') === c}" aria-label="Accent ${c}"></button>`).join('')}</div>`, S + 'accent', true)}
  </div></div>

  <div class="section"><div class="section-title eyebrow">Zones <span class="count num">${n} of ${MAX_ZONES}</span></div>
    <div class="zones">
    ${synced.order.map(id => { const z = synced.zones[id]; return `<div class="zone-row ${flashKeys.has('zones.' + id) ? 'flash' : ''}">
      <div class="zr-fields">
        <label class="field"><span>Zone name ${ltag(`zones.${id}.name`)}</span><input id="zn-${id}" type="text" maxlength="40" data-input="zones.${id}.name" value="${esc(eff(`zones.${id}.name`))}"></label>
        <label class="field"><span>Sensor name</span><input id="zs-${id}" type="text" maxlength="40" data-input="zones.${id}.sensor" value="${esc(eff(`zones.${id}.sensor`))}"></label>
      </div>
      <div class="zr-ctl">
        <div class="zr-item"><span>Comfort target</span>${mini(`zones.${id}.comfort`, 1, v => fmt(v) + deg())}</div>
        <div class="zr-item"><span>Sensor offline (demo)</span>${sw(`zones.${id}.offline`, undefined, z.name + ' sensor offline')}</div>
        <button class="btn danger small" data-remove="${id}" ${n <= 1 ? 'disabled' : ''}>${pendingRemove && pendingRemove.id === id ? 'Tap again to remove' : 'Remove'}</button>
      </div>
    </div>`; }).join('')}
    <div class="zone-add">
      <label class="field"><span>New zone</span><input id="new-zone" type="text" maxlength="40" placeholder="For example, Front desk"></label>
      <button class="btn primary" data-act="addzone" ${n >= MAX_ZONES ? 'disabled' : ''}>${I.plus} Add zone</button>
    </div>
    </div>
  </div>

  <div class="section"><div class="section-title eyebrow">Weekly schedule</div><div class="rows">
    ${DAYS.map(([k, nm]) => { const p = S + 'schedule.' + k, closed = eff(p + '.closed');
      return `<div class="row sched ${isLocal(p + '.open') || isLocal(p + '.close') || isLocal(p + '.closed') ? 'local-row' : ''}">
        <div class="rt"><b>${nm}</b><small>${closed ? 'Closed' : 'Open'}</small></div>
        <div class="ctl"><input class="time" type="time" id="t-${k}-open" aria-label="${nm} opening time" data-input="${p}.open" value="${esc(eff(p + '.open'))}" ${closed ? 'disabled' : ''}><span class="dash">–</span><input class="time" type="time" id="t-${k}-close" aria-label="${nm} closing time" data-input="${p}.close" value="${esc(eff(p + '.close'))}" ${closed ? 'disabled' : ''}>
        <button class="sw" role="switch" aria-checked="${!closed}" data-toggle="${p}.closed" aria-label="${nm} open"></button></div></div>`; }).join('')}
    <div class="howto">Outside these hours the eco schedule relaxes each zone's target. The thermostat follows this, and it shows on the home screen.</div>
  </div></div>

  <div class="section"><div class="section-title eyebrow">Automation</div><div class="rows">
    ${row('leaf', 'Eco schedule', 'Relax targets when closed', sw(S + 'automation.eco'), S + 'automation.eco')}
    ${row('leaf', 'Eco setback', 'How far to relax while closed', mini(S + 'setback', 0.5, v => fmtD(v) + deg()), S + 'setback', true)}
    ${row('people', 'Occupancy cooling', 'Cool a little harder when a zone is busy', sw(S + 'automation.occupancy'), S + 'automation.occupancy')}
    ${row('snow', 'Pre-cool before opening', 'Start 30 minutes early', sw(S + 'automation.precool'), S + 'automation.precool')}
  </div></div>

  <div class="section"><div class="section-title eyebrow">Alert limits</div><div class="rows">
    ${row('flame', 'High temperature', 'Alert when any zone reaches this', mini(S + 'thresholds.high', 1, v => fmt(v, 0) + deg()), S + 'thresholds.high', true)}
    ${row('drop', 'Humidity', 'Alert when relative humidity reaches this', mini(S + 'thresholds.humidity', 5, v => v + '%'), S + 'thresholds.humidity', true)}
  </div></div>

  <div class="section"><div class="section-title eyebrow">Notifications</div><div class="rows">
    ${row('bell', 'Push notifications', 'On phones and tablets', sw(S + 'notifications.push'), S + 'notifications.push')}
    ${row('mail', 'Daily email digest', 'A summary every morning', sw(S + 'notifications.email'), S + 'notifications.email')}
    ${row('flame', 'High-temperature alerts', '', sw(S + 'notifications.highTemp'), S + 'notifications.highTemp')}
    ${row('drop', 'Humidity alerts', '', sw(S + 'notifications.humidity'), S + 'notifications.humidity')}
    ${row('wifi', 'Offline sensor alerts', '', sw(S + 'notifications.offline'), S + 'notifications.offline')}
  </div></div>`;
}

function viewAccount(){
  const devs = Object.entries(devices).sort((a,b) => b[1].at - a[1].at);
  if (!devices[DEV.id]) devs.unshift([DEV.id, {name:DEV.name, mobile:DEV.mobile, at:null}]);
  return `<div class="head"><div class="eyebrow">Account</div><h1 class="h1">Account &amp; data</h1><p class="sub">Your profile, the windows that share your settings, and your data.</p></div>
  <div class="grid" style="gap:14px">
    <div class="card profile"><span class="avatar">${esc((me.name || 'T')[0].toUpperCase())}</span><div><b>${esc(me.name || 'Guest')}</b><div class="meta">${ref ? 'Settings sync is on for this browser' : 'Settings stay in this window'}</div></div></div>
    <div class="section"><div class="section-title eyebrow">Windows sharing your settings</div><div class="rows">
      ${devs.map(([id, d]) => `<div class="device"><span class="ri">${d.mobile ? I.phone : I.laptop}</span><div class="rt">${esc(d.name)}${id === DEV.id ? ' <span class="tag ok">This window</span>' : ''}<small>${d.at ? 'Last change ' + ago(d.at) : 'No changes yet'}</small></div></div>`).join('')}
      <div class="howto">Open TempWise in a second tab or window. Changes there show up here automatically, or tap <b>Refresh</b> to check now. To sync phones and computers, connect a backend (see the README).</div>
    </div></div>
    <div class="section"><div class="section-title eyebrow">Sync</div><div class="rows">
      ${row('refresh', 'Refresh from other windows', `Last checked ${ago(lastSyncAt)}${lastWriter ? ` · last change from ${esc(lastWriter.device === DEV.id ? 'this window' : lastWriter.name)}` : ''}`, `<button class="btn" data-act="refresh">Refresh</button>`)}
      ${row('phone', 'Local mode', 'Try changes in this window without touching the thermostat or other windows', `<button class="sw" role="switch" aria-checked="${localMode}" data-act="local" aria-label="Local mode"></button>`)}
    </div></div>
    <div class="section"><div class="section-title eyebrow">Your data</div><div class="rows">
      ${row('down', 'Export settings', 'Zones, schedule and limits as a JSON file', `<button class="btn" data-act="export-json">Export</button>`)}
      ${row('up', 'Import settings', 'Load a file you exported before', `<button class="btn" data-act="import">Import</button><input id="import-file" type="file" accept="application/json,.json" hidden>`)}
      ${row('down', 'Export sensor readings', 'Recent simulated readings as a CSV file', `<button class="btn" data-act="export-csv">Export</button>`)}
      ${row('refresh', 'Reset demo data', 'Put every zone and setting back to its default', `<button class="btn" data-act="reset">Reset</button>`)}
      ${installEvt ? row('phone', 'Install TempWise', 'Add it to your home screen or desktop', `<button class="btn primary" data-act="install">Install</button>`) : ''}
    </div></div>
    <button class="btn danger" data-act="logout" style="padding:12px">Log out</button>
  </div>`;
}

function viewLogin(){
  const saved = window.TempWiseSync ? window.TempWiseSync.profile().name : '';
  return `<div class="auth"><div class="auth-card">
    <div><svg class="logo" viewBox="0 0 64 64">${logo().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
    <h1>Temp<span>Wise</span></h1><div class="tagline">Perfect temperature. Automatically.</div></div>
    <div><div class="welcome">${saved ? 'Welcome back' : 'Welcome'}</div><p class="fine" style="margin-top:4px">Climate control for shops, gyms and work floors</p></div>
    <label class="field"><span>Your name</span><input id="login-name" type="text" autocomplete="name" placeholder="Optional" value="${esc(saved)}" maxlength="40"></label>
    <button class="btn primary" data-act="login">Continue →</button>
    <p class="fine">This is a demo. Your name and settings stay in this browser and are never sent anywhere.</p>
  </div></div>`;
}
function viewLoggedOut(){
  return `<div class="auth"><div class="auth-card">
    <div class="wave">${I.wave}</div>
    <div><h1 style="font-size:26px">See you soon!</h1><p class="tagline" style="margin-top:8px">You’ve logged out in this window. Thermostats keep running on your saved settings.</p></div>
    <button class="btn primary" data-act="login">Log in again</button>
  </div></div>`;
}

/* ================= render ================= */
const NAV = [['home','Home','home'], ['sensors','Sensors','sensor'], ['activity','Activity','pulse'], ['settings','Settings','gear'], ['account','Account','user']];
function render(){
  applyAccent();
  const root = document.getElementById('root');
  const focusId = document.activeElement && document.activeElement.id;
  const sel = document.activeElement && document.activeElement.selectionStart;
  if (screen === 'login'){ root.innerHTML = viewLogin(); return; }
  if (screen === 'loggedout'){ root.innerHTML = viewLoggedOut(); return; }
  const body = screen === 'sensors' ? viewSensors() : screen === 'activity' ? viewActivity() : screen === 'settings' ? viewSettings() : screen === 'account' ? viewAccount() : viewHome();
  const nav = NAV.map(([k, l, i]) => `<button class="tab" data-go="${k}" aria-current="${screen === k ? 'page' : 'false'}">${I[i]}<span>${l}</span></button>`).join('');
  root.innerHTML = `<div class="app">
    <nav class="rail" aria-label="Main"><div class="brand">${logo()}<b>Temp<span>Wise</span></b></div>${nav}<div class="spacer"></div><div class="meta rail-dev">${esc(DEV.name)}</div></nav>
    <main class="main">${topbar()}${body}</main>
    <nav class="tabbar" aria-label="Main">${nav}</nav>
  </div>`;
  document.getElementById('synctxt').textContent = syncText();
  if (focusId){ const f = document.getElementById(focusId); if (f){ f.focus(); try { if (sel != null) f.setSelectionRange(sel, sel); } catch {} } }
}
function paintLive(){
  const q = s => document.querySelector(`[data-live="${s}"]`);
  const set = (k, v) => { const e = q(k); if (e) e.textContent = v; };
  for (const id of synced.order){
    const off = synced.zones[id].offline, r = sim(id);
    set('chip-' + id, off ? '—' : fmt(r.t) + '°');
    set('now-' + id, off ? '—' : fmt(r.t) + deg());
    set('st-' + id, off ? '—' : fmt(r.t) + '°');
    set('sh-' + id, off ? '—' : r.h.toFixed(0) + '%');
    set('seen-' + id, off ? 'No signal for ' + ago(seen[id]).replace(' ago', '') : 'Updated ' + ago(seen[id]));
    const st = q('status-' + id); if (st){ const s = zoneStatus(id); st.className = 'tag ' + s.k; st.textContent = s.t; }
    const sp = q('spark-' + id); if (sp) sp.innerHTML = sparkSVG(id);
  }
  const zid = curZone();
  const al = q('alerts'); if (al) al.innerHTML = alertsHTML();
  const lg = q('alertlog'); if (lg) lg.innerHTML = alertLogHTML();
  const live = synced.order.filter(z => !synced.zones[z].offline);
  const avg = live.length ? live.reduce((a, z) => a + sim(z).h, 0) / live.length : 0;
  set('avgh', avg.toFixed(0));
  const ab = q('avghbar'); if (ab) ab.style.width = avg.toFixed(0) + '%';
  const g = q('gauge'); if (g){ const svg = g.querySelector('svg'); if (svg) svg.outerHTML = gauge(zid); }
  const tr = q('trend'); if (tr) tr.innerHTML = trendSVG(zid);
  set('occ', sim(zid).occ);
  const hd = q('hold'); if (hd){ const t = holdLine(zid); hd.textContent = t; hd.hidden = !t; }
  const t = document.getElementById('synctxt'); if (t) t.textContent = syncText();
}

/* ================= events ================= */
function go(s){ screen = s; ss.set('tw-screen', s); render(); window.scrollTo(0, 0); }
function stepSize(p){
  if (p.endsWith('.target') || p.endsWith('.comfort')) return units() === 'F' ? 5/9 : 0.5;
  if (p.endsWith('thresholds.high')) return units() === 'F' ? 5/9 : 1;
  if (p === 'settings.setback') return 0.5;
  return 1;
}
function stepValue(p, d){
  const cur = eff(p), v = Math.round((cur + d * stepSize(p)) * 100) / 100;
  if (/\.(target|comfort)$/.test(p)) return clamp(10, 32, v);
  if (p.endsWith('thresholds.high')) return clamp(18, 40, v);
  if (p === 'settings.setback') return clamp(0.5, 5, Math.round((cur + d * 0.5) * 10) / 10);
  return cur + d;
}
function addZone(){
  const input = document.getElementById('new-zone'), name = (input && input.value.trim()) || '';
  if (!name){ toast('Give the new zone a name first'); if (input) input.focus(); return; }
  if (synced.order.length >= MAX_ZONES){ toast(`You can have up to ${MAX_ZONES} zones`); return; }
  const id = 'z' + Date.now().toString(36);
  mutate(() => {
    synced.zones[id] = {name, sensor:'Sensor ' + pad(synced.order.length + 1), target:21, comfort:21, mode:'auto', offline:false};
    synced.order.push(id);
  }, 'zone-add-' + id, `Added zone ${name}`);
}
function removeZone(id){
  if (!pendingRemove || pendingRemove.id !== id){ pendingRemove = {id}; setTimeout(() => { if (pendingRemove && pendingRemove.id === id){ pendingRemove = null; if (screen === 'settings') render(); } }, 3500); render(); return; }
  pendingRemove = null;
  const nm = synced.zones[id].name;
  mutate(() => {
    delete synced.zones[id]; synced.order = synced.order.filter(z => z !== id);
    Object.keys(overlay).forEach(k => { if (k.startsWith(`zones.${id}.`)) delete overlay[k]; });
    delete R[id]; delete hist[id];
  }, 'zone-del-' + id, `Removed zone ${nm}`);
}
function applyScene(k){
  const s = SCENES.find(x => x.k === k); if (!s) return;
  const pairs = [];
  synced.order.forEach(id => { const z = synced.zones[id]; if (z.offline) return; const r = s.f(z); pairs.push([`zones.${id}.target`, clamp(10, 32, r.target)], [`zones.${id}.mode`, r.mode]); });
  if (!pairs.length){ toast('No online sensors to apply a scene to'); return; }
  applyPaths(pairs, 'scene', `Scene “${s.name}” applied`);
  toast(`${s.name}: ${s.note.toLowerCase()}`);
}
function exportJSON(){
  download('tempwise-settings.json', JSON.stringify({app:'tempwise', version:2, exported:new Date().toISOString(), state:{zones:synced.zones, order:synced.order, settings:synced.settings}}, null, 2), 'application/json');
  toast('Settings exported');
}
function exportCSV(){
  const rows = ['time,zone,temperature_c,humidity_percent'];
  synced.order.forEach(id => (hist[id] || []).forEach(p => rows.push(`${new Date(p.t).toISOString()},"${synced.zones[id].name.replace(/"/g, '""')}",${p.temp.toFixed(2)},${p.hum.toFixed(1)}`)));
  if (rows.length === 1){ toast('No readings yet'); return; }
  download('tempwise-readings-simulated.csv', rows.join('\n'), 'text/csv');
  toast('Readings exported (simulated data)');
}
function importFile(file){
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const j = JSON.parse(String(rd.result)), st = j && (j.state || j);
      if (!st || typeof st !== 'object' || !(st.zones || st.settings)) throw new Error('shape');
      const next = normalize(st);
      mutate(() => { next.log = synced.log; synced = next; Object.keys(R).forEach(k => delete R[k]); overlay = {}; }, 'import', 'Settings imported from a file');
      toast('Settings imported');
    } catch { toast('That file isn’t a TempWise settings export'); }
  };
  rd.readAsText(file);
}

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.zone){ zoneId = b.dataset.zone; ss.set('tw-zone', zoneId); if (!b.dataset.go){ render(); return; } }
  if (b.dataset.go){ go(b.dataset.go); return; }
  if (b.dataset.scene){ applyScene(b.dataset.scene); return; }
  if (b.dataset.remove){ removeZone(b.dataset.remove); return; }
  if (b.dataset.themeSet){ ls.set('theme', b.dataset.themeSet); applyTheme(); render(); return; }
  if (b.dataset.toggle){ setValue(b.dataset.toggle, !eff(b.dataset.toggle)); return; }
  if (b.dataset.set){ setValue(b.dataset.set, b.dataset.value); return; }
  if (b.dataset.step){
    const p = b.dataset.step, d = +b.dataset.delta;
    if (p === 'settings.thresholds.humidity') setValue(p, clamp(30, 90, eff(p) + d));
    else setValue(p, stepValue(p, d > 0 ? 1 : -1));
    return;
  }
  switch (b.dataset.act){
    case 'refresh': refresh(b.classList.contains('iconbtn') ? b : null); break;
    case 'theme': { const o = ['dark','light','auto']; ls.set('theme', o[(o.indexOf(theme()) + 1) % 3]); applyTheme(); render(); toast('Theme: ' + theme()); break; }
    case 'local': localMode = !localMode; ss.set('tw-local', localMode ? '1' : '0'); toast(localMode ? 'Local mode on: changes stay in this window' : 'Local mode off: changes sync again'); render(); break;
    case 'discard': overlay = {}; saveOverlay(); applyAccent(); toast('Local changes discarded'); render(); break;
    case 'push': {
      const n = localCount(); const pairs = Object.entries(overlay).filter(([p]) => isLocal(p));
      pairs.forEach(([p, v]) => setPath(synced, p, v));
      overlay = {}; saveOverlay(); localMode = false; ss.set('tw-local', '0');
      logEvent('push', `${n} local change${n > 1 ? 's' : ''} synced`); applyAccent(); render(); scheduleWrite();
      toast(`${n} change${n > 1 ? 's' : ''} sent to all windows`); break;
    }
    case 'addzone': addZone(); break;
    case 'clearlog': synced.log = []; render(); scheduleWrite(); break;
    case 'reconnect': toast(`Still no signal from ${synced.zones[b.dataset.z].sensor}. Check its power and Wi-Fi.`); break;
    case 'export-json': exportJSON(); break;
    case 'export-csv': exportCSV(); break;
    case 'import': { const f = document.getElementById('import-file'); if (f) f.click(); break; }
    case 'install': if (installEvt){ installEvt.prompt(); installEvt = null; render(); } break;
    case 'reset': {
      synced = normalize(null); overlay = {}; saveOverlay(); Object.keys(R).forEach(k => delete R[k]); zoneId = 'gym';
      logEvent('reset', 'Demo data reset to defaults'); applyAccent(); render(); scheduleWrite(); toast('Demo data reset to defaults'); break;
    }
    case 'logout': ls.set('tw-signed', '0'); screen = 'loggedout'; render(); break;
    case 'login': {
      const inp = document.getElementById('login-name');
      if (inp && window.TempWiseSync) window.TempWiseSync.setProfile(inp.value.trim());
      me.name = window.TempWiseSync ? window.TempWiseSync.profile().name || '' : '';
      ls.set('tw-signed', '1'); go(ss.get('tw-screen') && ss.get('tw-screen') !== 'login' ? ss.get('tw-screen') : 'home'); break;
    }
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'import-file' && el.files && el.files[0]){ importFile(el.files[0]); el.value = ''; return; }
  if (!el.dataset || !el.dataset.input) return;
  const p = el.dataset.input;
  if (/\.(name|sensor)$/.test(p)){ const v = el.value.trim(); if (!v){ el.value = eff(p); return; } if (v !== eff(p)) setValue(p, v); return; }
  if (el.value) setValue(p, el.value);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target) return;
  if (e.target.id === 'login-name') document.querySelector('[data-act=login]').click();
  if (e.target.id === 'new-zone') addZone();
});
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (screen === 'account') render(); });
window.addEventListener('storage', e => { if (e.key === 'tempwise:theme'){ applyTheme(); render(); } });

applyTheme();
setInterval(tick, TICK);
setInterval(() => { const t = document.getElementById('synctxt'); if (t) t.textContent = syncText(); }, 15000);
render();
connect();
})();
