const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const upBtn = document.getElementById('up');
const downBtn = document.getElementById('down');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');

const TILE_SIZE = 150;
const GAP_SIZE = 2;
const VIEWPORT_BUFFER = 2;
const WORLD_SIZE = 10000;
let scaleFactor = 1;
let loadedTiles = new Set();
let images = [];
let predictions = new Map(); // filename -> tags array
let imageIndex = 0;
let lastFetched = 0;
let classifier;

// Load ml5.js MobileNet
ml5.imageClassifier('MobileNet')
  .then(model => {
    classifier = model;
    console.log('AI Model loaded!');
    init();
  });

// Fetch images
async function fetchImages() {
  const now = Date.now();
  if (images.length === 0 || now - lastFetched > 5 * 60 * 1000) {
    const response = await fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images');
    const files = await response.json();
    images = files.filter(file => file.name.match(/\.(jpg|jpeg|png|gif|mp4)$/i));
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
  postDiv.style.left = `${x * (TILE_SIZE + GAP_SIZE) * scaleFactor}px`;
  postDiv.style.top = `${y * (TILE_SIZE + GAP_SIZE) * scaleFactor}px`;
  postDiv.style.width = `${TILE_SIZE * scaleFactor}px`;
  postDiv.style.height = `${TILE_SIZE * scaleFactor}px`;

  if (file.name.endsWith('.mp4')) {
    const video = document.createElement('video');
    video.src = file.download_url;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.loading = "lazy";
    video.addEventListener('click', () => window.open(file.download_url, '_blank'));
    postDiv.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = file.download_url;
    img.alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    img.loading = "lazy";
    img.addEventListener('click', () => window.open(file.download_url, '_blank'));
    postDiv.appendChild(img);

    img.onload = async () => {
      const results = await classifier.classify(img);
      predictions.set(file.download_url, results.map(r => r.label.toLowerCase()));
    };
  }

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

// Search filtering
searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  document.querySelectorAll('.post').forEach(post => {
    const imgOrVideo = post.querySelector('img,video');
    if (!imgOrVideo) return;
    const tags = predictions.get(imgOrVideo.src) || [];
    if (tags.some(tag => tag.includes(term)) || term === '') {
      post.style.display = '';
    } else {
      post.style.display = 'none';
    }
  });
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Arrows
upBtn.addEventListener('click', () => window.scrollBy({ top: -200, behavior: 'smooth' }));
downBtn.addEventListener('click', () => window.scrollBy({ top: 200, behavior: 'smooth' }));
leftBtn.addEventListener('click', () => window.scrollBy({ left: -200, behavior: 'smooth' }));
rightBtn.addEventListener('click', () => window.scrollBy({ left: 200, behavior: 'smooth' }));

// Zoom
zoomInBtn.addEventListener('click', () => {
  scaleFactor *= 1.1;
  gallery.innerHTML = '';
  loadedTiles.clear();
  setupDynamicGrid();
});
zoomOutBtn.addEventListener('click', () => {
  scaleFactor /= 1.1;
  gallery.innerHTML = '';
  loadedTiles.clear();
  setupDynamicGrid();
});

// INIT
async function init() {
  await fetchImages();
  window.scrollTo(WORLD_SIZE / 2, WORLD_SIZE / 2);
  setupDynamicGrid();
}
