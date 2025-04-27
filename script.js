const gallery = document.getElementById('gallery');
const themeToggle = document.getElementById('theme-toggle');

const TILE_SIZE = 150;
const GAP_SIZE = 2;
const VIEWPORT_BUFFER = 2; // Load tiles 2 away from visible edge
const loadedTiles = new Set();
let images = [];
let imageIndex = 0;
let lastFetched = 0;

// Fetch fresh image list from GitHub every 5 minutes
async function fetchImages() {
  const now = Date.now();
  if (images.length === 0 || now - lastFetched > 5 * 60 * 1000) {
    const response = await fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images');
    const files = await response.json();
    images = files.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
    lastFetched = now;
  }
}

// Place a tile at (gridX, gridY)
async function placeTile(x, y) {
  const key = `${x},${y}`;
  if (loadedTiles.has(key)) return;
  
  await fetchImages();
  if (images.length === 0) return;

  const file = images[imageIndex % images.length];
  imageIndex++;

  const postDiv = document.createElement('div');
  postDiv.className = 'post fade-in';
  postDiv.style.position = 'absolute';
  postDiv.style.width = `${TILE_SIZE}px`;
  postDiv.style.height = `${TILE_SIZE}px`;
  postDiv.style.left = `${(window.innerWidth / 2) + (x * (TILE_SIZE + GAP_SIZE))}px`;
  postDiv.style.top = `${(window.innerHeight / 2) + (y * (TILE_SIZE + GAP_SIZE))}px`;

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

// Watch scrolling and expand dynamically
function setupDynamicGrid() {
  window.addEventListener('scroll', async () => {
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const leftEdge = (scrollLeft - viewportWidth / 2) / (TILE_SIZE + GAP_SIZE);
    const rightEdge = (scrollLeft + viewportWidth * 1.5) / (TILE_SIZE + GAP_SIZE);
    const topEdge = (scrollTop - viewportHeight / 2) / (TILE_SIZE + GAP_SIZE);
    const bottomEdge = (scrollTop + viewportHeight * 1.5) / (TILE_SIZE + GAP_SIZE);

    for (let x = Math.floor(leftEdge) - VIEWPORT_BUFFER; x <= Math.ceil(rightEdge) + VIEWPORT_BUFFER; x++) {
      for (let y = Math.floor(topEdge) - VIEWPORT_BUFFER; y <= Math.ceil(bottomEdge) + VIEWPORT_BUFFER; y++) {
        placeTile(x, y);
      }
    }
  });
}

// Fade-in animation
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

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Set system preference on load
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}

// Initial setup
(async function init() {
  gallery.style.position = 'absolute';
  await fetchImages();
  for (let x = -15; x <= 15; x++) {
    for (let y = -15; y <= 15; y++) {
      placeTile(x, y);
    }
  }
  setupDynamicGrid();
})();
