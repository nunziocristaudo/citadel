const gallery = document.getElementById('gallery');
const themeToggle = document.getElementById('theme-toggle');

const TILE_SIZE = 150;
const VIEWPORT_BUFFER = 3; // how many tiles from edge to expand
const GRID_SIZE = 1000; // Starting grid 1000x1000
const CENTER = GRID_SIZE / 2;
let loadedCoords = new Set();
let images = [];
let loadedImages = 0;
let lastFetched = 0;

// Fetch images from GitHub
async function fetchImages() {
  const now = Date.now();
  if (images.length === 0 || now - lastFetched > 5 * 60 * 1000) { // Refresh every 5 min
    const response = await fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images');
    const files = await response.json();
    images = files.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
    lastFetched = now;
  }
}

// Place a tile at (x,y)
async function placeTile(x, y) {
  const coordKey = `${x},${y}`;
  if (loadedCoords.has(coordKey)) return;
  
  await fetchImages();

  if (images.length === 0) return; // No images, don't place

  const index = loadedImages % images.length;
  const file = images[index];

  const postDiv = document.createElement('div');
  postDiv.className = 'post fade-in';
  postDiv.style.gridColumnStart = CENTER + x;
  postDiv.style.gridRowStart = CENTER + y;

  const img = document.createElement('img');
  img.src = file.download_url;
  img.alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
  img.loading = "lazy";

  img.addEventListener('click', () => {
    window.open(file.download_url, '_blank');
  });

  postDiv.appendChild(img);
  gallery.appendChild(postDiv);

  loadedCoords.add(coordKey);
  loadedImages++;

  activateFadeIn();
}

// Activate fade-in
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

// Monitor scroll position
function setupScrollLoading() {
  window.addEventListener('scroll', () => {
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const leftTile = Math.floor(scrollLeft / (TILE_SIZE + 2)) - CENTER;
    const topTile = Math.floor(scrollTop / (TILE_SIZE + 2)) - CENTER;
    const rightTile = Math.floor((scrollLeft + viewportWidth) / (TILE_SIZE + 2)) - CENTER;
    const bottomTile = Math.floor((scrollTop + viewportHeight) / (TILE_SIZE + 2)) - CENTER;

    for (let x = leftTile - VIEWPORT_BUFFER; x <= rightTile + VIEWPORT_BUFFER; x++) {
      for (let y = topTile - VIEWPORT_BUFFER; y <= bottomTile + VIEWPORT_BUFFER; y++) {
        placeTile(x, y);
      }
    }
  });
}

// Light/dark toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Set system theme on load
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}

// INIT
(async function init() {
  await fetchImages();
  for (let x = -15; x <= 15; x++) {
    for (let y = -15; y <= 15; y++) {
      placeTile(x, y);
    }
  }
  setupScrollLoading();
})();
