// Inlined script that runs before React hydration — sets data-mode and
// data-theme on <html> from localStorage to avoid flash of wrong UI.
//
// Defaults: dark theme + executive mode (the "decision-maker first" stance).

const SCRIPT = `
(function() {
  try {
    var mode = localStorage.getItem('jfz:mode');
    if (mode !== 'executive' && mode !== 'technical') mode = 'executive';
    document.documentElement.setAttribute('data-mode', mode);

    var theme = localStorage.getItem('jfz:theme');
    if (theme !== 'light' && theme !== 'dark') {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-mode', 'executive');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export function ModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
