const gallery = document.getElementById('gallery');
const toggleButton = document.getElementById('theme-toggle');

// Load posts dynamically from GitHub images folder
fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images')
  .then(response => response.json())
  .then(files => {
    files.forEach(file => {
      if (file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post fade-in'; // Add fade-in class

        const img = document.createElement('img');
        img.src = file.download_url;
        img.alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');

        postDiv.appendChild(img);
        gallery.appendChild(postDiv);
      }
    });

    // After loading images, activate fade-in observer
    setupFadeInObserver();
  });

// Toggle theme (dark/light mode)
toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    toggleButton.textContent = '☀️';
  } else {
    toggleButton.textContent = '⚫';
  }
});

// Detect user's system theme on initial load
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
  toggleButton.textContent = '☀️';
}

// Fade-in animation when images scroll into view
function setupFadeInObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}
