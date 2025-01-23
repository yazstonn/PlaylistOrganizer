document.addEventListener('DOMContentLoaded', function() {
document.querySelectorAll('.context-menu-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Empêche la propagation de l'événement
      
      const contextMenu = this.nextElementSibling;
      contextMenu.style.display = 
        contextMenu.style.display === 'block' ? 'none' : 'block';
    });
  
    // Fermer le menu en cliquant ailleurs
    document.addEventListener('click', () => {
      document.querySelectorAll('.context-menu').forEach(menu => {
        menu.style.display = 'none';
      });
    });
  
    // Gestionnaire pour les actions du menu
    btn.nextElementSibling.addEventListener('click', function(e) {
      if (e.target.classList.contains('context-menu-item')) {
        const action = e.target.dataset.action;
        const songCard = this.closest('.song-card');
        const songTitle = songCard.querySelector('h3').textContent;
        
        switch(action) {
          case 'play':
            console.log(`Lecture de : ${songTitle}`);
            break;
          case 'delete':
            console.log(`Suppression de : ${songTitle}`);
            break;
          case 'share':
            console.log(`Partage de : ${songTitle}`);
            break;
        }
      }
    });
  })});