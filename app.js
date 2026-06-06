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
