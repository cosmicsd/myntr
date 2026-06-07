
// settings-handler.js
import { db, auth } from "./firebase-config.js";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { settingsPanes } from "./settings-panes.js";

export async function renderSettingsFramework() {
    const contentArea = document.getElementById('content-window');
    
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
            <main class="settings-pane" id="settings-pane-view"></main>
        </div>
    `;

    // Hook up sub-panel navigation links
    document.querySelectorAll('.set-item').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.set-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadPaneData(this.getAttribute('data-pane'));
        });
    });

    // Default to loading General first
    await loadPaneData('general');
}

async function loadPaneData(paneName) {
    const paneView = document.getElementById('settings-pane-view');
    const user = auth.currentUser;
    
    if (!user) {
        paneView.innerHTML = `<p>Please log in to modify adjustments.</p>`;
        return;
    }

    // Fetch the latest profile values straight from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    const profileData = userSnap.exists() ? userSnap.data() : {};

    // Render templates depending on whether they need dynamic data injected
    if (paneName === 'account') {
        paneView.innerHTML = settingsPanes.account(user, profileData);
        initAccountListeners(userDocRef, profileData.username);
    } else if (paneName === 'safety') {
        paneView.innerHTML = settingsPanes.safety(profileData);
        initSafetyListeners(userDocRef);
    } else {
        paneView.innerHTML = settingsPanes[paneName];
    }
}

// --- SECURE UNIQUE USERNAME & DATA UPDATER ---
function initAccountListeners(userDocRef, currentUsername) {
    const usernameInput = document.getElementById('update-username');
    const statusText = document.getElementById('username-status');
    let delayTimer;

    if (!usernameInput) return;

    // Real-time username availability lookup
    usernameInput.addEventListener('input', () => {
        clearTimeout(delayTimer);
        const targetName = usernameInput.value.trim().toLowerCase();
        
        if (targetName === currentUsername.toLowerCase()) {
            statusText.innerText = "Current username matches.";
            statusText.style.color = "var(--text-dim)";
            return;
        }

        if (targetName.length < 3) {
            statusText.innerText = "Username too short.";
            statusText.style.color = "#ff5555";
            return;
        }

        statusText.innerText = "Checking availability...";
        statusText.style.color = "var(--text-dim)";

        delayTimer = setTimeout(async () => {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", targetName));
            const querySnap = await getDocs(q);

            if (!querySnap.empty) {
                statusText.innerText = "❌ Handle is already taken.";
                statusText.style.color = "#ff5555";
            } else {
                statusText.innerText = "✔ Handle is completely available!";
                statusText.style.color = "var(--accent-mint)";
            }
        }, 500); // 500ms debounce prevents hammering the API on every single keystroke
    });

    // Form submission processing
    document.getElementById('update-account-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nextUsername = usernameInput.value.trim().toLowerCase();
        
        // Final sanity verification check to prevent hijacking an active username
        if (nextUsername !== currentUsername.toLowerCase()) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", nextUsername));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) return alert("Cannot update: Username is taken.");
        }

        try {
            await updateDoc(userDocRef, {
                username: nextUsername,
                phone: document.getElementById('update-phone').value.trim() || null,
                birthday: document.getElementById('update-birthday').value.trim() || null
            });
            alert("Profile metadata updated successfully!");
            loadPaneData('account');
        } catch (err) {
            alert("Update failed: " + err.message);
        }
    });

    // Mock 2FA Checkbox state toggle updater
    document.getElementById('setting-2fa').addEventListener('change', async function() {
        await updateDoc(userDocRef, { twoFactorEnabled: this.checked });
    });

    // Re-hook the profile trigger workflow inside account pane
    const delTrigger = document.getElementById('delete-profile-trigger');
    if (delTrigger) {
        delTrigger.addEventListener('click', deleteUserAccountWorkflow);
    }
}

// --- SAFETY CONTROLS LISTENERS ---
function initSafetyListeners(userDocRef) {
    const filterSelect = document.getElementById('setting-filters');
    const customFlagsArea = document.getElementById('custom-filter-flags');

    if (!filterSelect) return;

    // Dynamic dropdown checking to toggle Custom checkboxes block view states
    filterSelect.addEventListener('change', () => {
        if (filterSelect.value === 'custom') {
            customFlagsArea.classList.remove('hidden');
        } else {
            customFlagsArea.classList.add('hidden');
        }
    });

    document.getElementById('save-safety-btn').addEventListener('click', async () => {
        const selectedFlags = [];
        if (filterSelect.value === 'custom') {
            if (document.getElementById('flag-violence').checked) selectedFlags.push('violence');
            if (document.getElementById('flag-language').checked) selectedFlags.push('language');
            if (document.getElementById('flag-suggestive').checked) selectedFlags.push('suggestive');
        }

        try {
            await updateDoc(userDocRef, {
                contentFilters: filterSelect.value,
                allowedFlags: selectedFlags,
                blocklist: document.getElementById('setting-blocklist').value.trim()
            });
            alert("Safety filtering criteria updated successfully!");
        } catch (err) {
            alert("Saving failed: " + err.message);
        }
    });
}

// --- DANGER ZONE FIRESTORE PURGE WORKFLOW ---
async function deleteUserAccountWorkflow() {
    const user = auth.currentUser;
    if (!user) return alert("No active authenticated session detected.");

    const confirmation = confirm("Are you absolutely sure you want to delete your profile data? This will instantly wipe your document variables from Firestore and log you out.");
    if (!confirmation) return;

    try {
        const { deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js");
        await deleteDoc(doc(db, "users", user.uid));
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
