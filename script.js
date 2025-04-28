const gallery = document.getElementById('gallery');
const loader = document.getElementById('loader');

// Your Worker endpoint
const workerURL = 'https://quiet-mouse-8001.flaxen-huskier-06.workers.dev/';
// Your R2 public bucket base URL
const baseURL = 'https://pub-be000e14346943c7950390b5860c5564.r2.dev/';

async function loadGallery() {
  try {
    const response = await fetch(workerURL);
    const files = await response.json();

    files.forEach(file => {
      const post = document.createElement('div');
      post.className = 'post fade-in';

      if (file.match(/\.(mp4|mov|webm)$/i)) {
        const video = document.createElement('video');
        video.src = baseURL + file;
        video.controls = true;
        video.loading = 'lazy';
        post.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = baseURL + file;
        img.alt = file;
        img.loading = 'lazy';
        post.appendChild(img);
      }

      gallery.appendChild(post);

      setTimeout(() => {
        post.classList.add('show');
      }, 10);
    });
  } catch (error) {
    console.error('Failed to load gallery:', error);
    gallery.innerHTML = '<p>Failed to load gallery.</p>';
  } finally {
    loader.style.display = 'none';
  }
}

// Start loading after DOM is ready
document.addEventListener('DOMContentLoaded', loadGallery);
