// Previous JavaScript code remains...

// Category Selection
document.querySelectorAll('.category-list li').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all items
        document.querySelectorAll('.category-list li').forEach(li => {
            li.classList.remove('active');
        });
        // Add active class to clicked item
        item.classList.add('active');
        
        // Here you would typically filter posts based on category
        const category = item.querySelector('span').textContent;
        filterPosts(category);
    });
});

function filterPosts(category) {
    // Example function to filter posts
    console.log(`Filtering posts for category: ${category}`);
    // Add your post filtering logic here
}

// Update category counts dynamically
function updateCategoryCounts() {
    const counts = {
        'All Posts': 245,
        'Questions': 82,
        'Tips & Advice': 156,
        'Success Stories': 64,
        'Home Repair': 93,
        'Renovation': 78,
        'Gardening': 45
    };

    document.querySelectorAll('.category-list li').forEach(item => {
        const category = item.querySelector('span').textContent;
        const countSpan = item.querySelector('.category-count');
        if (countSpan && counts[category]) {
            countSpan.textContent = counts[category];
        }
    });
}

// Call when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupAvatars();
    updateCategoryCounts();
}); 