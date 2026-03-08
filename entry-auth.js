// ========================================
// ENTRY AUTH PAGE
// ========================================

'use strict';

const ENTRY_USERS_KEY = 'galleryUsers';
const ENTRY_CURRENT_USER_KEY = 'galleryCurrentUser';
const ENTRY_PROFILES_KEY = 'galleryUserProfiles';

let entryMode = 'login';
let signupMethod = 'email';
let otpState = {
    emailCode: '',
    emailVerified: false,
    mobileCode: '',
    mobileVerified: false
};
const SOCIAL_PROVIDER_CONFIG = {
    google: {
        label: 'Google',
        icon: 'fab fa-google'
    },
    facebook: {
        label: 'Facebook',
        icon: 'fab fa-facebook-f'
    },
    twitter: {
        label: 'Twitter',
        icon: 'fab fa-x-twitter'
    },
    linkedin: {
        label: 'LinkedIn',
        icon: 'fab fa-linkedin-in'
    }
};
let socialDialogState = {
    provider: ''
};

document.addEventListener('DOMContentLoaded', initEntryAuth);

function initEntryAuth() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email) {
        window.location.href = 'gallery.html';
        return;
    }

    bindTabs();
    bindMethodButtons();
    bindForm();
    bindOtpActions();
    bindSocialActions();
    bindSocialDialog();
    updateCredentialFields();
}

function bindTabs() {
    const loginTab = document.getElementById('entryLoginTab');
    const signupTab = document.getElementById('entrySignupTab');

    loginTab?.addEventListener('click', () => setEntryMode('login'));
    signupTab?.addEventListener('click', () => setEntryMode('signup'));
}

function bindMethodButtons() {
    document.querySelectorAll('.auth-entry-method-btn[data-method]').forEach((btn) => {
        btn.addEventListener('click', () => setSignupMethod(btn.dataset.method || 'email'));
    });
}

function bindForm() {
    const form = document.getElementById('entryAuthForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (entryMode === 'signup') {
            submitSignup();
            return;
        }
        submitLogin();
    });
}

function setEntryMode(mode) {
    entryMode = mode === 'signup' ? 'signup' : 'login';
    const isSignup = entryMode === 'signup';

    const loginTab = document.getElementById('entryLoginTab');
    const signupTab = document.getElementById('entrySignupTab');
    const nameRow = document.getElementById('entryNameRow');
    const methodRow = document.getElementById('entryMethodRow');
    const mobileRow = document.getElementById('entryMobileRow');
    const emailRow = document.getElementById('entryEmailRow');
    const otpWrap = document.getElementById('entryOtpWrap');
    const nameInput = document.getElementById('entryName');
    const mobileInput = document.getElementById('entryMobile');
    const emailInput = document.getElementById('entryEmail');
    const submitBtn = document.getElementById('entrySubmitBtn');

    if (loginTab) {
        loginTab.classList.toggle('active', !isSignup);
        loginTab.setAttribute('aria-selected', String(!isSignup));
    }
    if (signupTab) {
        signupTab.classList.toggle('active', isSignup);
        signupTab.setAttribute('aria-selected', String(isSignup));
    }
    if (nameRow) nameRow.style.display = isSignup ? 'block' : 'none';
    if (methodRow) methodRow.style.display = isSignup ? 'block' : 'none';
    if (otpWrap) otpWrap.style.display = isSignup ? 'block' : 'none';
    if (nameInput) nameInput.required = isSignup;
    if (mobileInput) mobileInput.required = false;
    if (emailInput) emailInput.required = false;
    if (mobileRow) mobileRow.style.display = isSignup ? 'none' : 'block';
    if (emailRow) emailRow.style.display = 'block';
    if (submitBtn) submitBtn.textContent = isSignup ? 'Create Account' : 'Login';

    resetOtpState();
    updateCredentialFields();
}

