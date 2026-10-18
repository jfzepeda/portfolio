// Pre-hydration script — restores view mode (executive/technical) and theme
// (dark/light) before first paint, and flags `.js` so layered reveals only hide
// content when scripting is available.

const SCRIPT = `
(function() {
  var d = document.documentElement;
  d.classList.add('js');
  var mode = 'executive', theme = 'dark';
  try {
    var m = localStorage.getItem('jfz:mode');
    if (m === 'executive' || m === 'technical') mode = m;
    var t = localStorage.getItem('jfz:theme');
    if (t === 'dark' || t === 'light') theme = t;
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
  } catch (e) {}
  d.setAttribute('data-mode', mode);
  d.setAttribute('data-theme', theme);
})();
`;

export function ModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
