const gallery = document.getElementById('gallery');
const loader = document.getElementById('loader');

const workerURL = 'https://quiet-mouse-8001.flaxen-huskier-06.workers.dev/';
const baseURL = 'https://dev.tinysquares.io/';

let images = [];
let loadedTiles = new Map();
const TILE_SIZE = 150;
const GAP_SIZE = 2;
const WORLD_SIZE = 100000;
let imageIndex = 0;
let scaleFactor = 1;
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function fetchImages() {
  try {
    const response = await fetch(workerURL);
    const files = await response.json();
    images = files
      .filter(file => file.match(/\.(jpg|jpeg|png|gif|mp4)$/i))
      .map(file => baseURL + file);
    shuffleArray(images);
  } catch (error) {
    console.error('Failed to load images:', error);
    gallery.innerHTML = '<p>Failed to load gallery.</p>';
  } finally {
    loader.style.display = 'none';
  }
}

function createTile(x, y) {
  const fileUrl = images[(Math.abs(x + y)) % images.length];
  const post = document.createElement('div');
  post.className = 'post fade-in';
  post.style.left = `${x * (TILE_SIZE + GAP_SIZE)}px`;
  post.style.top = `${y * (TILE_SIZE + GAP_SIZE)}px`;

  if (fileUrl.endsWith('.mp4')) {
    const video = document.createElement('video');
    video.src = fileUrl;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.loading = 'lazy';
    post.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = fileUrl;
    img.alt = '';
    img.loading = 'lazy';
    post.appendChild(img);
  }

  gallery.appendChild(post);

  setTimeout(() => {
    post.classList.add('show');
  }, 10);

  return post;
}

function setupDynamicGrid() {
  window.addEventListener('scroll', () => {
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const leftEdge = Math.floor(scrollLeft / (TILE_SIZE + GAP_SIZE));
    const rightEdge = Math.ceil((scrollLeft + viewportWidth) / (TILE_SIZE + GAP_SIZE));
    const topEdge = Math.floor(scrollTop / (TILE_SIZE + GAP_SIZE));
    const bottomEdge = Math.ceil((scrollTop + viewportHeight) / (TILE_SIZE + GAP_SIZE));

    const activeTiles = new Map();

    for (let x = leftEdge - 2; x <= rightEdge + 2; x++) {
      for (let y = topEdge - 2; y <= bottomEdge + 2; y++) {
        const key = `${x},${y}`;
        if (!loadedTiles.has(key)) {
          loadedTiles.set(key, createTile(x, y));
        }
        activeTiles.set(key, true);
      }
    }

    // Remove tiles that are too far outside the current view
    for (let key of loadedTiles.keys()) {
      if (!activeTiles.has(key)) {
        gallery.removeChild(loadedTiles.get(key));
        loadedTiles.delete(key);
      }
    }
  });
}

function enableMouseDrag() {
  window.addEventListener('mousedown', (e) => {
    isDragging = true;
    gallery.style.cursor = 'grabbing';
    startX = e.pageX - window.scrollX;
    startY = e.pageY - window.scrollY;
    scrollLeft = window.scrollX;
    scrollTop = window.scrollY;
  });

  window.addEventListener('mouseleave', () => {
    isDragging = false;
    gallery.style.cursor = 'grab';
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    gallery.style.cursor = 'grab';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.pageX - startX;
    const y = e.pageY - startY;
    window.scrollTo(scrollLeft - x, scrollTop - y);
  });
}

function enablePinchZoom() {
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        scaleFactor *= 1.1;
      } else {
        scaleFactor /= 1.1;
      }
      gallery.style.transform = `scale(${scaleFactor})`;
    }
  }, { passive: false });
}

function enableKeyboardArrows() {
  window.addEventListener('keydown', (e) => {
    const moveAmount = window.innerWidth * 0.5;
    switch (e.key) {
      case 'ArrowLeft':
        window.scrollBy(-moveAmount, 0);
        break;
      case 'ArrowRight':
        window.scrollBy(moveAmount, 0);
        break;
      case 'ArrowUp':
        window.scrollBy(0, -moveAmount);
        break;
      case 'ArrowDown':
        window.scrollBy(0, moveAmount);
        break;
    }
  });
}

async function init() {
  await fetchImages();
  window.scrollTo(WORLD_SIZE / 2, WORLD_SIZE / 2);
  setupDynamicGrid();
  enableMouseDrag();
  enablePinchZoom();
  enableKeyboardArrows();
}

document.addEventListener('DOMContentLoaded', init);