function setSignupMethod(method) {
    signupMethod = method === 'mobile' ? 'mobile' : 'email';
    document.querySelectorAll('.auth-entry-method-btn[data-method]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.method === signupMethod);
    });
    resetOtpState();
    updateCredentialFields();
}

function updateCredentialFields() {
    const isSignup = entryMode === 'signup';
    const emailRow = document.getElementById('entryEmailRow');
    const mobileRow = document.getElementById('entryMobileRow');
    const emailInput = document.getElementById('entryEmail');
    const mobileInput = document.getElementById('entryMobile');
    const emailOtpBlock = document.getElementById('entryEmailOtpBlock');
    const mobileOtpBlock = document.getElementById('entryMobileOtpBlock');

    if (!isSignup) {
        if (emailRow) emailRow.style.display = 'block';
        if (mobileRow) mobileRow.style.display = 'block';
        if (emailInput) emailInput.required = false;
        if (mobileInput) mobileInput.required = false;
        if (emailOtpBlock) emailOtpBlock.style.display = 'none';
        if (mobileOtpBlock) mobileOtpBlock.style.display = 'none';
        return;
    }

    const useMobile = signupMethod === 'mobile';
    if (emailRow) emailRow.style.display = useMobile ? 'none' : 'block';
    if (mobileRow) mobileRow.style.display = useMobile ? 'block' : 'none';
    if (emailInput) emailInput.required = !useMobile;
    if (mobileInput) mobileInput.required = useMobile;
    if (emailOtpBlock) emailOtpBlock.style.display = useMobile ? 'none' : 'block';
    if (mobileOtpBlock) mobileOtpBlock.style.display = useMobile ? 'block' : 'none';
}

function getUsers() {
    const raw = localStorage.getItem(ENTRY_USERS_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(ENTRY_USERS_KEY, JSON.stringify(users));
}

function getProfiles() {
    const raw = localStorage.getItem(ENTRY_PROFILES_KEY);
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function saveProfiles(profiles) {
    localStorage.setItem(ENTRY_PROFILES_KEY, JSON.stringify(profiles));
}

function getCurrentUser() {
    const raw = localStorage.getItem(ENTRY_CURRENT_USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function submitSignup() {
    const name = document.getElementById('entryName')?.value.trim();
    const mobile = document.getElementById('entryMobile')?.value.trim();
    const email = document.getElementById('entryEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('entryPassword')?.value || '';
    const usingMobile = signupMethod === 'mobile';

    if (!name || !password) {
        showNotification('Please complete all fields', 'error');
        return;
    }

    if (usingMobile && !mobile) {
        showNotification('Please enter mobile number', 'error');
        return;
    }

    if (!usingMobile && !email) {
        showNotification('Please enter email address', 'error');
        return;
    }

    if (usingMobile && !otpState.mobileVerified) {
        showNotification('Please verify mobile OTP', 'error');
        return;
    }

    if (!usingMobile && !otpState.emailVerified) {
        showNotification('Please verify email OTP', 'error');
        return;
    }

    const users = getUsers();
    if (!usingMobile && users.some((user) => user.email === email)) {
        showNotification('Account already exists. Please login.', 'info');
        setEntryMode('login');
        return;
    }

    if (usingMobile && users.some((user) => user.mobile === mobile)) {
        showNotification('Account already exists. Please login.', 'info');
        setEntryMode('login');
        return;
    }

    const normalizedMobile = mobile || '';
    const resolvedEmail = usingMobile ? `mobile_${normalizedMobile.replace(/\D/g, '')}@gallery.local` : email;

    users.push({ name, email: resolvedEmail, mobile: normalizedMobile, password, authMethod: signupMethod });
    saveUsers(users);
    const profiles = getProfiles();
    profiles[resolvedEmail] = { name, phone: normalizedMobile };
    saveProfiles(profiles);
    localStorage.setItem(ENTRY_CURRENT_USER_KEY, JSON.stringify({ name, email: resolvedEmail }));
    window.location.href = 'gallery.html';
}

function submitLogin() {
    const email = document.getElementById('entryEmail')?.value.trim().toLowerCase();
    const mobile = document.getElementById('entryMobile')?.value.trim();
    const password = document.getElementById('entryPassword')?.value || '';

    if (!password || (!email && !mobile)) {
        showNotification('Enter email or mobile number with password', 'error');
        return;
    }

    const user = getUsers().find((item) => {
        const emailMatch = email && item.email === email;
        const mobileMatch = mobile && item.mobile === mobile;
        return (emailMatch || mobileMatch) && item.password === password;
    });
    if (!user) {
        showNotification('Invalid login credentials', 'error');
        return;
    }

    localStorage.setItem(ENTRY_CURRENT_USER_KEY, JSON.stringify({ name: user.name, email: user.email }));
    window.location.href = 'gallery.html';
}

function bindOtpActions() {
    document.getElementById('entrySendEmailOtp')?.addEventListener('click', sendEmailOtp);
    document.getElementById('entryVerifyEmailOtp')?.addEventListener('click', verifyEmailOtp);
    document.getElementById('entrySendMobileOtp')?.addEventListener('click', sendMobileOtp);
    document.getElementById('entryVerifyMobileOtp')?.addEventListener('click', verifyMobileOtp);
}

function bindSocialActions() {
    document.querySelectorAll('.auth-entry-social-btn[data-provider]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const provider = btn.dataset.provider || 'social';
            socialAccess(provider);
        });
    });
}

function bindSocialDialog() {
    document.getElementById('socialAuthDialogForm')?.addEventListener('submit', submitSocialDialog);
    document.getElementById('socialAuthCancel')?.addEventListener('click', closeSocialDialog);
    document.getElementById('socialAuthClose')?.addEventListener('click', closeSocialDialog);
    document.getElementById('socialAuthBackdrop')?.addEventListener('click', closeSocialDialog);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeSocialDialog();
        }
    });
}

function randomOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function sendEmailOtp() {
    if (entryMode !== 'signup' || signupMethod !== 'email') return;
    const email = document.getElementById('entryEmail')?.value.trim().toLowerCase();
    if (!email) {
        showNotification('Enter email first', 'error');
        return;
    }

    otpState.emailCode = randomOtp();
    otpState.emailVerified = false;
    updateOtpStatus('entryEmailOtpStatus', false);
    showNotification(`Demo Email OTP: ${otpState.emailCode}`, 'info');
}

function verifyEmailOtp() {
    const entered = document.getElementById('entryEmailOtp')?.value.trim();
    if (!otpState.emailCode) {
        showNotification('Send email OTP first', 'error');
        return;
    }

    otpState.emailVerified = entered === otpState.emailCode;
    updateOtpStatus('entryEmailOtpStatus', otpState.emailVerified);
    showNotification(otpState.emailVerified ? 'Email verified' : 'Invalid email OTP', otpState.emailVerified ? 'success' : 'error');
}

function sendMobileOtp() {
    if (entryMode !== 'signup' || signupMethod !== 'mobile') return;
    const mobile = document.getElementById('entryMobile')?.value.trim();
    if (!mobile) {
        showNotification('Enter mobile number first', 'error');
        return;
    }

    otpState.mobileCode = randomOtp();
    otpState.mobileVerified = false;
    updateOtpStatus('entryMobileOtpStatus', false);
    showNotification(`Demo Mobile OTP: ${otpState.mobileCode}`, 'info');
}

function verifyMobileOtp() {
    const entered = document.getElementById('entryMobileOtp')?.value.trim();
    if (!otpState.mobileCode) {
        showNotification('Send mobile OTP first', 'error');
        return;
    }

    otpState.mobileVerified = entered === otpState.mobileCode;
    updateOtpStatus('entryMobileOtpStatus', otpState.mobileVerified);
    showNotification(otpState.mobileVerified ? 'Mobile verified' : 'Invalid mobile OTP', otpState.mobileVerified ? 'success' : 'error');
}

