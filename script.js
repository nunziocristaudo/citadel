const gallery = document.getElementById('gallery');

const TILE_SIZE = 150;
const GAP_SIZE = 2;
const VIEWPORT_BUFFER = 2;
const WORLD_SIZE = 5000;
let scaleFactor = 1;
let loadedTiles = new Set();
let images = [];
let imageIndex = 0;

// Shuffle array function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Fetch images dynamically from GitHub
async function fetchImages() {
  const response = await fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images');
  const files = await response.json();
  images = files
    .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|mp4)$/i))
    .map(file => file.download_url);

  shuffleArray(images);
}

// Place a tile (fully protected)
function placeTile(x, y) {
  const key = `${x},${y}`;
  if (loadedTiles.has(key)) return;
  if (images.length === 0) return;

  const fileUrl = images[imageIndex % images.length];
  imageIndex++;

  const postDiv = document.createElement('div');
  postDiv.className = 'post fade-in';
  postDiv.style.left = `${x * (TILE_SIZE + GAP_SIZE) * scaleFactor}px`;
  postDiv.style.top = `${y * (TILE_SIZE + GAP_SIZE) * scaleFactor}px`;
  postDiv.style.width = `${TILE_SIZE * scaleFactor}px`;
  postDiv.style.height = `${TILE_SIZE * scaleFactor}px`;

  if (fileUrl.endsWith('.mp4')) {
    const video = document.createElement('video');
    video.src = fileUrl;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.loading = "lazy";
    postDiv.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = fileUrl;
    img.alt = '';
    img.loading = "lazy";
    postDiv.appendChild(img);
  }

  gallery.appendChild(postDiv);
  loadedTiles.add(key);
  activateFadeIn();
}

// Dynamic loading while scrolling
function setupDynamicGrid() {
  window.addEventListener('scroll', () => {
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const leftEdge = Math.floor(scrollLeft / ((TILE_SIZE + GAP_SIZE) * scaleFactor));
    const rightEdge = Math.ceil((scrollLeft + viewportWidth) / ((TILE_SIZE + GAP_SIZE) * scaleFactor));
    const topEdge = Math.floor(scrollTop / ((TILE_SIZE + GAP_SIZE) * scaleFactor));
    const bottomEdge = Math.ceil((scrollTop + viewportHeight) / ((TILE_SIZE + GAP_SIZE) * scaleFactor));

    for (let x = leftEdge - VIEWPORT_BUFFER; x <= rightEdge + VIEWPORT_BUFFER; x++) {
      for (let y = topEdge - VIEWPORT_BUFFER; y <= bottomEdge + VIEWPORT_BUFFER; y++) {
        placeTile(x, y);
      }
    }
  });
}

// Fade-in animation for tiles
function activateFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in:not(.show)').forEach(el => observer.observe(el));
}

// Load initial visible tiles immediately after fetching
function loadInitialTiles() {
  const centerX = Math.floor(window.scrollX / ((TILE_SIZE + GAP_SIZE) * scaleFactor));
  const centerY = Math.floor(window.scrollY / ((TILE_SIZE + GAP_SIZE) * scaleFactor));

  const buffer = window.innerWidth < 768 ? 3 : 5; // Smaller buffer on mobile

  for (let x = centerX - buffer; x <= centerX + buffer; x++) {
    for (let y = centerY - buffer; y <= centerY + buffer; y++) {
      placeTile(x, y);
    }
  }
}

// Hide control buttons on mobile, reveal on tap
function setupMobileControlReveal() {
  if (window.innerWidth > 768) return; // Only on mobile

  let timer;

  function showControls() {
    const panel = document.getElementById('control-panel');
    panel.classList.add('show-controls');

    clearTimeout(timer);
    timer = setTimeout(() => {
      panel.classList.remove('show-controls');
    }, 5000); // Hide after 5 seconds
  }

  window.addEventListener('click', (e) => {
    if (e.clientX > window.innerWidth * 0.7 && e.clientY < window.innerHeight * 0.3) {
      showControls();
    }
  });
}

// Disable all click actions on media
gallery.addEventListener('click', (e) => {
  const target = e.target;
  if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
    e.preventDefault();
    return false;
  }
});

// Floating controls (Zoom, Arrows, Theme Toggle)

// Zoom In
document.getElementById('zoom-in').addEventListener('click', () => {
  scaleFactor *= 1.1;
  gallery.style.transform = `scale(${scaleFactor})`;
});

// Zoom Out
document.getElementById('zoom-out').addEventListener('click', () => {
  scaleFactor /= 1.1;
  gallery.style.transform = `scale(${scaleFactor})`;
});

// Theme Toggle (Light/Dark)
document.getElementById('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  if (root.style.getPropertyValue('--bg-color') === 'white') {
    root.style.setProperty('--bg-color', 'black');
    root.style.setProperty('--text-color', 'white');
  } else {
    root.style.setProperty('--bg-color', 'white');
    root.style.setProperty('--text-color', 'black');
  }
});

// Arrow Movement Controls
document.getElementById('arrow-up').addEventListener('click', () => window.scrollBy(0, -window.innerHeight * 0.5));
document.getElementById('arrow-down').addEventListener('click', () => window.scrollBy(0, window.innerHeight * 0.5));
document.getElementById('arrow-left').addEventListener('click', () => window.scrollBy(-window.innerWidth * 0.5, 0));
document.getElementById('arrow-right').addEventListener('click', () => window.scrollBy(window.innerWidth * 0.5, 0));

// Initialisation
(async function init() {
  gallery.style.position = 'absolute';
  await fetchImages();
  window.scrollTo(WORLD_SIZE / 2, WORLD_SIZE / 2);
  setupDynamicGrid();
  loadInitialTiles();
  setupMobileControlReveal();
})();
