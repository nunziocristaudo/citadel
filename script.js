const gallery = document.getElementById('gallery');
const themeToggle = document.getElementById('theme-toggle');
let images = [];
let loadedImages = 0;
const batchSize = 30;

// Load images from GitHub
fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images')
  .then(response => response.json())
  .then(files => {
    images = files.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
    loadInitialImages();
    setupScrollLoading();
  });

// Load initial images based on screen size
function loadInitialImages() {
  const screenImages = Math.ceil(window.innerWidth / 150) * Math.ceil(window.innerHeight / 150);
  fillGrid(screenImages + batchSize);
}

// Fill a batch of new images
function fillGrid(count) {
  for (let i = 0; i < count && loadedImages < images.length; i++) {
    const file = images[loadedImages];
    const postDiv = document.createElement('div');
    postDiv.className = 'post fade-in';

    const img = document.createElement('img');
    img.src = file.download_url;
    img.alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    img.loading = "lazy";

    img.addEventListener('click', () => {
      window.open(file.download_url, '_blank');
    });

    postDiv.appendChild(img);
    gallery.appendChild(postDiv);

    loadedImages++;
  }
  activateFadeIn();
  expandGalleryWidth();
}

// Dynamically expand gallery width
function expandGalleryWidth() {
  const currentColumns = getComputedStyle(gallery).gridTemplateColumns.split(' ').length;
  const estimatedColumns = Math.ceil((window.scrollX + window.innerWidth) / 150) + 5;

  if (estimatedColumns > currentColumns) {
    gallery.style.gridTemplateColumns = `repeat(${estimatedColumns}, minmax(150px, 1fr))`;
  }
}

// Setup smart scroll loading
function setupScrollLoading() {
  window.addEventListener('scroll', () => {
    const scrollRight = window.scrollX + window.innerWidth;
    const pageWidth = document.body.scrollWidth;

    const scrollBottom = window.scrollY + window.innerHeight;
    const pageHeight = document.body.scrollHeight;

    if ((scrollRight + 300 > pageWidth || scrollBottom + 300 > pageHeight) && loadedImages < images.length) {
      fillGrid(batchSize);
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
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.fade-in:not(.show)').forEach(el => observer.observe(el));
}

// Theme toggle button
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Set system preference on load
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
