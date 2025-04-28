const gallery = document.getElementById('gallery');

const workerURL = 'https://quiet-mouse-8001.flaxen-huskier-06.workers.dev/';
const baseURL = 'https://pub-be000e14346943c7950390b5860c5564.r2.dev/';

fetch(workerURL)
  .then(response => response.json())
  .then(files => {
    files.forEach(file => {
      const post = document.createElement('div');
      post.className = 'post fade-in';

      if (file.endsWith('.mp4') || file.endsWith('.mov') || file.endsWith('.webm')) {
        const video = document.createElement('video');
        video.src = baseURL + file;
        video.controls = true;
        post.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = baseURL + file;
        post.appendChild(img);
      }

      gallery.appendChild(post);

      setTimeout(() => {
        post.classList.add('show');
      }, 10);
    });
  })
  .catch(error => console.error('Failed to load images:', error));