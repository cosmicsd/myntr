// threads-handler.js
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { threadsTemplates } from "./threads-templates.js";

let currentActiveBoard = "all";

export async function renderThreadsFramework() {
    const contentArea = document.getElementById('content-window');
    contentArea.innerHTML = threadsTemplates.dashboard;

    initFeedNavigationListeners();
    initModalListeners();
    await loadThreadsFeed();
}

function initFeedNavigationListeners() {
    document.querySelectorAll('.board-item').forEach(btn => {
        btn.addEventListener('click', async function() {
            document.querySelectorAll('.board-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentActiveBoard = this.getAttribute('data-board');
            document.getElementById('current-board-title').innerText = this.innerText;
            await loadThreadsFeed();
        });
    });
}

function initModalListeners() {
    const modal = document.getElementById('create-post-modal');
    document.getElementById('open-post-modal-btn').addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('close-post-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));

    document.getElementById('new-thread-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return alert("You must be authenticated to open a thread.");

        // Pull user's display username from profile document
        const profileSnap = await getDoc(doc(db, "users", user.uid));
        const username = profileSnap.exists() ? profileSnap.data().username : user.email.split('@')[0];

        const newPost = {
            board: document.getElementById('post-board-target').value,
            title: document.getElementById('post-title').value.trim(),
            body: document.getElementById('post-body').value.trim(),
            flag: document.getElementById('post-flag').value,
            author: username,
            authorId: user.uid,
            votes: 0,
            createdAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "threads_posts"), newPost);
            modal.classList.add('hidden');
            document.getElementById('new-thread-form').reset();
            await loadThreadsFeed();
        } catch (err) {
            alert("Failed to publish thread: " + err.message);
        }
    });
}

async function loadThreadsFeed() {
    const stream = document.getElementById('threads-post-stream');
    stream.innerHTML = `<p class="loading-text">Scanning database layers...</p>`;

    // Check user data for customized layout safety filtering rules
    let allowedFlags = ['none'];
    let filteringTier = 'standard';
    
    if (auth.currentUser) {
        const profileSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (profileSnap.exists()) {
            const data = profileSnap.data();
            filteringTier = data.contentFilters || 'standard';
            if (filteringTier === 'custom') allowedFlags = ['none', ...(data.allowedFlags || [])];
            if (filteringTier === 'unfiltered') allowedFlags = ['none', 'language', 'violence'];
        }
    }

    try {
        const postsRef = collection(db, "threads_posts");
        let q = query(postsRef, orderBy("createdAt", "desc"));

        if (currentActiveBoard !== "all") {
            q = query(postsRef, where("board", "==", currentActiveBoard), orderBy("createdAt", "desc"));
        }

        const querySnap = await getDocs(q);
        if (querySnap.empty) {
            stream.innerHTML = `<p class="empty-notice">No active threads inside this community yet.</p>`;
            return;
        }

        stream.innerHTML = "";
        querySnap.forEach(postDoc => {
            const post = postDoc.data();
            let isAllowed = true;

            // Enforce registration filtration logic bounds
            if (filteringTier === 'strict' && post.flag !== 'none') isAllowed = false;
            if (filteringTier === 'standard' && post.flag === 'violence') isAllowed = false;
            if (filteringTier === 'custom' && !allowedFlags.includes(post.flag)) isAllowed = false;

            stream.innerHTML += threadsTemplates.postCard(postDoc.id, post, isAllowed);
        });

        bindPostActionListeners();
    } catch (err) {
        stream.innerHTML = `<p class="error-text">Engine routing error: ${err.message}</p>`;
    }
}

function bindPostActionListeners() {
    // Upvote trigger routines
    document.querySelectorAll('.upvote-trigger').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const postId = this.getAttribute('data-id');
            const counter = document.getElementById(`votes-${postId}`);
            let currentVotes = parseInt(counter.innerText);
            
            counter.innerText = currentVotes + 1; // Snappy instant local feedback
            
            const postDocRef = doc(db, "threads_posts", postId);
            await updateDoc(postDocRef, { votes: currentVotes + 1 });
        });
    });

    // Clicking an item opens the specific thread profile screen
    document.querySelectorAll('.open-thread-trigger').forEach(title => {
        title.addEventListener('click', function() {
            loadSingleThreadDetailView(this.getAttribute('data-id'));
        });
    });
}

async function loadSingleThreadDetailView(postId) {
    const contentArea = document.getElementById('content-window');
    
    const postSnap = await getDoc(doc(db, "threads_posts", postId));
    if (!postSnap.exists()) return alert("Thread missing or deleted from database registries.");
    
    const postData = postSnap.data();
    contentArea.innerHTML = threadsTemplates.threadDetailView(postData);

    // Bind comments and back button loops
    document.getElementById('back-to-feed-btn').addEventListener('click', renderThreadsFramework);
    
    await loadCommentsStream(postId);

    document.getElementById('new-comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return alert("Must sign in to leave replies.");

        const profileSnap = await getDoc(doc(db, "users", user.uid));
        const username = profileSnap.exists() ? profileSnap.data().username : user.email.split('@')[0];

        const input = document.getElementById('comment-body');
        const commentData = {
            postId: postId,
            author: username,
            authorId: user.uid,
            body: input.value.trim(),
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, "threads_comments"), commentData);
        input.value = "";
        await loadCommentsStream(postId);
    });
}

async function loadCommentsStream(postId) {
    const stream = document.getElementById('comments-stream');
    const q = query(collection(db, "threads_comments"), where("postId", "==", postId), orderBy("createdAt", "asc"));
    
    const snap = await getDocs(q);
    if (snap.empty) {
        stream.innerHTML = `<p class="empty-notice">Be the first to leave a comment!</p>`;
        return;
    }

    stream.innerHTML = "";
    snap.forEach(commentDoc => {
        stream.innerHTML += threadsTemplates.commentNode(commentDoc.data());
    });
}
