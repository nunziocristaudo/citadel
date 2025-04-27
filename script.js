const gallery = document.getElementById('gallery');
const toggleButton = document.getElementById('theme-toggle');

// Load posts
fetch('posts.json')
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';

            const img = document.createElement('img');
            img.src = post.image;
            img.alt = post.caption;

            const caption = document.createElement('div');
            caption.className = 'caption';
            caption.textContent = post.caption;

            postDiv.appendChild(img);
            postDiv.appendChild(caption);
            gallery.appendChild(postDiv);
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
