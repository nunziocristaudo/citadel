const gallery = document.getElementById('gallery');
const TILE_SIZE = 150;
const GAP_SIZE = 2;
const VIEWPORT_BUFFER = 2;
const WORLD_SIZE = 5000;
let scaleFactor = 1;
let loadedTiles = new Set();
let images = [];
let imageIndex = 0;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function fetchImages() {
  try {
    const response = await fetch('https://quiet-mouse-8001.flaxen-huskier-06.workers.dev');
    if (!response.ok) throw new Error('Error fetching image list');
    const filenames = await response.json();
    images = filenames
      .filter(name => name.match(/\.(jpg|jpeg|png|gif|mp4)$/i))
      .map(name => `https://pub-be000e14346943c7950390b5860c5564.r2.dev/${name}`);
    shuffleArray(images);
  } catch (error) {
    console.error('Failed to fetch image list:', error);
    alert('Failed to load images. Please try again later.');
  }
}

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

function activateFadeIn() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in:not(.show)').forEach(el => observer.observe(el));
}

function loadInitialTiles() {
  const centerX = Math.floor(window.scrollX / ((TILE_SIZE + GAP_SIZE) * scaleFactor));
  const centerY = Math.floor(window.scrollY / ((TILE_SIZE + GAP_SIZE) * scaleFactor));

  const buffer = window.innerWidth < 768 ? 3 : 5;

  for (let x = centerX - buffer; x <= centerX + buffer; x++) {
    for (let y = centerY - buffer; y <= centerY + buffer; y++) {
      placeTile(x, y);
    }
  }
}

(async function init() {
  gallery.style.position = 'absolute';
  await fetchImages();
  window.scrollTo(WORLD_SIZE / 2, WORLD_SIZE / 2);
  setupDynamicGrid();
  loadInitialTiles();
})();