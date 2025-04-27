const gallery = document.getElementById('gallery');

let images = [];

// Load images from GitHub
fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images')
  .then(response => response.json())
  .then(files => {
    images = files.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
    populateGallery(images); // initial load
    setupInfiniteScroll();   // prepare for infinite repeating
  });

// Populate gallery with a batch of images
function populateGallery(imagesArray) {
  imagesArray.forEach(file => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post fade-in';

    const img = document.createElement('img');
    img.src = file.download_url;
    img.alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');

    // When image is clicked, open it full-size in a new tab
    img.addEventListener('click', () => {
      window.open(file.download_url, '_blank');
    });

    postDiv.appendChild(img);
    gallery.appendChild(postDiv);
  });
  activateFadeIn(); // activate fade-in animation
}

// Set up infinite scroll
function setupInfiniteScroll() {
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  sentinel.style.width = '1px';
  gallery.appendChild(sentinel);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        populateGallery(images); // clone another batch when near the bottom
      }
    });
  }, {
    root: null,
    rootMargin: "1000px", // trigger earlier
    threshold: 0
  });

  observer.observe(sentinel);
}

// Fade-in animation when images come into view
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
