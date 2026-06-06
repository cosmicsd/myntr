// Quick setup to make the tabs change content dynamically
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all tabs
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        const target = this.getAttribute('data-target');
        loadContent(target);
    });
});

// Basic Content Router
function loadContent(target) {
    const contentArea = document.getElementById('dynamic-content');
    
    // Capitalize target string for title
    const title = target.charAt(0).toUpperCase() + target.slice(1);
    
    // Temporary structure to show switching works. We will build these out!
    contentArea.innerHTML = `
        <h2>${title} Area</h2>
        <p>This is where the user interface for the <strong>${title}</strong> system will live.</p>
    `;
}
// --- MYNTR AUTHENTICATION CORE ---

// DOM Elements
const authModal = document.getElementById('auth-modal');
const profileAvatar = document.querySelector('.user-actions');
const closeAuth = document.getElementById('close-auth');
const switchSignUp = document.getElementById('switch-to-signup');
const switchLogin = document.getElementById('switch-to-login');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');

// Track currently logged-in state
let currentUser = JSON.parse(localStorage.getItem('myntr_user')) || null;

// Initialize state UI on app boot
function initUserSession() {
    if (currentUser) {
        // Replace create/avatar cluster with profile experience
        profileAvatar.innerHTML = `
            <span class="username-display">@${currentUser.username}</span>
            <div class="profile-avatar" style="background: var(--accent-mint); cursor:pointer;" id="logout-trigger" title="Log Out"></div>
        `;
        // Attach logout event
        document.getElementById('logout-trigger').addEventListener('click', logOutUser);
    } else {
        // Fallback to anonymous layout
        profileAvatar.innerHTML = `
            <button class="upload-btn" id="login-trigger">Log In / Sign Up</button>
        `;
        document.getElementById('login-trigger').addEventListener('click', () => {
            authModal.classList.add('active');
        });
    }
}

// Modal View Swapping Controls
switchSignUp.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
});

switchLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
});

closeAuth.addEventListener('click', () => {
    authModal.classList.remove('active');
});

// Forms Sign-Up Handling Logic
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    
    // Save credentials locally as mock system
    const userData = { username, email };
    localStorage.setItem('myntr_user', JSON.stringify(userData));
    currentUser = userData;
    
    authModal.classList.remove('active');
    initUserSession();
});

// Forms Login Handling Logic
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    
    // Pull simple alias username out of email sequence for mock presentation
    const parsedUsername = email.split('@')[0];
    const userData = { username: parsedUsername, email: email };
    
    localStorage.setItem('myntr_user', JSON.stringify(userData));
    currentUser = userData;
    
    authModal.classList.remove('active');
    initUserSession();
});

function logOutUser() {
    localStorage.removeItem('myntr_user');
    currentUser = null;
    initUserSession();
}

// Run immediately on file execution
initUserSession();
