(async function () {
  const board = document.getElementById('board');
  const stopBtn = document.getElementById('stopAll');
  const filterInput = document.getElementById('filter');
  let currentAudios = [];

  function createButton(name, url) {
    const btn = document.createElement('button');
    btn.className = 'sound-btn';
    btn.textContent = prettifyName(name);
    btn.onclick = () => {
      stopAll();
      const a = new Audio(url);
      a.play();
      currentAudios.push(a);
      a.onended = () => currentAudios = currentAudios.filter(x => x !== a);
    };
    return btn;
  }

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

  // Probeer eerst een sounds/list.json te laden, fallback naar ingebouwde lijst (de bestanden in je repo)
  let sounds = [];
  try {
    const res = await fetch('sounds/list.json', { cache: 'no-store' });
    if (res.ok) sounds = await res.json();
    else throw new Error('no list');
  } catch (err) {
    sounds = [
      "aaah.mp3","airhorn.mp3","attention.mp3","67.mp3","Hema.mp3",
      "Ik niet.mp3","Lit.mp3","Nou.mp3","Siren.mp3","Stfu.mp3",
      "Vasanta.mp3","croissant.mp3","damn.mp3","dududu.mp3","explosion-sound.mp3"
    ];
  }

  sounds.forEach(name => {
    const wrapper = document.createElement('div');
    wrapper.className = 'sound-item';
    wrapper.dataset.name = name.toLowerCase();
    const btn = createButton(name, `sounds/${encodeURIComponent(name)}`);
    wrapper.appendChild(btn);
    board.appendChild(wrapper);
  });

  window.stopAll = stopAll;
})();
