const gallery = document.getElementById('gallery');
const themeToggle = document.getElementById('theme-toggle');
let images = [];
let filledTiles = 0;

// Load images from GitHub
fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images')
  .then(response => response.json())
  .then(files => {
    images = files.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
    populateInitialGrid();
    setupScrollExpansion();
  });

// Populate a starting number of tiles
function populateInitialGrid() {
  fillGrid(300); // Start with 300 tiles
}

// Fill a number of grid tiles
function fillGrid(count) {
  for (let i = 0; i < count; i++) {
    const file = images[(filledTiles + i) % images.length];
    const postDiv = document.createElement('div');
    postDiv.className = 'post fade-in';

    const img = document.createElement('img');
    img.src = file.download_url;
    img.alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');

    img.addEventListener('click', () => {
      window.open(file.download_url, '_blank');
    });

    postDiv.appendChild(img);
    gallery.appendChild(postDiv);
  }
  filledTiles += count;
  activateFadeIn();
}

// Expand the grid if user nears an edge
function setupScrollExpansion() {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const totalHeight = document.body.scrollHeight;
    const totalWidth = document.body.scrollWidth;

    // If user scrolls near bottom or right edge
    if (scrollY + viewportHeight > totalHeight - 500 || scrollX + viewportWidth > totalWidth - 500) {
      fillGrid(100); // Add 100 more tiles
    }
  });
}

// Fade-in animation for images
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

// Set system preference on first load
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
