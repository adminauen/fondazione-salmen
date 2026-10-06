(() => {
  const key = 'salmen-language';
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  const explicit = new URLSearchParams(location.search).get('lang');
  if (explicit === 'it' || explicit === 'de') {
    saved = explicit;
    try { localStorage.setItem(key, explicit); } catch {}
  }
  // Only the neutral entry point negotiates language; shared page links stay intact.
  if ((location.pathname === '/' || location.pathname === '/index.html') && !explicit) {
    const preferred = (navigator.languages?.[0] || navigator.language || 'it').toLowerCase();
    const language = saved === 'it' || saved === 'de' ? saved : preferred.startsWith('de') ? 'de' : 'it';
    if (language === 'de') location.replace('/de/index.html' + location.search + location.hash);
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.language').forEach(link => {
      const language = link.lang;
      const url = new URL(link.href);
      url.searchParams.set('lang', language);
      link.href = url.href;
      link.addEventListener('click', () => {
        try { localStorage.setItem(key, language); } catch {}
      });
    });
  });
})();
