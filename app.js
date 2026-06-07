// app.js
import { 
    auth, db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    doc, setDoc, getDoc 
} from "./firebase-config.js";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// --- DOM PORTAL VIEW CONTROLS ---
const welcomePortal = document.getElementById('welcome-portal');
const appDashboard = document.getElementById('app-dashboard');
const portalHome = document.getElementById('portal-home-view');
const portalLogin = document.getElementById('portal-login-view');
const portalSignup = document.getElementById('portal-signup-view');
const userActions = document.querySelector('.user-actions');

// Navigation triggers
if (document.getElementById('go-to-email-login')) {
    document.getElementById('go-to-email-login').addEventListener('click', () => switchView(portalLogin));
}
if (document.getElementById('go-to-email-signup')) {
    document.getElementById('go-to-email-signup').addEventListener('click', () => switchView(portalSignup));
}

// Handles form back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(portalHome));
});

function switchView(targetView) {
    [portalHome, portalLogin, portalSignup].forEach(v => {
        if (v) v.classList.add('hidden');
    });
    if (targetView) targetView.classList.remove('hidden');
}

// --- APP GATEWAY ENTRY CLOSURES ---
function enterPlatform(showDashboard) {
    if (showDashboard) {
        welcomePortal.classList.add('hidden');
        appDashboard.classList.remove('hidden');
    } else {
        welcomePortal.classList.remove('hidden');
        appDashboard.classList.add('hidden');
    }
}

// Guest Bypass Configuration
if (document.getElementById('continue-as-guest')) {
    document.getElementById('continue-as-guest').addEventListener('click', () => {
        enterPlatform(true);
        userActions.innerHTML = `
            <span class="username-display" style="color: #ff5555; margin-right:10px;">Guest Mode</span>
            <button class="upload-btn" id="portal-return-trigger">Sign In / Register</button>
        `;
        document.getElementById('portal-return-trigger').addEventListener('click', () => enterPlatform(false));
    });
}

// --- GOOGLE AUTHENTICATION PIPELINE ---
if (document.getElementById('google-auth-btn')) {
    document.getElementById('google-auth-btn').addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (!docSnap.exists()) {
                switchView(portalSignup);
                const emailInput = document.getElementById('signup-email');
                const userInput = document.getElementById('signup-username');
                if (emailInput) emailInput.value = user.email;
                if (userInput) userInput.value = user.displayName.replace(/\s+/g, '').toLowerCase();
            }
        } catch (error) {
            alert("Google Authentication failed: " + error.message);
        }
    });
}

// --- FIREBASE LIVE SESSION MANAGER ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        let username = user.email.split('@')[0];
        try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) {
                username = docSnap.data().username;
                enterPlatform(true);
            } else {
                enterPlatform(false);
                switchView(portalSignup);
            }
        } catch (e) {
            console.error(e);
        }

        userActions.innerHTML = `
            <span class="username-display" style="margin-right:10px;">@${username}</span>
            <button class="upload-btn" id="logout-trigger" title="Log Out">Log Out</button>
        `;
        document.getElementById('logout-trigger').addEventListener('click', () => signOut(auth));
    } else {
        enterPlatform(false);
        switchView(portalHome);
    }
});

// --- MANUAL REGISTRATION PROCESS ---
const signupForm = document.getElementById('portal-signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('signup-email').value.trim();
        const username = document.getElementById('signup-username').value.trim().toLowerCase();
        const password = document.getElementById('signup-password').value;
        const confirmPass = document.getElementById('signup-password-confirm').value;
        
        const birthday = document.getElementById('signup-birthday').value.trim();
        const decade = document.getElementById('signup-decade').value;
        const phone = document.getElementById('signup-phone').value.trim();
        const contentFilters = document.getElementById('signup-filters').value;
        const createPage = document.getElementById('signup-create-page').checked;

        if (password !== confirmPass) return alert("Passwords do not match!");

        try {
            let user = auth.currentUser;

            if (!user) {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                user = cred.user;
            }

            await setDoc(doc(db, "users", user.uid), {
                username, email, birthday, decade, contentFilters, createPage,
                phone: phone || null,
                createdAt: new Date().toISOString()
            });

            this.reset();
        } catch (error) {
            alert("Registration failed: " + error.message);
        }
    });
}

// --- CORE EMAIL LOGIN HANDLING ---
const loginForm = document.getElementById('portal-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, 
                document.getElementById('login-email').value.trim(), 
                document.getElementById('login-password').value
            );
            this.reset();
        } catch (err) {
            alert("Login processing error: " + err.message);
        }
    });
}

// --- MAIN CONTENT TAB ROUTER ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        loadContent(this.getAttribute('data-target'));
    });
});

