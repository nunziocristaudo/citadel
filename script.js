const gallery = document.getElementById('gallery');
let images = [];
let totalColumns = 0;
let totalRows = 0;

// Load images from GitHub
fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images')
  .then(response => response.json())
  .then(files => {
    images = files.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
    generateInitialGrid();
  });

// Calculate how many columns and rows we need based on viewport size
function calculateGridSize() {
  const squareSize = 150 + 2; // 150px + 2px gap
  const columns = Math.ceil(window.innerWidth / squareSize) + 5; // buffer
  const rows = Math.ceil(window.innerHeight / squareSize) + 5;   // buffer
  return { columns, rows };
}

// Create the initial grid
function generateInitialGrid() {
  const { columns, rows } = calculateGridSize();
  totalColumns = columns;
  totalRows = rows;
  fillGrid(columns * rows);
  setupScrollListener();
}

// Fill grid with a number of squares
function fillGrid(number) {
  for (let i = 0; i < number; i++) {
    const file = images[i % images.length];
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
  activateFadeIn();
}

// Listen for scrolling and add more images if needed
function setupScrollListener() {
  window.addEventListener('scroll', () => {
    const scrollBottom = window.innerHeight + window.scrollY;
    const pageHeight = document.body.offsetHeight;

    const scrollRight = window.innerWidth + window.scrollX;
    const pageWidth = document.body.offsetWidth;

    // If user nears bottom or right side
    if (scrollBottom + 500 > pageHeight || scrollRight + 500 > pageWidth) {
      fillGrid(totalColumns * 2); // Add two more rows/columns worth
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
