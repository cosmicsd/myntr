// settings-panes.js


export const settingsPanes = {
    general: `
        <div class="pane-wrapper">
            <h2>General Preferences</h2>
            <p class="pane-desc">Manage your core interface preferences and localization targets.</p>
            <div class="setting-group">
                <label>Interface Theme</label>
                <select id="setting-theme">
                    <option value="deep-dark">Deep Dark</option>
                    <option value="slate">Slate Black</option>
                    <option value="amoled">AMOLED Pitch Black</option>
                    <option value="mint">High Contrast Mint</option>
                </select>
            </div>
            <div class="setting-group">
                <label>Interface Language</label>
                <select id="setting-lang">
                    <option value="en">English (US)</option>
                    <option value="de">Deutsch (German)</option>
                </select>
            </div>
            <div class="setting-group checkbox-container">
                <input type="checkbox" id="setting-autoplay">
                <label for="setting-autoplay">Autoplay videos and clips automatically</label>
            </div>
        </div>
    `,
    
    account: (user, profileData) => `
        <div class="pane-wrapper">
            <h2>Account Details</h2>
            <p class="pane-desc">Update your live registration profile credentials. Changes sync instantly to Firestore.</p>
            
            <form id="update-account-form">
                <div class="setting-group">
                    <label>Username (Unique)</label>
                    <input type="text" id="update-username" value="${profileData.username || ''}" required>
                    <small id="username-status" style="color: var(--text-dim); display:block; margin-top:4px;"></small>
                </div>
                <div class="setting-group">
                    <label>Email Address</label>
                    <input type="email" id="update-email" value="${user.email}" disabled title="Email modification requires re-authentication protocols.">
                </div>
                <div class="form-row">
                    <div class="setting-group">
                        <label>Phone Number</label>
                        <input type="tel" id="update-phone" value="${profileData.phone || ''}">
                    </div>
                    <div class="setting-group">
                        <label>Birthdate</label>
                        <input type="text" id="update-birthday" value="${profileData.birthday || ''}">
                    </div>
                </div>
                <button type="submit" class="save-settings-btn">Save Profile Changes</button>
            </form>

            <div class="settings-divider"></div>

            <h2>Security Options</h2>
            <div class="setting-group checkbox-container">
                <input type="checkbox" id="setting-2fa" ${profileData.twoFactorEnabled ? 'checked' : ''}>
                <label for="setting-2fa">Enable Multi-Factor Authentication (MFA Prompt on Login)</label>
            </div>

            <div class="danger-zone">
                <h3>Danger Zone</h3>
                <p>Purging your profile will completely clear your account records from our live database indices. This action is absolute and cannot be reversed.</p>
                <button class="danger-btn" id="delete-profile-trigger">Purge & Remake Account</button>
            </div>
        </div>
    `,

    private: `
        <div class="pane-wrapper">
            <h2>Privacy Configuration</h2>
            <p class="pane-desc">Adjust discoverability flags and manage access control keys.</p>
            <div class="setting-group checkbox-container">
                <input type="checkbox" id="privacy-mode">
                <label for="privacy-mode">Private Profile (Only accepted friends can view your threads/memes)</label>
            </div>
            <div class="setting-group checkbox-container">
                <input type="checkbox" id="status-mode">
                <label for="status-mode">Show Active Online Status</label>
            </div>
        </div>
    `,

    safety: (profileData) => {
        const currentFilter = profileData.contentFilters || 'standard';
        return `
        <div class="pane-wrapper">
            <h2>Safety & Content Filters</h2>
            <p class="pane-desc">Calibrate automatic media sorting algorithms and maturity level barriers.</p>
            
            <div class="setting-group">
                <label>Content Filtering Tier</label>
                <select id="setting-filters">
                    <option value="standard" ${currentFilter === 'standard' ? 'selected' : ''}>Standard Filters</option>
                    <option value="strict" ${currentFilter === 'strict' ? 'selected' : ''}>Strict Filters</option>
                    <option value="unfiltered" ${currentFilter === 'unfiltered' ? 'selected' : ''}>Content Unfiltered</option>
                    <option value="custom" ${currentFilter === 'custom' ? 'selected' : ''}>Custom (Manual Flag Selection)</option>
                </select>
            </div>

            <div id="custom-filter-flags" class="${currentFilter === 'custom' ? '' : 'hidden'}" style="margin-top: 1.5rem; padding-left: 1rem; border-left: 2px solid var(--accent-mint);">
                <p style="font-size: 0.9rem; margin-bottom: 1px; color: var(--accent-mint);">Allowed Content Flags:</p>
                <div class="setting-group checkbox-container">
                    <input type="checkbox" id="flag-violence" ${(profileData.allowedFlags?.includes('violence')) ? 'checked' : ''}>
                    <label for="flag-violence">Maturity: Intense Action / Violence</label>
                </div>
                <div class="setting-group checkbox-container">
                    <input type="checkbox" id="flag-language" ${(profileData.allowedFlags?.includes('language')) ? 'checked' : ''}>
                    <label for="flag-language">Maturity: Strong Language</label>
                </div>
                <div class="setting-group checkbox-container">
                    <input type="checkbox" id="flag-suggestive" ${(profileData.allowedFlags?.includes('suggestive')) ? 'checked' : ''}>
                    <label for="flag-suggestive">Maturity: Suggestive Themes</label>
                </div>
            </div>

            <div class="setting-group" style="margin-top:1.5rem;">
                <label>Custom Keyword Blocklist</label>
                <input type="text" id="setting-blocklist" placeholder="comma, separated, words, to, block" value="${profileData.blocklist || ''}">
            </div>
            <button id="save-safety-btn" class="save-settings-btn" style="margin-top:1.5rem;">Save Safety Settings</button>
        </div>
    `},

    history: `
        <div class="pane-wrapper">
            <h2>Platform Activity History</h2>
            <p class="pane-desc">Review past analytical interaction data, site queries, and interface cache timelines.</p>
            <button class="upload-btn" style="border-color: #ff5555; color: #ff5555;">Clear Video Watch History</button>
        </div>
    `,

    performance: `
        <div class="pane-wrapper">
            <h2>Performance Metrics</h2>
            <p class="pane-desc">Fine-tune rendering setups, asset caching protocols, and video buffer sizes.</p>
        </div>
    `,

    monetary: `
        <div class="pane-wrapper">
            <h2>Monetary & Creator Wallets</h2>
            <p class="pane-desc">Link platform tipping metrics, transaction nodes, and content balance logs.</p>
        </div>
    `,

    advanced: `
        <div class="pane-wrapper">
            <h2>Advanced Developer Environment</h2>
            <p class="pane-desc">Direct hardware parameters, manual database endpoints, and core configuration testing overrides.</p>
        </div>
    `
};
