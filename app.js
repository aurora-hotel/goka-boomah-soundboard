// app.js — laad sounds/list.json of fallback naar GitHub API listing
(async function () {
  const REPO_OWNER = 'aurora-hotel';
  const REPO_NAME = 'goka-boomah-soundboard';
  const REPO_REF = 'main'; // pas aan indien nodig

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

  stopBtn.addEventListener('click', stopAll);

  filterInput.addEventListener('input', () => {
    const q = filterInput.value.toLowerCase();
    Array.from(board.children).forEach(child => {
      const visible = child.dataset.name.includes(q);
      child.style.display = visible ? '' : 'none';
    });
  });

  // Kies de beste URL voor de browser (ogg -> fallback mp3 indien nodig)
  function getPlayableUrl(name) {
    const test = document.createElement('audio');
    const isOgg = /\.ogg$/i.test(name);
    const encoded = encodeURIComponent(name).replace(/%2F/g, '/');
    const relativeUrl = `sounds/${encoded}`;

    if (isOgg) {
      // Als de browser Ogg ondersteunt, gebruik .ogg, anders probeer .mp3
      if (test.canPlayType('audio/ogg; codecs="vorbis"')) return relativeUrl;
      return `sounds/${encodeURIComponent(name.replace(/\.ogg$/i, '.mp3'))}`;
    }

    return relativeUrl;
  }

  function createButton(name) {
    const btn = document.createElement('button');
    btn.className = 'sound-btn';
    btn.textContent = prettifyName(name);
    btn.onclick = async () => {
      stopAll();
      const url = getPlayableUrl(name);
      const a = new Audio(url);
      // Probeer te spelen; bij fout (bv. 404 of browser block) probeer fallback als relevant
      try {
        await a.play();
      } catch (err) {
        // als origineel .ogg was → probeer mp3
        if (/\.ogg$/i.test(name)) {
          const mp3Url = `sounds/${encodeURIComponent(name.replace(/\.ogg$/i, '.mp3'))}`;
          a.src = mp3Url;
          try { await a.play(); } catch (e) { console.warn('Fallback mp3 play failed', e); }
        } else {
          console.warn('Play failed for', url, err);
        }
      }
      currentAudios.push(a);
      a.onended = () => currentAudios = currentAudios.filter(x => x !== a);
    };
    return btn;
  }

  // Probeer eerst lokaal list.json, anders GitHub API (public repo)
  async function loadSoundsList() {
    // 1) lokaal list.json
    try {
      const r = await fetch('sounds/list.json', { cache: 'no-store' });
      if (r.ok) {
        const json = await r.json();
        if (Array.isArray(json) && json.length) return json;
      }
    } catch (e) { /* ignore */ }

    // 2) GitHub Contents API fallback (werkt voor publieke repos)
    try {
      const api = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/sounds?ref=${REPO_REF}`;
      const res = await fetch(api);
      if (!res.ok) throw new Error('GitHub API error ' + res.status);
      const items = await res.json();
      const files = items
        .filter(it => it.type === 'file')
        .map(it => it.name)
        .sort((a,b) => a.localeCompare(b, 'nl', { sensitivity: 'base' }));
      if (files.length) return files;
    } catch (err) {
      console.warn('Kan GitHub API niet bereiken of geen bestanden gevonden:', err);
    }

    // 3) fallback ingebouwde lijst (zorg dat dit overeenkomt met repo)
    return [
      "aaah.mp3","airhorn.mp3","attention.mp3","67.mp3","Hema.mp3",
      "Ik niet.mp3","Lit.mp3","Nou.mp3","Siren.mp3","Stfu.mp3",
      "Vasanta.mp3","croissant.mp3","damn.mp3","dududu.mp3","explosion-sound.mp3"
    ];
  }

  // Init
  const sounds = await loadSoundsList();

  // Bouw knop voor elk geluid
  board.innerHTML = '';
  sounds.forEach(name => {
    const wrapper = document.createElement('div');
    wrapper.className = 'sound-item';
    wrapper.dataset.name = name.toLowerCase();
    const btn = createButton(name);
    wrapper.appendChild(btn);
    board.appendChild(wrapper);
  });

  // Expose stopAll
  window.stopAll = stopAll;
})();
