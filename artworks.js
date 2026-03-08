// ========================================
// ARTWORKS PAGE SCRIPT
// ========================================

'use strict';

// State
let currentArtworks = [];
let currentImageIndex = 0;
let modalZoomLevel = 1;
const COLLECTION_STORE_KEY = 'galleryUserCollections';
const CURRENT_USER_KEY = 'galleryCurrentUser';
const MODAL_ZOOM_MIN = 1;
const MODAL_ZOOM_MAX = 3;
const MODAL_ZOOM_STEP = 0.2;
let currentFilters = {
    category: 'all',
    status: 'all',
    sort: 'newest',
    search: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupEventListeners();
    setupCategoryMiniMenu();
    loadArtworks();
}

// ========================================
// ARTWORK FUNCTIONS
// ========================================

function loadArtworks() {
    let artworks = [
        ...getUploadedArtworksForCurrentUser(),
        ...GalleryData.getAllArtworks()
    ];
    const featuredIds = new Set(GalleryData.getFeaturedArtworks().map((artwork) => artwork.id));
    
    // Apply filters
    if (currentFilters.category !== 'all') {
        if (currentFilters.category === 'digital') {
            artworks = artworks.filter(a => a.category === 'digital' || a.category === 'digital art');
        } else {
            artworks = artworks.filter(a => a.category === currentFilters.category);
        }
    }
    
    if (currentFilters.status !== 'all') {
        artworks = artworks.filter(a => a.status === currentFilters.status);
    }
    
    // Apply search
    if (currentFilters.search) {
        const query = currentFilters.search.toLowerCase();
        artworks = artworks.filter((artwork) =>
            String(artwork.title || '').toLowerCase().includes(query) ||
            String(artwork.artist || '').toLowerCase().includes(query) ||
            String(artwork.category || '').toLowerCase().includes(query) ||
            String(artwork.description || '').toLowerCase().includes(query)
        );
    }
    
    // Apply sorting
    artworks = GalleryData.sortArtworks(artworks, currentFilters.sort);
    artworks = prioritizeFeaturedFirst(artworks, featuredIds);
    
    currentArtworks = artworks;
    renderArtworks(artworks);
}

function prioritizeFeaturedFirst(artworks, featuredIds) {
    return [...artworks].sort((a, b) => {
        const aFeatured = featuredIds.has(a.id) ? 1 : 0;
        const bFeatured = featuredIds.has(b.id) ? 1 : 0;
        return bFeatured - aFeatured;
    });
}

