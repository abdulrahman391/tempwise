/* Registers the service worker so the site works offline and can be installed. */
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (!/^https:$|^http:$/.test(location.protocol)) return;
  var here = document.currentScript && document.currentScript.src;
  if (!here) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(new URL('../sw.js', here).href).catch(function () {});
  });
})();