// --- DYNAMIC CONTENT MODULE CONTROLLER ---
function loadContent(target) {
    const contentArea = document.getElementById('content-window');
    
    // If user clicked the main Settings tab, render the advanced dual-panel layout
    if (target === 'settings') {
        contentArea.innerHTML = `
            <div id="dynamic-content" class="settings-layout">
                <aside class="settings-sidebar">
                    <h3>Control Panel</h3>
                    <nav class="settings-nav">
                        <button class="set-item active" data-pane="general"><i class='bx bx-slider-alt'></i> General</button>
                        <button class="set-item" data-pane="account"><i class='bx bx-user-circle'></i> Account</button>
                        <button class="set-item" data-pane="private"><i class='bx bx-lock-alt'></i> Privacy</button>
                        <button class="set-item" data-pane="safety"><i class='bx bx-shield-quarter'></i> Safety & Filters</button>
                        <button class="set-item" data-pane="history"><i class='bx bx-history'></i> History</button>
                        <button class="set-item" data-pane="performance"><i class='bx bx-tachometer'></i> Performance</button>
                        <button class="set-item" data-pane="monetary"><i class='bx bx-wallet'></i> Monetary</button>
                        <button class="set-item" data-pane="advanced"><i class='bx bx-code-block'></i> Advanced</button>
                    </nav>
                </aside>

                <main class="settings-pane" id="settings-pane-view">
                    <div class="pane-wrapper">
                        <h2>General Settings</h2>
                        <p class="pane-desc">Manage your core interface preferences, display theme, and localized delivery targets.</p>
                        <div class="setting-row">
                            <label>Interface Language</label>
                            <select><option>English (US)</option><option>Deutsch (German)</option></select>
                        </div>
                    </div>
                </main>
            </div>
        `;

        // Bind clicks to the newly injected sub-settings buttons
        document.querySelectorAll('.set-item').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.set-item').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                switchSettingsPane(this.getAttribute('data-pane'));
            });
        });
        return;
    }

    // Default router behavior for standard content streams (Videos, Threads, etc.)
    const title = target.charAt(0).toUpperCase() + target.slice(1);
    contentArea.innerHTML = `
        <div id="dynamic-content">
            <h2>${title}</h2>
            <p>Welcome to the global <strong>${title}</strong> system on Myntr.</p>
        </div>
    `;
}

// --- SUB-SETTINGS PANE MANAGER ---
function switchSettingsPane(pane) {
    const paneView = document.getElementById('settings-pane-view');
    
    switch(pane) {
        case 'general':
            paneView.innerHTML = `
                <div class="pane-wrapper">
                    <h2>General Preferences</h2>
                    <p class="pane-desc">Manage your core interface preferences and localization targets.</p>
                    <div class="setting-row">
                        <label>Interface Language</label>
                        <select><option>English (US)</option><option>Deutsch (German)</option></select>
                    </div>
                </div>`;
            break;
            
        case 'account':
            // Custom management wrapper allowing easy developer wipe routines
            paneView.innerHTML = `
                <div class="pane-wrapper">
                    <h2>Account Management</h2>
                    <p class="pane-desc">Manage your cloud profile settings, node credentials, or permanently purge registration data.</p>
                    
                    <div class="danger-zone">
                        <h3>Danger Zone</h3>
                        <p>Purging your profile will completely clear your account records from our live database indices. This action is absolute and cannot be reversed.</p>
                        <button class="danger-btn" id="delete-profile-trigger">Purge & Remake Account</button>
                    </div>
                </div>`;
                
            // Hook up the live database delete routine
            document.getElementById('delete-profile-trigger').addEventListener('click', deleteUserAccountWorkflow);
            break;

        case 'private':
            paneView.innerHTML = `
                <div class="pane-wrapper">
                    <h2>Privacy Configuration</h2>
                    <p class="pane-desc">Adjust discoverability flags and manage access control keys for outside communication.</p>
                </div>`;
            break;

        case 'safety':
            paneView.innerHTML = `
                <div class="pane-wrapper">
                    <h2>Safety & Content Filters</h2>
                    <p class="pane-desc">Calibrate automatic media sorting algorithms and network moderation barriers.</p>
                </div>`;
            break;

        case 'history':
            paneView.innerHTML = `
                <div class="pane-wrapper">
                    <h2>Platform Activity History</h2>
                    <p class="pane-desc">Review past analytical interaction data, site queries, and interface cache timelines.</p>
                </div>`;
            break;

        case 'performance':
            paneView.innerHTML = `
                <div class="pane-wrapper">
                    <h2>Performance & Engine Metrics</h2>
                    <p class="pane-desc">Fine-tune rendering setups, asset caching protocols, and video buffer sizes.</p>
                </div>`;
            break;

        case 'monetary':
            paneView.innerHTML = `
                <div class="pane-wrapper">
                    <h2>Monetary & Wallets</h2>
                    <p class="pane-desc">Link platform tipping metrics, transaction nodes, and content balance logs.</p>
                </div>`;
            break;

        case 'advanced':
            paneView.innerHTML = `
                <div class="pane-wrapper">
                    <h2>Advanced Developer Environment</h2>
                    <p class="pane-desc">Direct hardware parameters, manual database endpoints, and core configuration testing overrides.</p>
                </div>`;
            break;
    }
}

// --- DANGER ZONE FIRESTORE PURGE WORKFLOW ---
async function deleteUserAccountWorkflow() {
    const user = auth.currentUser;
    if (!user) return alert("No active authenticated session detected.");

    const confirmation = confirm("Are you absolutely sure you want to delete your profile data? This will instantly wipe your document variables from Firestore and log you out.");
    if (!confirmation) return;

    try {
        // 1. Delete the profile variables from the live Cloud Firestore database
        // import { deleteDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js" inside config if needed, or add to your config export list
        // For standard setup, we can call it directly from your loaded database reference hook
        const { deleteDoc } = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js");
        await deleteDoc(doc(db, "users", user.uid));
        
        // 2. Erase the authentication engine node reference directly
        await user.delete();
        
        alert("Account successfully deleted from cloud infrastructure. Redirecting to onboarding...");
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            alert("Security policy override notice: To delete your root cloud record, you must have logged in very recently. Please sign out, re-authenticate, and try again immediately.");
        } else {
            alert("Cloud database purge error: " + error.message);
        }
    }
}
