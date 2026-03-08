// ========================================
// ARTISTS PAGE SCRIPT
// ========================================

'use strict';

// State
let currentArtists = [];
let currentArtistIndex = 0;
let currentFilters = {
    sort: 'name',
    search: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupEventListeners();
    loadArtists();
}

// ========================================
// ARTIST FUNCTIONS
// ========================================

function loadArtists() {
    let artists = GalleryData.getAllArtists();
    
    // Apply search
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        artists = artists.filter(artist => 
            artist.name.toLowerCase().includes(searchTerm) ||
            artist.specialty.toLowerCase().includes(searchTerm) ||
            artist.bio.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply sorting
    artists = sortArtists(artists, currentFilters.sort);
    
    currentArtists = artists;
    renderArtists(artists);
}

function sortArtists(artists, sortBy) {
    const sorted = [...artists];
    switch(sortBy) {
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'works':
            return sorted.sort((a, b) => b.worksCount - a.worksCount);
        case 'awards':
            return sorted.sort((a, b) => b.awards - a.awards);
        default:
            return sorted;
    }
}

function renderArtists(artists) {
    const grid = document.getElementById('artistGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = artists.length;
    
    if (artists.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    grid.innerHTML = artists.map((artist, index) => `
        <div class="artist-card" data-artist-index="${index}">
            <div class="artist-image">
                <img src="${artist.image}" alt="${artist.name}">
                <div class="artwork-overlay">
                    <button class="quick-view-btn" type="button" data-artist-profile-btn="${index}">
                        <i class="fas fa-user-circle"></i> Profile
                    </button>
                </div>
            </div>
            <div class="artist-info">
                <h3>${artist.name}</h3>
            </div>
        </div>
    `).join('');

    attachArtistDetailHandlers();
}

function getArtistArtworks(artist) {
    const artistName = (artist.name || '').toLowerCase();
    const firstName = artistName.split(' ')[0];

    return GalleryData.getAllArtworks().filter(artwork => {
        const artworkArtist = ((artwork.artist || artwork.artists || '') + '').toLowerCase();
        const artworkArtistId = Number(artwork.artistId);

        return artworkArtistId === artist.id ||
            artworkArtist.includes(artistName) ||
            (firstName && artworkArtist.includes(firstName));
    });
}

function attachArtistDetailHandlers() {
    const artistCards = document.querySelectorAll('.artist-card[data-artist-index]');
    const detailButtons = document.querySelectorAll('.quick-view-btn[data-artist-profile-btn]');

    artistCards.forEach(card => {
        card.addEventListener('click', function() {
            const index = Number(this.dataset.artistIndex);
            openArtistModal(index);
        });
    });

    detailButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = Number(this.dataset.artistProfileBtn);
            openArtistModal(index);
        });
    });
}

// ========================================
// ARTIST MODAL FUNCTIONS
// ========================================

