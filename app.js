// app.js — toon alleen .mp3 bestanden in het soundboard
(async function () {
  const REPO_OWNER = 'aurora-hotel';
  const REPO_NAME = 'goka-boomah-soundboard';
  const REPO_REF = 'main';

  const board = document.getElementById('board');
  const stopBtn = document.getElementById('stopAll');
  const filterInput = document.getElementById('filter');
  let currentAudios = [];

  function prettifyName(filename) {
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function stopAll() {
    currentAudios.forEach(a => { try { a.pause(); a.currentTime = 0; } catch(e){} });
    currentAudios = [];
  }

  stopBtn && stopBtn.addEventListener('click', stopAll);

  filterInput && filterInput.addEventListener('input', () => {
    const q = filterInput.value.toLowerCase();
    Array.from(board.children).forEach(child => {
      const visible = child.dataset.name.includes(q);
      child.style.display = visible ? '' : 'none';
    });
  });

  function createButton(name) {
    const btn = document.createElement('button');
    btn.className = 'sound-btn';
    btn.textContent = prettifyName(name);
    btn.onclick = async () => {
      stopAll();
      const url = `sounds/${encodeURIComponent(name).replace(/%2F/g, '/')}`;
      const a = new Audio(url);
      try {
        await a.play();
      } catch (err) {
        console.warn('Play failed for', url, err);
      }
      currentAudios.push(a);
      a.onended = () => currentAudios = currentAudios.filter(x => x !== a);
    };
    return btn;
  }

  // Load list.json (preferred) or fallback to GitHub API listing.
  async function loadSoundsList() {
    // 1) local list.json
    try {
      const r = await fetch('sounds/list.json', { cache: 'no-store' });
      if (r.ok) {
        const json = await r.json();
        if (Array.isArray(json) && json.length) {
          return json.filter(n => /\.mp3$/i.test(n));
        }
      }
    } catch (e) { /* ignore */ }

    // 2) GitHub Contents API fallback (public repo)
    try {
      const api = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/sounds?ref=${REPO_REF}`;
      const res = await fetch(api);
      if (res.ok) {
        const items = await res.json();
        const files = items
          .filter(it => it.type === 'file' && /\.mp3$/i.test(it.name))
          .map(it => it.name)
          .sort((a,b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        if (files.length) return files;
      }
    } catch (err) {
      console.warn('GitHub API fallback failed:', err);
    }

    // 3) fallback: lege lijst
    return [];
  }

  // Init
  const sounds = await loadSoundsList();

  board.innerHTML = '';
  if (sounds.length === 0) {
    const msg = document.createElement('div');
    msg.textContent = 'Geen MP3-bestanden gevonden in sounds/.';
    board.appendChild(msg);
    return;
  }

  sounds.forEach(name => {
    const wrapper = document.createElement('div');
    wrapper.className = 'sound-item';
    wrapper.dataset.name = name.toLowerCase();
    const btn = createButton(name);
    wrapper.appendChild(btn);
    board.appendChild(wrapper);
  });

  // Expose for debugging
  window.stopAll = stopAll;
})();
