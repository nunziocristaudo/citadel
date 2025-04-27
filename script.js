const gallery = document.getElementById('gallery');

let images = [];

// Load images from GitHub
fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images')
  .then(response => response.json())
  .then(files => {
    images = files.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
    populateGallery(images);
    setupInfiniteScroll();
  });

// Populate gallery with a batch of images
function populateGallery(imagesArray) {
  imagesArray.forEach(file => {
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
  });

  activateFadeIn();
  moveSentinel(); // move sentinel down after new images added
}

// Set up infinite scroll
let observer;
function setupInfiniteScroll() {
  const sentinel = document.createElement('div');
  sentinel.id = 'sentinel';
  sentinel.style.height = '1px';
  sentinel.style.width = '1px';
  gallery.appendChild(sentinel);

  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        populateGallery(images); // clone another batch when near bottom
      }
    });
  }, {
    root: null,
    rootMargin: "1000px",
    threshold: 0
  });

  observer.observe(sentinel);
}

// Move sentinel to the new bottom after each batch
function moveSentinel() {
  const sentinel = document.getElementById('sentinel');
  gallery.appendChild(sentinel); // move sentinel to end of gallery
}

// Fade-in animation
function activateFadeIn() {
  const observerFade = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.fade-in:not(.show)').forEach(el => observerFade.observe(el));
}
