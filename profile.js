// ========================================
// PROFILE PAGE SCRIPT
// ========================================

'use strict';

const PROFILE_STORE_KEY = 'galleryUserProfiles';
const CURRENT_USER_KEY = 'galleryCurrentUser';
const USERS_KEY = 'galleryUsers';

document.addEventListener('DOMContentLoaded', initProfilePage);

function initProfilePage() {
    setupMobileMenu();

    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
        window.location.href = 'gallery.html';
        return;
    }

    fillProfileForm(currentUser);
    bindProfileForm(currentUser);
    bindProfilePhotoUpload();
    bindDobAgeCalculator();
    bindProfileEditToggle();
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = mobileNav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
        });
    }
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

function getProfiles() {
    const raw = localStorage.getItem(PROFILE_STORE_KEY);
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function saveProfiles(profiles) {
    localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(profiles));
}

function fillProfileForm(currentUser) {
    const profiles = getProfiles();
    const savedProfile = profiles[currentUser.email] || {};

    const [fallbackFirstName, ...restParts] = (currentUser.name || '').split(' ').filter(Boolean);
    const fallbackLastName = restParts.join(' ');
    const resolvedFirstName = savedProfile.firstName || fallbackFirstName || '';
    const resolvedLastName = savedProfile.lastName || fallbackLastName || '';
    const resolvedName = `${resolvedFirstName} ${resolvedLastName}`.trim() || savedProfile.name || currentUser.name || '';

    document.getElementById('profileFirstName').value = resolvedFirstName;
    document.getElementById('profileLastName').value = resolvedLastName;
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = savedProfile.phone || '';
    document.getElementById('profileLocation').value = savedProfile.location || '';
    document.getElementById('profileDob').value = savedProfile.dob || '';
    document.getElementById('profileAge').value = savedProfile.age || '';
    document.getElementById('profileGender').value = savedProfile.gender || '';
    document.getElementById('profileProfession').value = savedProfile.profession || '';
    document.getElementById('profileInstagram').value = savedProfile.social?.instagram || '';
    document.getElementById('profileFacebook').value = savedProfile.social?.facebook || '';
    document.getElementById('profileLinkedin').value = savedProfile.social?.linkedin || '';
    document.getElementById('profileX').value = savedProfile.social?.x || '';
    document.getElementById('profileWebsite').value = savedProfile.social?.website || '';
    document.getElementById('profileBio').value = savedProfile.bio || '';
    document.getElementById('profilePhotoData').value = savedProfile.photo || '';
    updateProfileHead(resolvedName, savedProfile.photo || '');
}

function bindProfileForm(currentUser) {
    const form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const firstName = document.getElementById('profileFirstName').value.trim();
        const lastName = document.getElementById('profileLastName').value.trim();
        const name = `${firstName} ${lastName}`.trim();
        const email = document.getElementById('profileEmail').value.trim().toLowerCase();
        const phone = document.getElementById('profilePhone').value.trim();
        const location = document.getElementById('profileLocation').value.trim();
        const dob = document.getElementById('profileDob').value;
        const age = document.getElementById('profileAge').value.trim();
        const gender = document.getElementById('profileGender').value;
        const profession = document.getElementById('profileProfession').value.trim();
        const social = {
            instagram: document.getElementById('profileInstagram').value.trim(),
            facebook: document.getElementById('profileFacebook').value.trim(),
            linkedin: document.getElementById('profileLinkedin').value.trim(),
            x: document.getElementById('profileX').value.trim(),
            website: document.getElementById('profileWebsite').value.trim()
        };
        const bio = document.getElementById('profileBio').value.trim();
        const photo = document.getElementById('profilePhotoData').value || '';

        if (!firstName || !lastName) {
            showNotification('Please enter first name and last name', 'error');
            return;
        }

        const profiles = getProfiles();
        profiles[email] = {
            firstName,
            lastName,
            name,
            phone,
            location,
            dob,
            age,
            gender,
            profession,
            social,
            bio,
            photo
        };
        saveProfiles(profiles);

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ name, email }));
        syncUsersStore(email, name);
        updateProfileHead(name, photo);
        renderProfileView({
            firstName,
            lastName,
            email,
            phone,
            location,
            dob,
            age,
            gender,
            profession,
            social,
            bio
        });
        setProfileMode('view');

        showNotification('Profile updated successfully', 'success');
    });

    const nameInputs = [document.getElementById('profileFirstName'), document.getElementById('profileLastName')];
    nameInputs.forEach((nameInput) => {
        if (!nameInput) return;
        nameInput.addEventListener('input', () => {
            const photo = document.getElementById('profilePhotoData').value || '';
            const first = document.getElementById('profileFirstName').value.trim();
            const last = document.getElementById('profileLastName').value.trim();
            updateProfileHead(`${first} ${last}`.trim(), photo);
        });
    });
}

