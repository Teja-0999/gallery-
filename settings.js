// ============================================
// SHARED SETTINGS FUNCTIONALITY
// ============================================

const Settings = {
    defaults: {
        theme: 'dark',
        animations: true,
        autoSlide: true,
        sliderSpeed: 5,
        gridColumns: 4,
        imageQuality: 'high',
        hoverEffects: true,
        lazyLoading: true,
        smoothScroll: true,
        stickyHeader: true,
        showScrollIndicator: true,
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false,
        preloadImages: false,
        cacheData: true
    },
    
    init() {
        this.createSettingsModal();
        this.loadSettings();
        this.bindEvents();
        this.applySettings();
        this.bindStorageSync();
    },
    
    createSettingsModal() {
        // Check if modal already exists
        if (document.getElementById('settingsModal')) return;
        
        const modalHTML = `
        <div class="settings-modal" id="settingsModal">
            <div class="settings-content">
                <div class="settings-header">
                    <h2><i class="fas fa-cog"></i> Gallery Settings</h2>
                    <button class="settings-close" id="settingsClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="settings-body">
                    <!-- Display Settings -->
                    <div class="settings-section">
                        <h3><i class="fas fa-desktop"></i> Display Settings</h3>
                        
                        <div class="setting-item">
                            <label for="themeSelect">
                                <i class="fas fa-palette"></i> Theme
                            </label>
                            <select id="themeSelect" class="setting-select">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto (System)</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <label for="animationToggle">
                                <i class="fas fa-magic"></i> Animations
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="animationToggle" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <label for="autoSlideToggle">
                                <i class="fas fa-play-circle"></i> Auto-play Hero Slider
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="autoSlideToggle" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <label for="sliderSpeed">
                                <i class="fas fa-tachometer-alt"></i> Slider Speed (seconds)
                            </label>
                            <div class="setting-range-wrap">
                                <input type="range" id="sliderSpeed" min="3" max="10" value="5" class="setting-range">
                                <input type="number" id="sliderSpeedManual" min="3" max="10" value="5" class="setting-number" aria-label="Manual slider speed value in seconds">
                            </div>
                            <span class="range-value" id="sliderSpeedValue">5s</span>
                        </div>
                    </div>
                    
                    <!-- Gallery Settings -->
                    <div class="settings-section">
                        <h3><i class="fas fa-images"></i> Gallery Settings</h3>
                        
                        <div class="setting-item">
                            <label for="gridColumns">
                                <i class="fas fa-th"></i> Grid Columns
                            </label>
                            <select id="gridColumns" class="setting-select">
                                <option value="2">2 Columns</option>
                                <option value="3">3 Columns</option>
                                <option value="4" selected>4 Columns</option>
                                <option value="5">5 Columns</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <label for="imageQuality">
                                <i class="fas fa-image"></i> Image Quality
                            </label>
                            <select id="imageQuality" class="setting-select">
                                <option value="low">Low (Faster)</option>
                                <option value="medium">Medium</option>
                                <option value="high" selected>High</option>
                                <option value="original">Original (Slower)</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <label for="hoverEffects">
                                <i class="fas fa-hand-pointer"></i> Hover Effects
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="hoverEffects" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <label for="lazyLoading">
                                <i class="fas fa-spinner"></i> Lazy Loading
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="lazyLoading" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Navigation Settings -->
                    <div class="settings-section">
                        <h3><i class="fas fa-compass"></i> Navigation Settings</h3>
                        
                        <div class="setting-item">
                            <label for="smoothScroll">
                                <i class="fas fa-arrows-alt-v"></i> Smooth Scrolling
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="smoothScroll" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <label for="stickyHeader">
                                <i class="fas fa-thumbtack"></i> Sticky Header
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="stickyHeader" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <label for="showScrollIndicator">
                                <i class="fas fa-chevron-down"></i> Scroll Indicator
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="showScrollIndicator" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Accessibility Settings -->
                    <div class="settings-section">
                        <h3><i class="fas fa-universal-access"></i> Accessibility</h3>
                        
                        <div class="setting-item">
                            <label for="fontSize">
                                <i class="fas fa-text-height"></i> Font Size
                            </label>
                            <select id="fontSize" class="setting-select">
                                <option value="small">Small</option>
                                <option value="medium" selected>Medium</option>
                                <option value="large">Large</option>
                                <option value="xlarge">Extra Large</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <label for="highContrast">
                                <i class="fas fa-adjust"></i> High Contrast
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="highContrast">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <label for="reduceMotion">
                                <i class="fas fa-ban"></i> Reduce Motion
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="reduceMotion">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Performance Settings -->
                    <div class="settings-section">
                        <h3><i class="fas fa-rocket"></i> Performance</h3>
                        
                        <div class="setting-item">
                            <label for="preloadImages">
                                <i class="fas fa-download"></i> Preload Images
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="preloadImages">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <label for="cacheData">
                                <i class="fas fa-database"></i> Cache Data
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="cacheData" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="settings-footer">
                    <button class="btn-reset" id="resetSettings">
                        <i class="fas fa-undo"></i> Reset to Default
                    </button>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    bindEvents() {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const settingsClose = document.getElementById('settingsClose');
        const resetBtn = document.getElementById('resetSettings');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.classList.add('active');
            });
        }
        
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                settingsModal.classList.remove('active');
            });
        }
        
        // Close on outside click
        settingsModal?.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to default?')) {
                    this.resetSettings();
                    if (typeof showNotification === 'function') {
                        showNotification('Settings reset to default', 'info');
                    }
                }
            });
        }
        
        // Real-time updates
        document.getElementById('sliderSpeed')?.addEventListener('input', (e) => {
            const value = this.clampSliderSpeed(e.target.value);
            this.syncSliderInputs(value);
        });

        document.getElementById('sliderSpeedManual')?.addEventListener('input', (e) => {
            const value = this.clampSliderSpeed(e.target.value);
            this.syncSliderInputs(value);
        });
        
        document.getElementById('themeSelect')?.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
        });
        
        document.getElementById('fontSize')?.addEventListener('change', (e) => {
            this.applyFontSize(e.target.value);
        });
        
        document.getElementById('gridColumns')?.addEventListener('change', (e) => {
            this.applyGridColumns(e.target.value);
        });
        
        document.getElementById('highContrast')?.addEventListener('change', (e) => {
            this.applyHighContrast(e.target.checked);
        });
        
        document.getElementById('reduceMotion')?.addEventListener('change', (e) => {
            this.applyReduceMotion(e.target.checked);
        });
        
        document.getElementById('stickyHeader')?.addEventListener('change', (e) => {
            this.applyStickyHeader(e.target.checked);
        });
        
        document.getElementById('showScrollIndicator')?.addEventListener('change', (e) => {
            this.applyScrollIndicator(e.target.checked);
        });
        
        document.getElementById('autoSlideToggle')?.addEventListener('change', (e) => {
            this.applyAutoSlide(e.target.checked);
        });

        this.bindAutoSave();
    },

    bindAutoSave() {
        const controls = document.querySelectorAll('#settingsModal input, #settingsModal select');

        controls.forEach((control) => {
            const eventName = control.type === 'range' ? 'input' : 'change';
            control.addEventListener(eventName, () => {
                clearTimeout(this.autoSaveTimer);
                this.autoSaveTimer = setTimeout(() => {
                    this.saveSettings();
                }, control.type === 'range' ? 120 : 0);
            });
        });
    },
    
    loadSettings() {
        const settings = this.getStoredSettings();
        
        // Update form values
        document.getElementById('themeSelect').value = settings.theme;
        document.getElementById('animationToggle').checked = settings.animations;
        document.getElementById('autoSlideToggle').checked = settings.autoSlide;
        document.getElementById('sliderSpeed').value = settings.sliderSpeed;
        this.syncSliderInputs(settings.sliderSpeed);
        document.getElementById('gridColumns').value = settings.gridColumns;
        document.getElementById('imageQuality').value = settings.imageQuality;
        document.getElementById('hoverEffects').checked = settings.hoverEffects;
        document.getElementById('lazyLoading').checked = settings.lazyLoading;
        document.getElementById('smoothScroll').checked = settings.smoothScroll;
        document.getElementById('stickyHeader').checked = settings.stickyHeader;
        document.getElementById('showScrollIndicator').checked = settings.showScrollIndicator;
        document.getElementById('fontSize').value = settings.fontSize;
        document.getElementById('highContrast').checked = settings.highContrast;
        document.getElementById('reduceMotion').checked = settings.reduceMotion;
        document.getElementById('preloadImages').checked = settings.preloadImages;
        document.getElementById('cacheData').checked = settings.cacheData;
    },
    
    saveSettings() {
        const settings = {
            theme: document.getElementById('themeSelect').value,
            animations: document.getElementById('animationToggle').checked,
            autoSlide: document.getElementById('autoSlideToggle').checked,
            sliderSpeed: this.getSliderSpeedValue(),
            gridColumns: parseInt(document.getElementById('gridColumns').value),
            imageQuality: document.getElementById('imageQuality').value,
            hoverEffects: document.getElementById('hoverEffects').checked,
            lazyLoading: document.getElementById('lazyLoading').checked,
            smoothScroll: document.getElementById('smoothScroll').checked,
            stickyHeader: document.getElementById('stickyHeader').checked,
            showScrollIndicator: document.getElementById('showScrollIndicator').checked,
            fontSize: document.getElementById('fontSize').value,
            highContrast: document.getElementById('highContrast').checked,
            reduceMotion: document.getElementById('reduceMotion').checked,
            preloadImages: document.getElementById('preloadImages').checked,
            cacheData: document.getElementById('cacheData').checked
        };
        
        localStorage.setItem('gallerySettings', JSON.stringify(settings));
        this.applySettings();
        window.dispatchEvent(new CustomEvent('gallerySettingsUpdated', { detail: settings }));
    },
    
    resetSettings() {
        localStorage.removeItem('gallerySettings');
        this.loadSettings();
        this.applySettings();
    },
    
    applySettings() {
        const settings = this.getStoredSettings();
        
        this.applyTheme(settings.theme);
        this.applyFontSize(settings.fontSize);
        this.applyGridColumns(settings.gridColumns);
        this.applyHighContrast(settings.highContrast);
        this.applyReduceMotion(settings.reduceMotion);
        this.applyStickyHeader(settings.stickyHeader);
        this.applyScrollIndicator(settings.showScrollIndicator);
        this.applySmoothScroll(settings.smoothScroll);
        this.applyHoverEffects(settings.hoverEffects);
        
        // Page-specific settings
        if (typeof startHeroAutoSlide === 'function') {
            this.applyAutoSlide(settings.autoSlide);
            this.applySliderSpeed(settings.sliderSpeed);
        }
    },

    getStoredSettings() {
        const saved = localStorage.getItem('gallerySettings');
        if (!saved) return { ...this.defaults };

        try {
            const parsed = JSON.parse(saved);
            return { ...this.defaults, ...parsed };
        } catch {
            return { ...this.defaults };
        }
    },

    bindStorageSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'gallerySettings') {
                this.loadSettings();
                this.applySettings();
            }
        });
    },
    
    applyTheme(theme) {
        document.body.classList.remove('dark-theme', 'light-theme');
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.add('light-theme');
            }
        } else if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.add('light-theme');
        }
        
        // Update meta theme-color for mobile browsers
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const isDark = document.body.classList.contains('dark-theme');
        metaThemeColor.content = isDark ? '#1a1a1a' : '#ffffff';
    },
    
    applyFontSize(size) {
        document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
        document.body.classList.add('font-' + size);
    },
    
    applyGridColumns(cols) {
        const grids = document.querySelectorAll('.artwork-grid, .artist-grid');
        grids.forEach(grid => {
            grid.classList.remove('cols-2', 'cols-3', 'cols-4', 'cols-5');
            grid.classList.add('cols-' + cols);
        });
    },
    
    applyHighContrast(enabled) {
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    },
    
    applyReduceMotion(enabled) {
        if (enabled) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }
    },
    
    applyStickyHeader(enabled) {
        if (enabled) {
            document.body.classList.add('sticky-header');
        } else {
            document.body.classList.remove('sticky-header');
        }
    },
    
    applyScrollIndicator(enabled) {
        const indicator = document.querySelector('.scroll-indicator');
        if (indicator) {
            indicator.style.display = enabled ? 'flex' : 'none';
        }
    },
    
    applyAutoSlide(enabled) {
        if (typeof startHeroAutoSlide === 'function' && typeof stopHeroAutoSlide === 'function') {
            if (enabled) {
                startHeroAutoSlide();
            } else {
                stopHeroAutoSlide();
            }
        }
    },
    
    applySliderSpeed(speed) {
        if (typeof heroAutoSlide !== 'undefined') {
            // Update the interval for hero slider
            if (heroAutoSlide) {
                if (typeof stopHeroAutoSlide === 'function' && typeof startHeroAutoSlide === 'function') {
                    stopHeroAutoSlide();
                    // Update the interval time and restart
                    setTimeout(() => startHeroAutoSlide(), 100);
                }
            }
        }
    },
    
    applySmoothScroll(enabled) {
        document.documentElement.style.scrollBehavior = enabled ? 'smooth' : 'auto';
    },
    
    applyHoverEffects(enabled) {
        const style = document.createElement('style');
        style.id = 'hover-effects-style';
        
        if (!enabled) {
            style.textContent = `
                .artwork-card:hover,
                .artist-card:hover,
                .exhibition-card:hover {
                    transform: none !important;
                }
            `;
            const existing = document.getElementById('hover-effects-style');
            if (existing) existing.remove();
            document.head.appendChild(style);
        } else {
            const existing = document.getElementById('hover-effects-style');
            if (existing) {
                existing.remove();
            }
        }
    },

    clampSliderSpeed(value) {
        const parsed = parseInt(value, 10);
        if (Number.isNaN(parsed)) return 5;
        return Math.min(10, Math.max(3, parsed));
    },

    syncSliderInputs(value) {
        const safeValue = this.clampSliderSpeed(value);
        const range = document.getElementById('sliderSpeed');
        const manual = document.getElementById('sliderSpeedManual');
        const label = document.getElementById('sliderSpeedValue');
        if (range) range.value = safeValue;
        if (manual) manual.value = safeValue;
        if (label) label.textContent = safeValue + 's';
    },

    getSliderSpeedValue() {
        const manual = document.getElementById('sliderSpeedManual');
        const range = document.getElementById('sliderSpeed');
        const sourceValue = manual ? manual.value : range?.value;
        return this.clampSliderSpeed(sourceValue);
    }
};

// Initialize settings when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Settings.init());
} else {
    Settings.init();
}

// Listen for system theme changes when in auto mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const settings = Settings.getStoredSettings();
    
    if (settings.theme === 'auto') {
        Settings.applyTheme('auto');
    }
});
