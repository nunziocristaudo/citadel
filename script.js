const gallery = document.getElementById('gallery');
const toggleButton = document.getElementById('theme-toggle');

// Load posts from GitHub
fetch('https://api.github.com/repos/nunziocristaudo/citadel/contents/images')
    .then(response => response.json())
    .then(files => {
        files.forEach(file => {
            if (file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';

                const img = document.createElement('img');
                img.src = file.download_url;
                img.alt = file.name;

                const caption = document.createElement('div');
                caption.className = 'caption';
                caption.textContent = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');

                postDiv.appendChild(img);
                postDiv.appendChild(caption);
                gallery.appendChild(postDiv);
            }
        });
    });

// Toggle theme
toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark');

    if (document.body.classList.contains('dark')) {
        toggleButton.textContent = '☀️';
    } else {
        toggleButton.textContent = '⚫';
    }
});

// Detect user's system theme on load
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
    toggleButton.textContent = '☀️';
}
