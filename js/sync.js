/* TempWise — settings sync adapter
 *
 * The app talks to one small object (a "ref") with three methods:
 *
 *   ref.get()                 -> Promise of a snapshot
 *   ref.set(body)             -> Promise, saves the whole settings document
 *   ref.onSnapshot(next, err) -> calls next(snapshot) now and on every change; returns an unsubscribe function
 *
 * A snapshot looks like { exists, data(), metadata }.
 *
 * This default adapter keeps the document in localStorage and uses the
 * browser's "storage" event, so every open tab or window of the site on the
 * same browser updates live. It does not reach other phones or computers.
 *
 * To sync real devices, replace open() with one that reads and writes a
 * backend (Firebase, Supabase, your own API) and keeps this same shape.
 * The README has an example.
 */
(function () {
  const KEY = 'tempwise:v1:state';
  const PROFILE = 'tempwise:v1:profile';

  function usable() {
    try { localStorage.setItem('__tw', '1'); localStorage.removeItem('__tw'); return true; }
    catch (e) { return false; }
  }
  function read() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  function snap(data) {
    return { exists: !!data, data: () => data || undefined, metadata: { fromCache: false, hasPendingWrites: false } };
  }

  const listeners = new Set();
  window.addEventListener('storage', e => {
    if (e.key !== KEY) return;
    const s = snap(read());
    listeners.forEach(fn => { try { fn(s); } catch (err) { console.error(err); } });
  });

  const ref = {
    get: async () => snap(read()),
    set: async body => { localStorage.setItem(KEY, JSON.stringify(body)); },
    onSnapshot(next) {
      listeners.add(next);
      setTimeout(() => next(snap(read())), 0);
      return () => listeners.delete(next);
    },
  };

  window.TempWiseSync = {
    open: () => (usable() ? ref : null),
    profile() {
      try { return JSON.parse(localStorage.getItem(PROFILE)) || { name: '' }; } catch (e) { return { name: '' }; }
    },
    setProfile(name) {
      try { localStorage.setItem(PROFILE, JSON.stringify({ name: name || '' })); } catch (e) {}
    },
  };
})();
