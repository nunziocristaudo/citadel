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

// Place a tile (no click, no drag, no right-click)
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

    // Prevent user interactions
    video.ondragstart = () => false;
    video.oncontextmenu = () => false;
    video.ondblclick = (e) => { e.preventDefault(); return false; };

    postDiv.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = fileUrl;
    img.alt = '';
    img.loading = "lazy";

    // Prevent user interactions
    img.ondragstart = () => false;
    img.oncontextmenu = () => false;
    img.ondblclick = (e) => { e.preventDefault(); return false; };

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

// Fade-in animation when images/videos appear
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

// Initial loading
(async function init() {
  gallery.style.position = 'absolute';
  await fetchImages();
  window.scrollTo(WORLD_SIZE / 2, WORLD_SIZE / 2);
  setupDynamicGrid();
})();
