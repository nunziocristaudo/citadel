const gallery = document.getElementById('gallery');
const themeToggle = document.getElementById('theme-toggle');

const TILE_SIZE = 150;
const GAP_SIZE = 2;
const VIEWPORT_BUFFER = 2;
const WORLD_SIZE = 10000;
let loadedTiles = new Set();
let images = [];
let imageIndex = 0;
let lastFetched = 0;

// Dragging and Momentum
let isDragging = false;
let dragStartX, dragStartY;
let scrollStartX, scrollStartY;
let velocityX = 0, velocityY = 0;
let momentumInterval;

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

// Place a tile at (x,y)
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

// Dynamic load tiles around visible area
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

// Dragging + Momentum
function setupPanning() {
  window.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    scrollStartX = window.scrollX;
    scrollStartY = window.scrollY;
    velocityX = velocityY = 0;
    clearInterval(momentumInterval);
    gallery.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    gallery.style.cursor = 'grab';
    applyMomentum();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    window.scrollTo(scrollStartX - dx, scrollStartY - dy);
    velocityX = -dx;
    velocityY = -dy;
  });

  window.addEventListener('touchstart', (e) => {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    scrollStartX = window.scrollX;
    scrollStartY = window.scrollY;
    velocityX = velocityY = 0;
    clearInterval(momentumInterval);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
    applyMomentum();
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - dragStartX;
    const dy = e.touches[0].clientY - dragStartY;
    window.scrollTo(scrollStartX - dx, scrollStartY - dy);
    velocityX = -dx;
    velocityY = -dy;
  }, { passive: true });
}

// Momentum
function applyMomentum() {
  momentumInterval = setInterval(() => {
    if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) {
      clearInterval(momentumInterval);
      return;
    }
    window.scrollBy(velocityX, velocityY);
    velocityX *= 0.90;
    velocityY *= 0.90;
  }, 16);
}

// Fade-in
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

// Theme preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}

// INIT
(async function init() {
  gallery.style.position = 'absolute';
  await fetchImages();
  window.scrollTo(WORLD_SIZE / 2, WORLD_SIZE / 2);
  setupDynamicGrid();
  setupPanning();
})();