function openArtistModal(index) {
    if (index < 0 || index >= currentArtists.length) {
        showNotification('Artist not found', 'error');
        return;
    }
    
    currentArtistIndex = index;
    const artist = currentArtists[index];
    
    // Get all modal elements
    const artistModal = document.getElementById('artistModal');
    const artistModalImage = document.getElementById('artistModalImage');
    const artistModalName = document.getElementById('artistModalName');
    const artistModalSpecialty = document.getElementById('artistModalSpecialty');
    const artistModalBio = document.getElementById('artistModalBio');
    const artistModalWorks = document.getElementById('artistModalWorks');
    const artistModalAwards = document.getElementById('artistModalAwards');
    const artistModalLocation = document.getElementById('artistModalLocation');
    const artistModalSocial = document.getElementById('artistModalSocial');
    const artistPortfolio = document.getElementById('artistPortfolio');
    const artistFollowers = document.getElementById('artistFollowers');
    
    // Check if modal exists
    if (!artistModal) {
        showNotification('Modal not found', 'error');
        return;
    }
    
    // Set image
    if (artistModalImage) {
        artistModalImage.style.opacity = '0';
        artistModalImage.src = artist.image;
        artistModalImage.alt = artist.name;
        artistModalImage.onload = () => {
            artistModalImage.style.transition = 'opacity 0.5s ease';
            artistModalImage.style.opacity = '1';
        };
    }
    
    // Set basic info
    if (artistModalName) {
        artistModalName.textContent = artist.name;
        artistModalName.style.animation = 'fadeInUp 0.5s ease';
    }
    
    if (artistModalSpecialty) artistModalSpecialty.textContent = artist.specialty;
    if (artistModalBio) artistModalBio.textContent = artist.bio;
    
    // Animate statistics
    if (artistModalWorks) animateCounter(artistModalWorks, 0, artist.works || 0, 1000);
    if (artistModalAwards) animateCounter(artistModalAwards, 0, artist.awards || 0, 1000);
    if (artistModalLocation) artistModalLocation.textContent = artist.location || 'International';
    if (artistFollowers) {
        const followers = Math.floor(Math.random() * 5000) + 1000;
        artistFollowers.textContent = formatNumber(followers);
    }
    
    if (artistPortfolio) {
        const artworks = getArtistArtworks(artist).slice(0, 6);
        
        let portfolioHTML = '';
        if (artworks.length > 0) {
            artworks.forEach(artwork => {
                portfolioHTML += `
                    <div class="portfolio-item">
                        <img src="${artwork.image}" alt="${artwork.title}" onload="this.parentElement.classList.add('loaded')">
                        <div class="portfolio-overlay">
                            <span>${artwork.title}</span>
                        </div>
                    </div>
                `;
            });
        } else {
            for (let i = 0; i < 6; i++) {
                portfolioHTML += `
                    <div class="portfolio-item">
                        <img src="${artist.image}" alt="Artwork ${i + 1}" onload="this.parentElement.classList.add('loaded')">
                        <div class="portfolio-overlay">
                            <span>Artwork ${i + 1}</span>
                        </div>
                    </div>
                `;
            }
        }
        artistPortfolio.innerHTML = portfolioHTML;
    }
    
    if (artistModalSocial) {
        let socialHTML = '';
        if (artist.social && artist.social.instagram && artist.social.instagram !== '#') {
            socialHTML += `<a href="${artist.social.instagram}" target="_blank" rel="noopener" class="social-link instagram">
                <i class="fab fa-instagram"></i> 
                <span>Instagram</span>
            </a>`;
        }
        if (artist.social && artist.social.facebook && artist.social.facebook !== '#') {
            socialHTML += `<a href="${artist.social.facebook}" target="_blank" rel="noopener" class="social-link facebook">
                <i class="fab fa-facebook"></i> 
                <span>Facebook</span>
            </a>`;
        }
        if (artist.social && artist.social.twitter && artist.social.twitter !== '#') {
            socialHTML += `<a href="${artist.social.twitter}" target="_blank" rel="noopener" class="social-link twitter">
                <i class="fab fa-twitter"></i> 
                <span>Twitter</span>
            </a>`;
        }
        if (artist.social && artist.social.website && artist.social.website !== '#') {
            socialHTML += `<a href="${artist.social.website}" target="_blank" rel="noopener" class="social-link website">
                <i class="fas fa-globe"></i> 
                <span>Website</span>
            </a>`;
        }
        
        if (!socialHTML) {
            socialHTML = '<p class="no-social">No social media links available</p>';
        }
        
        artistModalSocial.innerHTML = socialHTML;
    }
    
    artistModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeArtistModal() {
    const artistModal = document.getElementById('artistModal');
    if (artistModal) {
        artistModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function nextArtist() {
    currentArtistIndex = (currentArtistIndex + 1) % currentArtists.length;
    openArtistModal(currentArtistIndex);
}

function prevArtist() {
    currentArtistIndex = (currentArtistIndex - 1 + currentArtists.length) % currentArtists.length;
    openArtistModal(currentArtistIndex);
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                if (mobileNav.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentFilters.sort = this.value;
            loadArtists();
        });
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentFilters.search = this.value;
            loadArtists();
        });
    }
    
    const artistModalClose = document.getElementById('artistModalClose');
    const artistModalNext = document.getElementById('artistModalNext');
    const artistModalPrev = document.getElementById('artistModalPrev');
    
    if (artistModalClose) artistModalClose.addEventListener('click', closeArtistModal);
    if (artistModalNext) artistModalNext.addEventListener('click', nextArtist);
    if (artistModalPrev) artistModalPrev.addEventListener('click', prevArtist);
    
    const artistModal = document.getElementById('artistModal');
    if (artistModal) {
        artistModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeArtistModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('artistModal');
        if (modal && modal.classList.contains('active')) {
            if (e.key === 'Escape') closeArtistModal();
            if (e.key === 'ArrowRight') nextArtist();
            if (e.key === 'ArrowLeft') prevArtist();
        }
    });
    
    const followArtistBtn = document.getElementById('followArtistBtn');
    if (followArtistBtn) {
        followArtistBtn.addEventListener('click', function() {
            showNotification('You are now following this artist!', 'success');
        });
    }
    
    const contactArtistBtn = document.getElementById('contactArtistBtn');
    if (contactArtistBtn) {
        contactArtistBtn.addEventListener('click', function() {
            showNotification('Contact form coming soon!', 'info');
        });
    }
    
    const viewAllWorksBtn = document.getElementById('viewAllWorksBtn');
    if (viewAllWorksBtn) {
        viewAllWorksBtn.addEventListener('click', function() {
            closeArtistModal();
            setTimeout(() => {
                window.location.href = 'artworks.html';
            }, 300);
        });
    }
}

// Global exports
window.openArtistModal = openArtistModal;
window.closeArtistModal = closeArtistModal;
window.nextArtist = nextArtist;
window.prevArtist = prevArtist;
