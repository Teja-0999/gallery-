// ============================================
// SHARED AUTH FUNCTIONALITY (CLIENT-SIDE DEMO)
// ============================================

'use strict';

const Auth = {
    usersKey: 'galleryUsers',
    currentUserKey: 'galleryCurrentUser',
    userProfilesKey: 'galleryUserProfiles',
    mode: 'login',

    init() {
        this.injectAuthButtons();
        this.createAuthModal();
        this.bindEvents();
        this.setupSettingsAccountControls();
        this.renderAuthState();
    },

    injectAuthButtons() {
        const headerContent = document.querySelector('.header-content');
        if (headerContent && !document.getElementById('authControls')) {
            const authControls = document.createElement('div');
            authControls.id = 'authControls';
            authControls.className = 'auth-controls';
            authControls.innerHTML = `
                <button class="auth-btn auth-signup-btn" id="accessBtn" type="button">Access Gallery</button>
                <button class="auth-btn auth-user-btn" id="userBtn" type="button" style="display:none;"></button>
                <button class="auth-btn auth-logout-btn" id="logoutBtn" type="button" style="display:none;">Logout</button>
            `;

            let headerRight = document.getElementById('headerRightControls');
            if (!headerRight) {
                headerRight = document.createElement('div');
                headerRight.id = 'headerRightControls';
                headerRight.className = 'header-right-controls';
                headerContent.appendChild(headerRight);
            }

            const settingsBtn = document.getElementById('settingsBtn');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');

            headerRight.appendChild(authControls);

            if (settingsBtn && settingsBtn.parentNode) {
                headerRight.appendChild(settingsBtn);
            }

            if (mobileMenuBtn && mobileMenuBtn.parentNode) {
                headerRight.appendChild(mobileMenuBtn);
            }
        }

        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav && !document.getElementById('mobileAuthControls')) {
            const mobileAuth = document.createElement('div');
            mobileAuth.id = 'mobileAuthControls';
            mobileAuth.className = 'mobile-auth-controls';
            mobileAuth.innerHTML = `
                <button class="mobile-auth-btn" id="mobileAccessBtn" type="button">Access Gallery</button>
                <button class="mobile-auth-btn" id="mobileLogoutBtn" type="button" style="display:none;">Logout</button>
            `;
            mobileNav.appendChild(mobileAuth);
        }
    },

    createAuthModal() {
        if (document.getElementById('authModal')) return;

        const modalHTML = `
        <div class="auth-modal" id="authModal">
            <div class="auth-content">
                <div class="auth-header">
                    <h2 id="authTitle">Access Gallery</h2>
                    <button class="auth-close" id="authClose" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="auth-mode-toggle" role="tablist" aria-label="Authentication mode">
                    <button class="auth-mode-btn active" id="authModeLogin" type="button" role="tab" aria-selected="true">Login</button>
                    <button class="auth-mode-btn" id="authModeSignup" type="button" role="tab" aria-selected="false">Sign Up</button>
                </div>
                <form id="authForm" class="auth-form">
                    <div class="auth-field-group" id="nameField" style="display:none;">
                        <label for="authName">Full Name</label>
                        <input id="authName" type="text" placeholder="Enter your full name">
                    </div>
                    <div class="auth-field-group">
                        <label for="authEmail">Email</label>
                        <input id="authEmail" type="email" placeholder="Enter your email" required>
                    </div>
                    <div class="auth-field-group">
                        <label for="authPassword">Password</label>
                        <input id="authPassword" type="password" placeholder="Enter your password" required>
                    </div>
                    <button class="auth-submit" id="authSubmit" type="submit">Login</button>
                </form>
                <div class="auth-social">
                    <p class="auth-social-title">Or continue with social media</p>
                    <div class="auth-social-buttons">
                        <button class="auth-social-btn google" type="button" data-provider="google">
                            <i class="fab fa-google"></i> Google
                        </button>
                        <button class="auth-social-btn facebook" type="button" data-provider="facebook">
                            <i class="fab fa-facebook-f"></i> Facebook
                        </button>
                        <button class="auth-social-btn twitter" type="button" data-provider="twitter">
                            <i class="fab fa-x-twitter"></i> X
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    bindEvents() {
        document.getElementById('accessBtn')?.addEventListener('click', () => this.openModal());
        document.getElementById('mobileAccessBtn')?.addEventListener('click', () => this.openModal());
        document.getElementById('authModeLogin')?.addEventListener('click', () => this.setMode('login'));
        document.getElementById('authModeSignup')?.addEventListener('click', () => this.setMode('signup'));
        document.getElementById('userBtn')?.addEventListener('click', () => this.openProfilePage());

        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        document.getElementById('mobileLogoutBtn')?.addEventListener('click', () => this.logout());

        document.getElementById('authClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('authModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'authModal') this.closeModal();
        });

        document.querySelectorAll('.auth-social-btn[data-provider]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.provider;
                this.socialAccess(provider);
            });
        });

        document.getElementById('authForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.accessAccount();
        });

        document.addEventListener('click', (e) => {
            if (e.target?.id === 'settingsProfileBtn') {
                this.openProfilePage();
            }
            if (e.target?.id === 'settingsLogoutBtn') {
                this.logout();
            }
        });

        window.addEventListener('storage', (e) => {
            if (e.key === this.currentUserKey) {
                this.renderAuthState();
            }
        });
    },

    setupSettingsAccountControls() {
        const settingsBody = document.querySelector('#settingsModal .settings-body');
        if (settingsBody && !document.getElementById('settingsAccountTop')) {
            settingsBody.insertAdjacentHTML('afterbegin', `
                <div class="settings-account-top" id="settingsAccountTop" style="display:none;">
                    <button class="settings-profile-btn" id="settingsProfileBtn" type="button">
                        <i class="fas fa-user-circle"></i> Profile
                    </button>
                    <button class="settings-logout-btn" id="settingsLogoutBtn" type="button">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            `);
        }
    },

    openProfilePage() {
        window.location.href = 'profile.html';
    },

    updateSettingsAccountControls(currentUser) {
        this.setupSettingsAccountControls();
        const top = document.getElementById('settingsAccountTop');
        const profileBtn = document.getElementById('settingsProfileBtn');

        const visible = !!currentUser;
        if (top) top.style.display = visible ? 'flex' : 'none';

        if (profileBtn && currentUser && currentUser.email) {
            const profiles = this.getProfiles();
            const profile = profiles[currentUser.email] || {};
            const name = currentUser.name || 'Profile';
            const initials = name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0].toUpperCase())
                .join('') || 'U';

            if (profile.photo) {
                profileBtn.innerHTML = `<img src="${profile.photo}" alt="Profile photo" class="settings-profile-avatar"><span>Profile</span>`;
            } else {
                profileBtn.innerHTML = `<span class="settings-profile-initials">${initials}</span><span>Profile</span>`;
            }
        }
    },

    openModal() {
        this.setMode('login');
        const modal = document.getElementById('authModal');
        if (modal) modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        const modal = document.getElementById('authModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('authForm')?.reset();
    },

    setMode(mode) {
        this.mode = mode === 'signup' ? 'signup' : 'login';
        const isSignup = this.mode === 'signup';

        const loginBtn = document.getElementById('authModeLogin');
        const signupBtn = document.getElementById('authModeSignup');
        const nameField = document.getElementById('nameField');
        const nameInput = document.getElementById('authName');
        const submitBtn = document.getElementById('authSubmit');

        if (loginBtn) {
            loginBtn.classList.toggle('active', !isSignup);
            loginBtn.setAttribute('aria-selected', String(!isSignup));
        }
        if (signupBtn) {
            signupBtn.classList.toggle('active', isSignup);
            signupBtn.setAttribute('aria-selected', String(isSignup));
        }
        if (nameField) nameField.style.display = isSignup ? 'block' : 'none';
        if (nameInput) nameInput.required = isSignup;
        if (submitBtn) submitBtn.textContent = isSignup ? 'Create Account' : 'Login';
    },

    getUsers() {
        const raw = localStorage.getItem(this.usersKey);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    },

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    },

    createAccount(name, email, password) {
        const users = this.getUsers();
        users.push({ name, email, password });
        this.saveUsers(users);
        localStorage.setItem(this.currentUserKey, JSON.stringify({ name, email }));
        this.renderAuthState();
        this.closeModal();
        showNotification('Account created successfully!', 'success');
    },

    loginAccount(user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify({ name: user.name, email: user.email }));
        this.renderAuthState();
        this.closeModal();
        showNotification(`Welcome back, ${user.name}!`, 'success');
    },

    accessAccount() {
        const name = document.getElementById('authName')?.value.trim();
        const email = document.getElementById('authEmail')?.value.trim().toLowerCase();
        const password = document.getElementById('authPassword')?.value || '';

        if (!email || !password) {
            showNotification('Please enter email and password', 'error');
            return;
        }

        const users = this.getUsers();
        const existingUser = users.find((u) => u.email === email);

        if (this.mode === 'login') {
            if (!existingUser) {
                showNotification('No account found. Please use Sign Up.', 'info');
                return;
            }
            if (existingUser.password !== password) {
                showNotification('Invalid email or password', 'error');
                return;
            }
            this.loginAccount(existingUser);
            return;
        }

        if (existingUser) {
            showNotification('Account already exists. Please use Login.', 'info');
            return;
        }

        if (!name) {
            showNotification('Please enter full name to create account', 'error');
            return;
        }

        this.createAccount(name, email, password);
    },

    createSocialAccount(socialEmail, provider, label) {
        const derivedName = socialEmail.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || `${label} User`;
        const normalizedName = derivedName
            .split(' ')
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        const user = {
            name: normalizedName || `${label} User`,
            email: socialEmail,
            password: `social_${provider}_${Date.now()}`,
            authMethod: provider
        };
        const users = this.getUsers();
        users.push(user);
        this.saveUsers(users);
        this.loginAccount(user);
    },

    socialAccess(provider) {
        const providerNames = {
            google: 'Google',
            facebook: 'Facebook',
            twitter: 'X'
        };
        const label = providerNames[provider] || 'Social';
        if (!providerNames[provider]) {
            showNotification('Provider is not supported', 'error');
            return;
        }

        const entered = window.prompt(`Enter your ${label} account email to continue in Gallery:`, '') || '';
        const socialEmail = entered.trim().toLowerCase();
        if (!socialEmail) {
            showNotification('Please enter your social account email', 'error');
            return;
        }

        const users = this.getUsers();
        const existingUser = users.find((user) => user.email === socialEmail);
        if (existingUser) {
            this.loginAccount(existingUser);
            return;
        }

        this.createSocialAccount(socialEmail, provider, label);
    },

    logout() {
        localStorage.removeItem(this.currentUserKey);
        this.renderAuthState();
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        const raw = localStorage.getItem(this.currentUserKey);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    getProfiles() {
        const raw = localStorage.getItem(this.userProfilesKey);
        if (!raw) return {};
        try {
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    },

    renderAuthState() {
        const currentUser = this.getCurrentUser();

        const accessBtn = document.getElementById('accessBtn');
        const userBtn = document.getElementById('userBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const mobileAccess = document.getElementById('mobileAccessBtn');
        const mobileLogout = document.getElementById('mobileLogoutBtn');

        if (currentUser) {
            if (accessBtn) accessBtn.style.display = 'none';
            if (userBtn) userBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (mobileAccess) mobileAccess.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'none';
        } else {
            if (accessBtn) accessBtn.style.display = 'inline-flex';
            if (userBtn) {
                userBtn.style.display = 'none';
                userBtn.textContent = '';
            }
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (mobileAccess) mobileAccess.style.display = 'block';
            if (mobileLogout) mobileLogout.style.display = 'none';
        }

        this.updateSettingsAccountControls(currentUser);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}
