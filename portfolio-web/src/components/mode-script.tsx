// Pre-hydration script — only manages Executive/Technical content mode now.
// Typography (Mono-led) and density (Cozy) are locked in globals.css.

const SCRIPT = `
(function() {
  try {
    var mode = localStorage.getItem('jfz:mode');
    if (mode !== 'executive' && mode !== 'technical') mode = 'executive';
    document.documentElement.setAttribute('data-mode', mode);
  } catch (e) {
    document.documentElement.setAttribute('data-mode', 'executive');
  }
})();
`;

export function ModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
