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
import { renderSettingsFramework } from "./settings-handler.js";
import { renderThreadsFramework } from "./threads-handler.js";

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
    
    // Hand execution over to our custom exterior settings engine
    if (target === 'settings') {
        renderSettingsFramework();
        return;
    }

    // Hand execution over to the modular threads forum engine
    if (target === 'threads') {
        renderThreadsFramework();
        return;
    }

    // Default router behavior for standard content streams (Videos, Memes, etc.)
    const title = target.charAt(0).toUpperCase() + target.slice(1);
    contentArea.innerHTML = `
        <div id="dynamic-content">
            <h2>${title}</h2>
            <p>Welcome to the global <strong>${title}</strong> system on Myntr.</p>
        </div>
    `;
}
