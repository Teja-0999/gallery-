'use strict';

const COLLECTION_STORE_KEY = 'galleryUserCollections';
const CURRENT_USER_KEY = 'galleryCurrentUser';
let selectedCollectionCategory = 'all';
let collectionEditId = null;
let collectionEditImage = '';

document.addEventListener('DOMContentLoaded', initCollectionPage);

function initCollectionPage() {
    setupMobileMenu();
    bindImageInput();
    bindCollectionForm();
    bindEditCancel();
    bindCollectionFilter();
    renderCollection();
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');

    if (!mobileMenuBtn || !mobileNav) return;
    mobileMenuBtn.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
        const icon = this.querySelector('i');
        if (icon) icon.className = mobileNav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
}

function getCurrentUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function getCollections() {
    const raw = localStorage.getItem(COLLECTION_STORE_KEY);
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function saveCollections(collections) {
    localStorage.setItem(COLLECTION_STORE_KEY, JSON.stringify(collections));
}

function bindImageInput() {
    const input = document.getElementById('collectionImage');
    if (!input) return;

    input.addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file', 'error');
            input.value = '';
            return;
        }

        const maxSize = 3 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification('Image size should be under 3MB', 'error');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            document.getElementById('collectionImageData').value = typeof reader.result === 'string' ? reader.result : '';
        };
        reader.readAsDataURL(file);
    });
}

function bindCollectionForm() {
    const form = document.getElementById('collectionForm');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.email) {
            showNotification('Please login again to upload artwork', 'error');
            window.location.href = 'index.html';
            return;
        }

        const imageData = document.getElementById('collectionImageData')?.value || '';
        const title = document.getElementById('collectionTitle')?.value.trim() || '';
        const categoryInput = document.getElementById('collectionCategory');
        const category = categoryInput ? categoryInput.value.trim() : '';
        const year = document.getElementById('collectionYear')?.value.trim() || '';
        const description = document.getElementById('collectionDescription')?.value.trim() || '';
        const finalImage = imageData || collectionEditImage;

        if (!finalImage || !title || !category || category === 'all') {
            showNotification('Please add image, title, and category', 'error');
            return;
        }

        const collections = getCollections();
        const userList = Array.isArray(collections[currentUser.email]) ? collections[currentUser.email] : [];

        if (collectionEditId !== null) {
            const targetIndex = userList.findIndex((item) => Number(item.id) === Number(collectionEditId));
            if (targetIndex >= 0) {
                const existing = userList[targetIndex];
                userList[targetIndex] = {
                    ...existing,
                    title,
                    category,
                    year,
                    description,
                    image: finalImage,
                    updatedAt: new Date().toISOString()
                };
            } else {
                userList.unshift({
                    id: Date.now(),
                    title,
                    category,
                    year,
                    description,
                    image: finalImage,
                    createdAt: new Date().toISOString()
                });
            }
        } else {
            userList.unshift({
                id: Date.now(),
                title,
                category,
                year,
                description,
                image: finalImage,
                createdAt: new Date().toISOString()
            });
        }

        collections[currentUser.email] = userList;
        saveCollections(collections);

        const updated = collectionEditId !== null;
        resetCollectionForm();
        showNotification(updated ? 'Artwork updated in your collection' : 'Artwork uploaded to your collection', 'success');
        renderCollection();
    });
}

function bindEditCancel() {
    document.getElementById('collectionCancelEdit')?.addEventListener('click', () => {
        resetCollectionForm();
        showNotification('Edit canceled', 'info');
    });
}

function bindCollectionFilter() {
    const filterSelect = document.getElementById('collectionCategoryFilter');
    if (!filterSelect) return;

    filterSelect.addEventListener('change', () => {
        selectedCollectionCategory = filterSelect.value || 'all';
        renderCollection();
    });
}