function bindProfileEditToggle() {
    const editBtn = document.getElementById('profileEditBtn');
    if (!editBtn) return;

    editBtn.addEventListener('click', () => {
        setProfileMode('edit');
    });
}

function bindProfilePhotoUpload() {
    const input = document.getElementById('profilePhoto');
    if (!input) return;

    input.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showNotification('Please upload an image file', 'error');
            input.value = '';
            return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification('Image size should be under 2MB', 'error');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const data = typeof reader.result === 'string' ? reader.result : '';
            document.getElementById('profilePhotoData').value = data;
            const first = document.getElementById('profileFirstName').value.trim();
            const last = document.getElementById('profileLastName').value.trim();
            const name = `${first} ${last}`.trim();
            updateProfileHead(name, data);
        };
        reader.readAsDataURL(file);
    });
}

function bindDobAgeCalculator() {
    const dobInput = document.getElementById('profileDob');
    const ageInput = document.getElementById('profileAge');
    if (!dobInput || !ageInput) return;

    const updateAge = () => {
        const dob = dobInput.value;
        ageInput.value = dob ? String(calculateAge(dob)) : '';
    };

    dobInput.addEventListener('change', updateAge);
    updateAge();
}

function setProfileMode(mode) {
    const form = document.getElementById('profileForm');
    const view = document.getElementById('profileView');
    const editBtn = document.getElementById('profileEditBtn');
    const isView = mode === 'view';

    if (form) form.style.display = isView ? 'none' : 'grid';
    if (view) view.style.display = isView ? 'block' : 'none';
    if (editBtn) editBtn.style.display = isView ? 'inline-flex' : 'none';
}

function renderProfileView(profile) {
    const grid = document.getElementById('profileViewGrid');
    if (!grid) return;

    const details = [
        ['First Name', profile.firstName],
        ['Last Name', profile.lastName],
        ['Email', profile.email],
        ['Phone', profile.phone],
        ['Location', profile.location],
        ['Date of Birth', profile.dob],
        ['Age', profile.age],
        ['Gender', profile.gender],
        ['Profession', profile.profession],
        ['Instagram', profile.social?.instagram],
        ['Facebook', profile.social?.facebook],
        ['LinkedIn', profile.social?.linkedin],
        ['X', profile.social?.x],
        ['Website', profile.social?.website],
        ['Bio', profile.bio]
    ];

    grid.innerHTML = details.map(([label, value]) => `
        <div class="profile-view-item">
            <span class="profile-view-label">${escapeHtml(label)}</span>
            <span class="profile-view-value">${escapeHtml(value || '-')}</span>
        </div>
    `).join('');
}

function calculateAge(dob) {
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }

    return Math.max(0, age);
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function updateProfileHead(name, photoData = '') {
    const displayName = document.getElementById('profileDisplayName');
    const avatar = document.getElementById('profileAvatar');
    const avatarImage = document.getElementById('profileAvatarImage');
    const avatarInitials = document.getElementById('profileAvatarInitials');
    const safeName = name || 'User';

    if (displayName) displayName.textContent = safeName;

    const initials = safeName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('') || 'U';

    if (avatarInitials) {
        avatarInitials.textContent = initials;
    }

    if (photoData) {
        if (avatarImage) {
            avatarImage.src = photoData;
            avatarImage.style.display = 'block';
        }
        if (avatarInitials) avatarInitials.style.display = 'none';
        if (avatar) avatar.classList.add('has-photo');
    } else {
        if (avatarImage) {
            avatarImage.src = '';
            avatarImage.style.display = 'none';
        }
        if (avatarInitials) avatarInitials.style.display = 'inline';
        if (avatar) avatar.classList.remove('has-photo');
    }
}

function syncUsersStore(email, name) {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return;

    try {
        const users = JSON.parse(raw);
        if (!Array.isArray(users)) return;

        let changed = false;
        users.forEach((user) => {
            if (user.email === email && user.name !== name) {
                user.name = name;
                changed = true;
            }
        });

        if (changed) {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
    } catch {
        // No action needed for invalid store
    }
}
