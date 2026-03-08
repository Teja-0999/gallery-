// ========================================
// SECURE IMAGE GALLERY SYSTEM
// ========================================

'use strict';

// State
let currentImageIndex = 0;
let heroSlideIndex = 0;
let heroAutoSlide = null;
let modalZoomLevel = 1;
const MODAL_ZOOM_MIN = 1;
const MODAL_ZOOM_MAX = 3;
const MODAL_ZOOM_STEP = 0.2;
const DEFAULT_HOME_FEATURED_COUNT = 4;

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupEventListeners();
    setupSettingsSync();
    initHeroSlider();
    loadFeaturedArtworks();
    loadFeaturedArtists();
}

// ========================================
// HERO SLIDER FUNCTIONS
// ========================================

function initHeroSlider() {
    startHeroAutoSlide();
}

// ========================================
// LOAD FEATURED ARTISTS
// ========================================

function loadFeaturedArtworks() {
    const artworksGrid = document.getElementById('featuredArtworksGrid');
    if (!artworksGrid) return;
    
    const featuredArtworks = getHomeFeaturedArtworks();
    
    let artworksHTML = '';
    featuredArtworks.forEach((artwork, index) => {
        artworksHTML += `
            <div class="artwork-card" onclick="openModal(${index})" data-artwork-id="${artwork.id}">
                <div class="artwork-image">
                    <img src="${artwork.image}" alt="${artwork.title}" loading="lazy">
                    <div class="artwork-overlay">
                        <button class="quick-view-btn" onclick="openModal(${index}); event.stopPropagation();">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    artworksGrid.innerHTML = artworksHTML;
}

function loadFeaturedArtists() {
    const artistsGrid = document.getElementById('featuredArtistsGrid');
    if (!artistsGrid) return;
    
    const featuredArtists = getHomeFeaturedArtists();
    
    let artistsHTML = '';
    featuredArtists.forEach((artist, index) => {
        artistsHTML += `
            <div class="artist-card" data-artist-id="${artist.id}" onclick="openArtistModal(${index})">
                <div class="artist-image">
                    <img src="${artist.image}" alt="${artist.name}" loading="lazy">
                    <div class="artwork-overlay">
                        <button class="quick-view-btn" type="button" onclick="openArtistModal(${index}); event.stopPropagation();">
                            <i class="fas fa-user-circle"></i> Profile
                        </button>
                    </div>
                </div>
                <div class="artist-info">
                    <h3>${artist.name}</h3>
                </div>
            </div>
        `;
    });
    
    artistsGrid.innerHTML = artistsHTML;
}

// ========================================
// HERO SLIDER FUNCTIONS CONTINUED
// ========================================

function showHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (index >= slides.length) {
        heroSlideIndex = 0;
    } else if (index < 0) {
        heroSlideIndex = slides.length - 1;
    } else {
        heroSlideIndex = index;
    }
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[heroSlideIndex].classList.add('active');
    dots[heroSlideIndex].classList.add('active');
    
    dots.forEach((dot, i) => {
        if (i === heroSlideIndex) {
            dot.setAttribute('aria-label', `Current slide ${i + 1} of ${slides.length}`);
        } else {
            dot.setAttribute('aria-label', `Go to slide ${i + 1} of ${slides.length}`);
        }
    });
}

function nextHeroSlide() {
    showHeroSlide(heroSlideIndex + 1);
}

function prevHeroSlide() {
    showHeroSlide(heroSlideIndex - 1);
}

function startHeroAutoSlide() {
    const saved = localStorage.getItem('gallerySettings');
    const settings = saved ? JSON.parse(saved) : { sliderSpeed: 5 };
    const speed = settings.sliderSpeed * 1000;
    
    heroAutoSlide = setInterval(() => {
        nextHeroSlide();
    }, speed);
}

function stopHeroAutoSlide() {
    if (heroAutoSlide) {
        clearInterval(heroAutoSlide);
    }
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function openModal(index) {
    const artworks = getHomeFeaturedArtworks();
    
    if (index < 0 || index >= artworks.length) return;
    
    currentImageIndex = index;
    const artwork = artworks[index];
    
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalArtist = document.getElementById('modalArtist');
    const modalCategory = document.getElementById('modalCategory');
    const modalDescription = document.getElementById('modalDescription');
    const modalMedium = document.getElementById('modalMedium');
    const modalYear = document.getElementById('modalYear');
    const modalViews = document.getElementById('modalViews');
    const modalLikes = document.getElementById('modalLikes');
    const imageModal = document.getElementById('imageModal');
    
    if (modalImage) {
        modalImage.src = artwork.image;
        resetModalZoom();
    }
    if (modalTitle) modalTitle.textContent = artwork.title;
    if (modalArtist) modalArtist.textContent = `By ${artwork.artist}`;
    if (modalCategory) modalCategory.textContent = artwork.category.toUpperCase();
    if (modalDescription) modalDescription.textContent = artwork.description;
    if (modalMedium) modalMedium.textContent = artwork.medium || 'Mixed Media';
    if (modalYear) modalYear.textContent = artwork.year || '2024';
    if (modalViews) modalViews.textContent = artwork.views;
    if (modalLikes) modalLikes.textContent = artwork.likes;
    if (imageModal) imageModal.classList.add('active');
    
    artwork.views++;
}

function closeModal() {
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.classList.remove('active');
    }
    resetModalZoom();
}

function nextImage() {
    const artworks = getHomeFeaturedArtworks();
    currentImageIndex = (currentImageIndex + 1) % artworks.length;
    openModal(currentImageIndex);
}

function prevImage() {
    const artworks = getHomeFeaturedArtworks();
    currentImageIndex = (currentImageIndex - 1 + artworks.length) % artworks.length;
    openModal(currentImageIndex);
}

function getHomeFeaturedArtworks() {
    return GalleryData.getFeaturedArtworks().slice(0, getHomeFeaturedCountFromSettings());
}

function getHomeFeaturedCountFromSettings() {
    const raw = localStorage.getItem('gallerySettings');
    if (!raw) return DEFAULT_HOME_FEATURED_COUNT;

    try {
        const settings = JSON.parse(raw);
        const cols = parseInt(settings.gridColumns, 10);
        if (Number.isNaN(cols)) return DEFAULT_HOME_FEATURED_COUNT;
        return Math.max(2, Math.min(5, cols));
    } catch {
        return DEFAULT_HOME_FEATURED_COUNT;
    }
}

function setupSettingsSync() {
    // Live update on current tab
    window.addEventListener('gallerySettingsUpdated', () => {
        loadFeaturedArtworks();
        loadFeaturedArtists();
    });

    // Cross-tab sync
    window.addEventListener('storage', (e) => {
        if (e.key === 'gallerySettings') {
            loadFeaturedArtworks();
            loadFeaturedArtists();
        }
    });
}

function applyModalZoom() {
    const modalImage = document.getElementById('modalImage');
    if (!modalImage) return;

    modalImage.style.transform = `scale(${modalZoomLevel})`;
    modalImage.style.transformOrigin = 'center center';
    modalImage.style.transition = 'transform 0.2s ease';
}

function zoomModalIn() {
    modalZoomLevel = Math.min(MODAL_ZOOM_MAX, +(modalZoomLevel + MODAL_ZOOM_STEP).toFixed(2));
    applyModalZoom();
}

function zoomModalOut() {
    modalZoomLevel = Math.max(MODAL_ZOOM_MIN, +(modalZoomLevel - MODAL_ZOOM_STEP).toFixed(2));
    applyModalZoom();
}

function resetModalZoom() {
    modalZoomLevel = 1;
    applyModalZoom();
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    const heroPrev = document.getElementById('heroPrev');
    const heroNext = document.getElementById('heroNext');
    
    if (heroPrev) {
        heroPrev.addEventListener('click', () => {
            prevHeroSlide();
            stopHeroAutoSlide();
            startHeroAutoSlide();
        });
    }
    
    if (heroNext) {
        heroNext.addEventListener('click', () => {
            nextHeroSlide();
            stopHeroAutoSlide();
            startHeroAutoSlide();
        });
    }
    
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.addEventListener('click', function() {
            const slideIndex = parseInt(this.dataset.slide);
            showHeroSlide(slideIndex);
            stopHeroAutoSlide();
            startHeroAutoSlide();
        });
        
        dot.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const slideIndex = parseInt(this.dataset.slide);
                showHeroSlide(slideIndex);
                stopHeroAutoSlide();
                startHeroAutoSlide();
            }
        });
        
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    });
    
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const featuresSection = document.querySelector('.features-section');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    document.querySelectorAll('.btn-hero').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    document.querySelectorAll('.nav-btn, .mobile-nav-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.endsWith('.html')) {
                return;
            }
            
            e.preventDefault();
            
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.mobile-nav-link').forEach(b => b.classList.remove('active'));
            
            document.querySelectorAll(`[href="${href}"]`).forEach(el => el.classList.add('active'));
            
            const mobileNav = document.getElementById('mobileNav');
            if (mobileNav) {
                mobileNav.classList.remove('active');
            }
            
            const menuBtn = document.getElementById('mobileMenuBtn');
            if (menuBtn) {
                const icon = menuBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
            
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
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
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Message sent successfully!', 'success');
            this.reset();
        });
    }
    
    document.querySelectorAll('.btn-exhibition').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text === 'Learn More') {
                showNotification('Exhibition details coming soon!', 'info');
            } else {
                showNotification('You will be notified about this exhibition!', 'success');
            }
        });
    });
    
    const modalClose = document.getElementById('modalClose');
    const modalNext = document.getElementById('modalNext');
    const modalPrev = document.getElementById('modalPrev');
    
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalNext) modalNext.addEventListener('click', nextImage);
    if (modalPrev) modalPrev.addEventListener('click', prevImage);
    
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('imageModal');
        if (modal && modal.classList.contains('active')) {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === '+' || e.key === '=' || e.key === 'NumpadAdd') {
                e.preventDefault();
                zoomModalIn();
            }
            if (e.key === '-' || e.key === '_' || e.key === 'NumpadSubtract') {
                e.preventDefault();
                zoomModalOut();
            }
            if (e.key === '0' || e.key === 'Numpad0') {
                e.preventDefault();
                resetModalZoom();
            }
        }
    });
    
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            const artworks = getHomeFeaturedArtworks();
            if (artworks[currentImageIndex]) {
                artworks[currentImageIndex].likes++;
                const modalLikes = document.getElementById('modalLikes');
                if (modalLikes) {
                    modalLikes.textContent = artworks[currentImageIndex].likes;
                }
                showNotification('Liked!', 'success');
            }
        });
    }
    
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            showNotification('Share feature coming soon!', 'info');
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

// ========================================
// GLOBAL EXPORTS
// ========================================

window.openModal = openModal;
window.closeModal = closeModal;
window.nextImage = nextImage;
window.prevImage = prevImage;

// ========================================
// ARTIST MODAL FUNCTIONS
// ========================================

let currentArtistIndex = 0;

function openArtistModal(index) {
    const artists = getHomeFeaturedArtists();
    
    if (index < 0 || index >= artists.length) return;
    
    currentArtistIndex = index;
    const artist = artists[index];
    
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
    
    if (artistModalImage) {
        artistModalImage.style.opacity = '0';
        artistModalImage.src = artist.image;
        artistModalImage.onload = () => {
            artistModalImage.style.transition = 'opacity 0.5s ease';
            artistModalImage.style.opacity = '1';
        };
    }
    
    if (artistModalName) {
        artistModalName.textContent = artist.name;
        artistModalName.style.animation = 'fadeInUp 0.5s ease';
    }
    
    if (artistModalSpecialty) artistModalSpecialty.textContent = artist.specialty;
    if (artistModalBio) artistModalBio.textContent = artist.bio;
    
    if (artistModalWorks) animateCounter(artistModalWorks, 0, artist.works, 1000);
    if (artistModalAwards) animateCounter(artistModalAwards, 0, artist.awards, 1000);
    if (artistModalLocation) artistModalLocation.textContent = artist.location || 'International';
    if (artistFollowers) {
        const followers = Math.floor(Math.random() * 5000) + 1000;
        artistFollowers.textContent = formatNumber(followers);
    }
    
    if (artistPortfolio) {
        const artworks = GalleryData.getAllArtworks().filter(a => 
            a.artist.toLowerCase().includes(artist.name.toLowerCase().split(' ')[0])
        ).slice(0, 6);
        
        let portfolioHTML = '';
        if (artworks.length > 0) {
            artworks.forEach(artwork => {
                portfolioHTML += `
                    <div class="portfolio-item" onclick="openModal(${artwork.id - 1})">
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
        if (artist.instagram) {
            socialHTML += `<a href="${artist.instagram}" target="_blank" rel="noopener"><i class="fab fa-instagram"></i> Instagram</a>`;
        }
        if (artist.facebook) {
            socialHTML += `<a href="${artist.facebook}" target="_blank" rel="noopener"><i class="fab fa-facebook"></i> Facebook</a>`;
        }
        if (artist.twitter) {
            socialHTML += `<a href="${artist.twitter}" target="_blank" rel="noopener"><i class="fab fa-twitter"></i> Twitter</a>`;
        }
        if (artist.website) {
            socialHTML += `<a href="${artist.website}" target="_blank" rel="noopener"><i class="fas fa-globe"></i> Website</a>`;
        }
        artistModalSocial.innerHTML = socialHTML;
    }
    
    if (artistModal) {
        artistModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeArtistModal() {
    const artistModal = document.getElementById('artistModal');
    if (artistModal) {
        artistModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function nextArtist() {
    const artists = getHomeFeaturedArtists();
    currentArtistIndex = (currentArtistIndex + 1) % artists.length;
    openArtistModal(currentArtistIndex);
}

function prevArtist() {
    const artists = getHomeFeaturedArtists();
    currentArtistIndex = (currentArtistIndex - 1 + artists.length) % artists.length;
    openArtistModal(currentArtistIndex);
}

function getHomeFeaturedArtists() {
    return GalleryData.getFeaturedArtists().slice(0, getHomeFeaturedCountFromSettings());
}

window.openArtistModal = openArtistModal;
window.closeArtistModal = closeArtistModal;
window.nextArtist = nextArtist;
window.prevArtist = prevArtist;