function renderCollection() {
    const grid = document.getElementById('collectionGrid');
    const empty = document.getElementById('collectionEmpty');
    if (!grid || !empty) return;

    const currentUser = getCurrentUser();
    const userEmail = currentUser && currentUser.email ? currentUser.email : '';
    const collections = getCollections();
    const list = userEmail && Array.isArray(collections[userEmail]) ? collections[userEmail] : [];
    updateCategoryFilterOptions(list);

    const filteredList = selectedCollectionCategory === 'all'
        ? list
        : list.filter((item) => normalizeCategory(item.category) === selectedCollectionCategory);

    if (!filteredList.length) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        empty.textContent = list.length ? 'No artworks found for this category.' : 'No artworks uploaded yet.';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = filteredList.map((item) => `
        <article class="collection-item">
            <img src="${item.image}" alt="${escapeHtml(item.title)}">
            <div class="collection-item-info">
                <h4>${escapeHtml(item.title)}</h4>
                <p>${escapeHtml(item.category)}${item.year ? ` | ${escapeHtml(item.year)}` : ''}</p>
                <small>${escapeHtml(item.description || 'No description')}</small>
            </div>
            <div class="collection-item-actions">
                <button class="collection-edit-btn" type="button" data-id="${item.id}" aria-label="Edit uploaded artwork">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="collection-delete-btn" type="button" data-id="${item.id}" aria-label="Delete uploaded artwork">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </article>
    `).join('');

    grid.querySelectorAll('.collection-edit-btn[data-id]').forEach((btn) => {
        btn.addEventListener('click', () => startEditItem(Number(btn.dataset.id)));
    });
    grid.querySelectorAll('.collection-delete-btn[data-id]').forEach((btn) => {
        btn.addEventListener('click', () => removeItem(Number(btn.dataset.id)));
    });
}

function updateCategoryFilterOptions(list) {
    const filterSelect = document.getElementById('collectionCategoryFilter');
    if (!filterSelect) return;

    const categories = Array.from(
        new Set(
            list
                .map((item) => String(item.category || '').trim())
                .filter(Boolean)
        )
    ).sort((a, b) => a.localeCompare(b));

    filterSelect.innerHTML = '<option value="all">All Categories</option>' +
        categories.map((category) =>
            `<option value="${escapeHtml(normalizeCategory(category))}">${escapeHtml(category)}</option>`
        ).join('');

    const hasSelected = selectedCollectionCategory === 'all' ||
        categories.some((category) => normalizeCategory(category) === selectedCollectionCategory);
    if (!hasSelected) selectedCollectionCategory = 'all';
    filterSelect.value = selectedCollectionCategory;
}

function removeItem(id) {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) return;

    const collections = getCollections();
    const list = Array.isArray(collections[currentUser.email]) ? collections[currentUser.email] : [];
    collections[currentUser.email] = list.filter((item) => item.id !== id);
    saveCollections(collections);
    if (Number(collectionEditId) === Number(id)) {
        resetCollectionForm();
    }
    renderCollection();
    showNotification('Artwork removed from your collection', 'info');
}

function startEditItem(id) {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) return;

    const collections = getCollections();
    const list = Array.isArray(collections[currentUser.email]) ? collections[currentUser.email] : [];
    const item = list.find((entry) => Number(entry.id) === Number(id));
    if (!item) {
        showNotification('Artwork not found for editing', 'error');
        return;
    }

    collectionEditId = item.id;
    collectionEditImage = item.image || '';

    const imageDataInput = document.getElementById('collectionImageData');
    const imageInput = document.getElementById('collectionImage');
    const titleInput = document.getElementById('collectionTitle');
    const categoryInput = document.getElementById('collectionCategory');
    const yearInput = document.getElementById('collectionYear');
    const descriptionInput = document.getElementById('collectionDescription');

    if (imageDataInput) imageDataInput.value = collectionEditImage;
    if (imageInput) {
        imageInput.required = false;
        imageInput.value = '';
    }
    if (titleInput) titleInput.value = item.title || '';
    if (categoryInput) categoryInput.value = item.category || '';
    if (yearInput) yearInput.value = item.year || '';
    if (descriptionInput) descriptionInput.value = item.description || '';

    updateCollectionFormMode(true);
    document.getElementById('collectionForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetCollectionForm() {
    document.getElementById('collectionForm')?.reset();
    const imageDataInput = document.getElementById('collectionImageData');
    const imageInput = document.getElementById('collectionImage');
    if (imageDataInput) imageDataInput.value = '';
    if (imageInput) imageInput.required = true;
    collectionEditId = null;
    collectionEditImage = '';
    updateCollectionFormMode(false);
}

function updateCollectionFormMode(isEdit) {
    const submitBtn = document.querySelector('#collectionForm button[type="submit"]');
    const cancelBtn = document.getElementById('collectionCancelEdit');
    if (submitBtn) {
        submitBtn.innerHTML = isEdit
            ? '<i class="fas fa-save"></i> Update Artwork'
            : '<i class="fas fa-upload"></i> Upload Artwork';
    }
    if (cancelBtn) cancelBtn.style.display = isEdit ? 'inline-flex' : 'none';
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function normalizeCategory(value) {
    return String(value || '').trim().toLowerCase();
}
