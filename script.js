const gallery = document.getElementById('gallery');
const themeButtons = document.querySelectorAll('#theme-buttons button');
const upBtn = document.getElementById('up');
const downBtn = document.getElementById('down');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');

const TILE_SIZE = 150;
const GAP_SIZE = 2;
const VIEWPORT_BUFFER = 2;
const WORLD_SIZE = 10000;
let loadedTiles = new Set();
let images = [];
let imageIndex = 0;
let lastFetched = 0;

// Fetch images
async function fetchImages() {
  const now = Date.now();
  if (images.length === 0 || now - lastFetched > 5 * 60 * 1000) {
    const response = await fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images');
    const files = await response.json();
    images = files.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
    lastFetched = now;
  }
}

// Place a tile
async function placeTile(x, y) {
  const key = `${x},${y}`;
  if (loadedTiles.has(key)) return;
  
  await fetchImages();
  if (images.length === 0) return;

  const file = images[imageIndex % images.length];
  imageIndex++;

  const postDiv = document.createElement('div');
  postDiv.className = 'post fade-in';
  postDiv.style.left = `${x * (TILE_SIZE + GAP_SIZE)}px`;
  postDiv.style.top = `${y * (TILE_SIZE + GAP_SIZE)}px`;

  const img = document.createElement('img');
  img.src = file.download_url;
  img.alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
  img.loading = "lazy";

  img.addEventListener('click', () => {
    window.open(file.download_url, '_blank');
  });

  postDiv.appendChild(img);
  gallery.appendChild(postDiv);

  loadedTiles.add(key);
  activateFadeIn();
}

// Dynamic loading
function setupDynamicGrid() {
  window.addEventListener('scroll', async () => {
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const leftEdge = Math.floor(scrollLeft / (TILE_SIZE + GAP_SIZE));
    const rightEdge = Math.ceil((scrollLeft + viewportWidth) / (TILE_SIZE + GAP_SIZE));
    const topEdge = Math.floor(scrollTop / (TILE_SIZE + GAP_SIZE));
    const bottomEdge = Math.ceil((scrollTop + viewportHeight) / (TILE_SIZE + GAP_SIZE));

    for (let x = leftEdge - VIEWPORT_BUFFER; x <= rightEdge + VIEWPORT_BUFFER; x++) {
      for (let y = topEdge - VIEWPORT_BUFFER; y <= bottomEdge + VIEWPORT_BUFFER; y++) {
        placeTile(x, y);
      }
    }
  });
}

// Fade-in effect
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

// Theme switch
themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    document.body.className = button.dataset.theme;
  });
});

// Arrow button handlers
upBtn.addEventListener('click', () => window.scrollBy({ top: -200, behavior: 'smooth' }));
downBtn.addEventListener('click', () => window.scrollBy({ top: 200, behavior: 'smooth' }));
leftBtn.addEventListener('click', () => window.scrollBy({ left: -200, behavior: 'smooth' }));
rightBtn.addEventListener('click', () => window.scrollBy({ left: 200, behavior: 'smooth' }));

// INIT
(async function init() {
  gallery.style.position = 'absolute';
  await fetchImages();
  window.scrollTo(WORLD_SIZE / 2, WORLD_SIZE / 2);
  setupDynamicGrid();
})();