function renderArtworks(artworks) {
    const grid = document.getElementById('artworkGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = artworks.length;
    
    if (artworks.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    grid.innerHTML = artworks.map((artwork, index) => `
        <div class="artwork-card" onclick="openModal(${index})">
            <div class="artwork-image">
                ${artwork.isUserUpload ? '<span class="artwork-upload-badge">My Upload</span>' : ''}
                <img src="${artwork.image}" alt="${artwork.title}">
                <div class="artwork-overlay">
                    <button class="quick-view-btn" onclick="openModal(${index}); event.stopPropagation();">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function openModal(index) {
    if (index < 0 || index >= currentArtworks.length) return;
    
    currentImageIndex = index;
    const artwork = currentArtworks[index];
    
    document.getElementById('modalImage').src = artwork.image;
    document.getElementById('modalTitle').textContent = artwork.title;
    document.getElementById('modalArtist').textContent = `By ${artwork.artist}`;
    document.getElementById('modalCategory').textContent = artwork.category.toUpperCase();
    document.getElementById('modalDescription').textContent = artwork.description;
    document.getElementById('modalMedium').textContent = artwork.medium;
    document.getElementById('modalYear').textContent = artwork.year;
    document.getElementById('modalViews').textContent = artwork.views;
    document.getElementById('modalLikes').textContent = artwork.likes;
    
    document.getElementById('imageModal').classList.add('active');
    resetModalZoom();
    
    // Increment views
    artwork.views++;
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
    resetModalZoom();
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentArtworks.length;
    openModal(currentImageIndex);
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentArtworks.length) % currentArtworks.length;
    openModal(currentImageIndex);
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
    // Mobile Menu Toggle
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
    
    // Category Filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentFilters.category = this.value;
            syncCategoryMiniMenu(this.value);
            loadArtworks();
        });
    }
    
    // Status Filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
            syncStatusControls(this.value);
            loadArtworks();
        });
    }
    
    // Sort Select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentFilters.sort = this.value;
            syncSortControls(this.value);
            loadArtworks();
        });
    }
    
    // Search Input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentFilters.search = this.value;
            syncSearchControls(this.value);
            loadArtworks();
        });
    }

    const mobileStatusFilter = document.getElementById('mobileStatusFilter');
    if (mobileStatusFilter) {
        mobileStatusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
            syncStatusControls(this.value);
            loadArtworks();
            closeCategoryMiniMenu();
        });
    }

    const mobileSortSelect = document.getElementById('mobileSortSelect');
    if (mobileSortSelect) {
        mobileSortSelect.addEventListener('change', function() {
            currentFilters.sort = this.value;
            syncSortControls(this.value);
            loadArtworks();
            closeCategoryMiniMenu();
        });
    }

    const mobileSearchInput = document.getElementById('mobileSearchInput');
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', function() {
            currentFilters.search = this.value;
            syncSearchControls(this.value);
            loadArtworks();
        });
    }
    
    // Modal Controls
    const modalClose = document.getElementById('modalClose');
    const modalNext = document.getElementById('modalNext');
    const modalPrev = document.getElementById('modalPrev');
    
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalNext) modalNext.addEventListener('click', nextImage);
    if (modalPrev) modalPrev.addEventListener('click', prevImage);
    
    // Close modal on overlay click
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Keyboard navigation
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
    
    // Like Button
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            if (currentArtworks[currentImageIndex]) {
                currentArtworks[currentImageIndex].likes++;
                document.getElementById('modalLikes').textContent = currentArtworks[currentImageIndex].likes;
                showNotification('Liked!', 'success');
            }
        });
    }
    
    // Download Button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            downloadImage();
        });
    }
    
    // Share Button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            showNotification('Share feature coming soon!', 'info');
        });
    }
    
    // Inquire Button
    const inquireBtn = document.getElementById('inquireBtn');
    if (inquireBtn) {
        inquireBtn.addEventListener('click', function() {
            showNotification('Inquiry sent! We will contact you soon.', 'success');
        });
    }
}

function getCurrentArtworkUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function getArtworkCollections() {
    const raw = localStorage.getItem(COLLECTION_STORE_KEY);
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function getUploadedArtworksForCurrentUser() {
    const currentUser = getCurrentArtworkUser();
    if (!currentUser || !currentUser.email) return [];

    const collections = getArtworkCollections();
    const list = Array.isArray(collections[currentUser.email]) ? collections[currentUser.email] : [];

    return list.map((item) => ({
        id: `upload-${item.id}`,
        title: item.title || 'Untitled',
        artist: currentUser.name || 'You',
        artistId: null,
        category: String(item.category || 'uncategorized').toLowerCase(),
        medium: 'User Upload',
        year: item.year || 'N/A',
        price: 0,
        status: 'available',
        image: item.image || '',
        description: item.description || 'Uploaded from My Collection.',
        views: 0,
        likes: 0,
        date: item.updatedAt || item.createdAt || new Date().toISOString(),
        isUserUpload: true
    })).filter((item) => item.image);
}

function setupCategoryMiniMenu() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categoryMiniList = document.getElementById('categoryMiniList');
    const categoryMiniToggle = document.getElementById('categoryMiniToggle');
    const categoryMiniMenu = document.getElementById('categoryMiniMenu');

    if (!categoryFilter || !categoryMiniList) return;

    const options = Array.from(categoryFilter.options).map(option => ({
        value: option.value,
        label: option.textContent
    }));

    categoryMiniList.innerHTML = options.map(option => `
        <button
            class="category-chip${option.value === currentFilters.category ? ' active' : ''}"
            type="button"
            data-category-value="${option.value}">
            ${option.label}
        </button>
    `).join('');

    categoryMiniList.addEventListener('click', function(e) {
        const chip = e.target.closest('.category-chip[data-category-value]');
        if (!chip) return;

        const value = chip.dataset.categoryValue;
        currentFilters.category = value;
        categoryFilter.value = value;
        syncCategoryMiniMenu(value);
        loadArtworks();
        closeCategoryMiniMenu();
    });

    if (categoryMiniToggle && categoryMiniMenu) {
        categoryMiniToggle.addEventListener('click', function() {
            categoryMiniMenu.classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            if (!categoryMiniMenu.contains(e.target)) {
                closeCategoryMiniMenu();
            }
        });
    }

    syncStatusControls(currentFilters.status);
    syncSortControls(currentFilters.sort);
    syncSearchControls(currentFilters.search);
}

function syncCategoryMiniMenu(activeValue) {
    const chips = document.querySelectorAll('.category-chip[data-category-value]');
    chips.forEach(chip => {
        chip.classList.toggle('active', chip.dataset.categoryValue === activeValue);
    });
}

function closeCategoryMiniMenu() {
    const categoryMiniMenu = document.getElementById('categoryMiniMenu');
    if (categoryMiniMenu) {
        categoryMiniMenu.classList.remove('open');
    }
}

function syncStatusControls(value) {
    const desktop = document.getElementById('statusFilter');
    const mobile = document.getElementById('mobileStatusFilter');
    if (desktop) desktop.value = value;
    if (mobile) mobile.value = value;
}

function syncSortControls(value) {
    const desktop = document.getElementById('sortSelect');
    const mobile = document.getElementById('mobileSortSelect');
    if (desktop) desktop.value = value;
    if (mobile) mobile.value = value;
}

function syncSearchControls(value) {
    const desktop = document.getElementById('searchInput');
    const mobile = document.getElementById('mobileSearchInput');
    if (desktop && desktop.value !== value) desktop.value = value;
    if (mobile && mobile.value !== value) mobile.value = value;
}

// ========================================
// DOWNLOAD FUNCTION
// ========================================

function downloadImage() {
    if (!currentArtworks[currentImageIndex]) return;
    
    const artwork = currentArtworks[currentImageIndex];
    const imageUrl = artwork.image;
    const fileName = `${artwork.title.replace(/\s+/g, '_')}_${artwork.artist.replace(/\s+/g, '_')}.jpg`;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.target = '_blank';
    
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
            
            showNotification('Image downloaded successfully!', 'success');
        })
        .catch(() => {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('Download started!', 'success');
        });
}


// Global exports
window.openModal = openModal;
