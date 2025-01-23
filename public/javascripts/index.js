document.addEventListener('DOMContentLoaded', async () => {
    const playlistContainer = document.getElementById('playlist-container');

    async function fetchPlaylists() {
        try {
            const response = await fetch('/playlistFiles');
            if (!response.ok) {
                throw new Error('Failed to load playlists');
            }
            const playlists = await response.json();
            renderPlaylists(playlists);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    }

    // Function to render playlists dynamically
    function renderPlaylists(playlists) {
        playlists.forEach(playlist => {
            const card = document.createElement('div');
            card.classList.add('playlist-card');

            card.innerHTML = `
                <h3>${playlist}</h3>
            `;

            // Add event listener to make the card clickable
            card.addEventListener('click', () => {
                window.location.href = `/playlistFiles/${playlist}`;
            });

            playlistContainer.appendChild(card);
        });
    }

    fetchPlaylists();
});
