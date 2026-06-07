// threads-templates.js

export const threadsTemplates = {
    dashboard: `
        <div class="threads-layout">
            <!-- Sidebar for Community Boards -->
            <aside class="threads-sidebar">
                <h3>Communities</h3>
                <nav class="boards-nav">
                    <button class="board-item active" data-board="all"><i class='bx bx-globe'></i> All Threads</button>
                    <button class="board-item" data-board="general"><i class='bx bx-message-square-detail'></i> General</button>
                    <button class="board-item" data-board="tech"><i class='bx bx-laptop'></i> Tech & Coding</button>
                    <button class="board-item" data-board="gaming"><i class='bx bx-game'></i> Gaming</button>
                </nav>
            </aside>

            <!-- Central Content Stream -->
            <main class="threads-feed-window">
                <div class="feed-header">
                    <h2 id="current-board-title">All Threads</h2>
                    <button id="open-post-modal-btn" class="create-post-btn"><i class='bx bx-plus'></i> New Post</button>
                </div>

                <!-- Live Post Stream -->
                <div id="threads-post-stream" class="post-stream">
                    <p class="loading-text">Fetching active feeds...</p>
                </div>
            </main>
        </div>

        <!-- Create Post Modal Dialog Overlay -->
        <div id="create-post-modal" class="modal-overlay hidden">
            <div class="modal-card">
                <h3>Create a New Thread</h3>
                <form id="new-thread-form">
                    <div class="setting-group">
                        <label>Select Community</label>
                        <select id="post-board-target" required>
                            <option value="general">General</option>
                            <option value="tech">Tech & Coding</option>
                            <option value="gaming">Gaming</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>Thread Title</label>
                        <input type="text" id="post-title" placeholder="What's on your mind?" required>
                    </div>
                    <div class="setting-group">
                        <label>Content Body</label>
                        <textarea id="post-body" rows="5" placeholder="Share your thoughts, logs, or concepts..." required></textarea>
                    </div>
                    <div class="setting-group">
                        <label>Maturity Content Flag (For Filtering Engines)</label>
                        <select id="post-flag">
                            <option value="none">None (Safe for Everyone)</option>
                            <option value="language">Strong Language</option>
                            <option value="violence">Intense Themes / Violence</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="close-post-modal-btn" class="cancel-btn">Cancel</button>
                        <button type="submit" class="submit-post-btn">Publish Thread</button>
                    </div>
                </form>
            </div>
        </div>
    `,

    postCard: (id, post, currentUserAllowed) => {
        if (!currentUserAllowed) {
            return `
                <div class="thread-card blocked-card">
                    <p class="blocked-notice"><i class='bx bx-shield-x'></i> Content hidden by your custom safety filters</p>
                </div>
            `;
        }

        return `
            <div class="thread-card" data-id="${id}">
                <div class="vote-column">
                    <button class="vote-btn upvote-trigger" data-id="${id}"><i class='bx bx-upvote'></i></button>
                    <span class="vote-count" id="votes-${id}">${post.votes || 0}</span>
                </div>
                <div class="post-content-area">
                    <div class="post-meta">
                        <span class="board-badge">m/${post.board}</span>
                        <span class="post-author">Posted by @${post.author}</span>
                        ${post.flag !== 'none' ? `<span class="flag-badge alert">${post.flag}</span>` : ''}
                    </div>
                    <h3 class="post-card-title open-thread-trigger" data-id="${id}">${post.title}</h3>
                    <p class="post-card-preview">${post.body.substring(0, 180)}${post.body.length > 180 ? '...' : ''}</p>
                </div>
            </div>
        `;
    },

    threadDetailView: (post) => `
        <div class="thread-detail-container">
            <button id="back-to-feed-btn" class="back-feed-btn"><i class='bx bx-left-arrow-alt'></i> Back to Feed</button>
            <div class="main-post-block">
                <div class="post-meta">
                    <span class="board-badge">m/${post.board}</span>
                    <span class="post-author">Posted by @${post.author}</span>
                </div>
                <h2>${post.title}</h2>
                <p class="full-post-body">${post.body}</p>
            </div>
            
            <div class="comments-section">
                <h3>Comments</h3>
                <form id="new-comment-form">
                    <textarea id="comment-body" rows="3" placeholder="Add to the conversation..." required></textarea>
                    <button type="submit" class="submit-comment-btn">Post Comment</button>
                </form>
                <div id="comments-stream" class="comments-stream">
                    <p class="loading-text">Loading responses...</p>
                </div>
            </div>
        </div>
    `,

    commentNode: (comment) => `
        <div class="comment-card">
            <div class="comment-meta">
                <span class="comment-author">@${comment.author}</span>
                <span class="comment-time">just now</span>
            </div>
            <p class="comment-text">${comment.body}</p>
        </div>
    `
};
