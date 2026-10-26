(() => {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  if (header && menu) {
    header.classList.add('menu-ready');
    const closeMenu = () => {
      menu.setAttribute('aria-expanded', 'false');
      header.classList.remove('menu-open');
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      header.classList.toggle('menu-open', open);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) {
        closeMenu(); menu.focus();
      }
    });
    document.addEventListener('click', e => { if (!header.contains(e.target)) closeMenu(); });
    header.querySelectorAll('nav a').forEach(a => a.addEventListener('click', closeMenu));
    matchMedia('(min-width: 1101px)').addEventListener('change', closeMenu);
  }

  const photos = [...document.querySelectorAll('.photo-expand')];
  if (!photos.length || !window.HTMLDialogElement) return;
  const de = document.documentElement.lang === 'de';
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-dialog';
  dialog.setAttribute('aria-label', de ? 'Fotogalerie' : 'Galleria fotografica');
  dialog.innerHTML = `<button class="photo-close" type="button" aria-label="${de ? 'Schliessen' : 'Chiudi'}">×</button><figure><img alt=""><figcaption></figcaption></figure><div class="photo-controls"><button type="button" class="photo-prev" aria-label="${de ? 'Vorheriges Foto' : 'Foto precedente'}">←</button><span class="photo-counter" aria-live="polite"></span><button type="button" class="photo-next" aria-label="${de ? 'Nächstes Foto' : 'Foto successiva'}">→</button></div>`;
  document.body.append(dialog);
  let current = 0;
  let opener;
  const show = index => {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    const img = dialog.querySelector('img');
    img.src = photo.href;
    img.alt = photo.querySelector('img').alt;
    dialog.querySelector('figcaption').textContent = img.alt;
    dialog.querySelector('.photo-counter').textContent = `${current + 1} / ${photos.length}`;
  };
  photos.forEach((photo, index) => photo.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); opener = photo; show(index); dialog.showModal();
    document.body.classList.add('photo-viewing');
  }));
  dialog.querySelector('.photo-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.photo-prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.photo-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault(); show(current + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('photo-viewing'); opener?.focus();
  });
})();
