// Pre-hydration script — sets data-lang on <html> based on localStorage.
// Mirrors ModeScript so initial paint matches the user's last choice.

const SCRIPT = `
(function() {
  try {
    var lang = localStorage.getItem('jfz:lang');
    if (lang !== 'en' && lang !== 'es') lang = 'en';
    document.documentElement.setAttribute('data-lang', lang);
  } catch (e) {
    document.documentElement.setAttribute('data-lang', 'en');
  }
})();
`;

export function LangScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