function updateOtpStatus(id, verified) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = verified ? 'Verified' : 'Not verified';
    element.classList.toggle('verified', verified);
}

function resetOtpState() {
    otpState = {
        emailCode: '',
        emailVerified: false,
        mobileCode: '',
        mobileVerified: false
    };
    updateOtpStatus('entryEmailOtpStatus', false);
    updateOtpStatus('entryMobileOtpStatus', false);

    const emailOtp = document.getElementById('entryEmailOtp');
    const mobileOtp = document.getElementById('entryMobileOtp');
    if (emailOtp) emailOtp.value = '';
    if (mobileOtp) mobileOtp.value = '';
}

function socialAccess(provider) {
    const config = SOCIAL_PROVIDER_CONFIG[provider];
    if (!config) {
        showNotification('Provider is not supported', 'error');
        return;
    }

    openSocialDialog(provider);
}

function openSocialDialog(provider) {
    const config = SOCIAL_PROVIDER_CONFIG[provider];
    const modal = document.getElementById('socialAuthModal');
    const title = document.getElementById('socialAuthTitle');
    const subtitle = document.getElementById('socialAuthSubtitle');
    const hint = document.getElementById('socialAuthHint');
    const iconWrap = document.getElementById('socialAuthIcon');
    const emailInput = document.getElementById('socialAuthEmail');

    if (!config || !modal || !emailInput) {
        showNotification('Social login UI is unavailable', 'error');
        return;
    }

    socialDialogState.provider = provider;
    if (title) title.textContent = `Continue with ${config.label}`;
    if (subtitle) subtitle.textContent = `Use your ${config.label} account email to continue.`;
    if (hint) hint.textContent = `Enter your ${config.label} account email to continue in Gallery.`;
    if (iconWrap) iconWrap.innerHTML = `<i class="${config.icon}" aria-hidden="true"></i>`;

    const prefillEmail = document.getElementById('entryEmail')?.value.trim().toLowerCase() || '';
    emailInput.value = prefillEmail;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    emailInput.focus();
}

function closeSocialDialog() {
    const modal = document.getElementById('socialAuthModal');
    if (!modal || !modal.classList.contains('open')) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.getElementById('socialAuthDialogForm')?.reset();
    socialDialogState.provider = '';
}

function submitSocialDialog(event) {
    event.preventDefault();
    const provider = socialDialogState.provider;
    const config = SOCIAL_PROVIDER_CONFIG[provider];
    const socialEmail = document.getElementById('socialAuthEmail')?.value.trim().toLowerCase() || '';

    if (!config) {
        showNotification('Provider is not supported', 'error');
        return;
    }

    if (!socialEmail) {
        showNotification('Please enter your social account email', 'error');
        return;
    }

    const existingUser = getUsers().find((user) => user.email === socialEmail);
    if (existingUser) {
        localStorage.setItem(ENTRY_CURRENT_USER_KEY, JSON.stringify({ name: existingUser.name, email: existingUser.email }));
        closeSocialDialog();
        showNotification(`Logged in with ${config.label}`, 'success');
        window.location.href = 'gallery.html';
        return;
    }

    const users = getUsers();
    const derivedName = socialEmail.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || config.label + ' User';
    const fallbackName = derivedName
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

    const newUser = {
        name: fallbackName || config.label + ' User',
        email: socialEmail,
        mobile: '',
        password: `social_${provider}_${Date.now()}`,
        authMethod: provider
    };
    users.push(newUser);
    saveUsers(users);

    const profiles = getProfiles();
    profiles[socialEmail] = { name: newUser.name, phone: '' };
    saveProfiles(profiles);

    localStorage.setItem(ENTRY_CURRENT_USER_KEY, JSON.stringify({ name: newUser.name, email: newUser.email }));
    closeSocialDialog();
    showNotification(`Account created with ${config.label}. Logged in to Gallery.`, 'success');
    window.location.href = 'gallery.html';
}
