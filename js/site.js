/* TempWise landing page — fills in the GitHub links. */
(function () {
  var cfg = window.TEMPWISE_CONFIG || {};
  var repo = cfg.repo || '';
  // On GitHub Pages (https://USER.github.io/REPO/) the repo address can be worked out.
  if (!repo && /\.github\.io$/i.test(location.hostname)) {
    var user = location.hostname.split('.')[0];
    var name = location.pathname.split('/').filter(Boolean)[0];
    repo = name ? 'https://github.com/' + user + '/' + name : 'https://github.com/' + user + '/' + user + '.github.io';
  }
  document.querySelectorAll('[data-repo]').forEach(function (a) {
    if (repo) { a.href = repo; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.hidden = true; }   // no known repo yet: hide the button instead of linking nowhere
  });
})();
