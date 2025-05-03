// cart-init.js - Common script for initializing cart across all pages

// Immediately execute this function to update cart count as soon as possible
(function() {
    console.log("Cart initialization script loaded and executing immediately");
    updateCartCountDisplay();
})();

// Function to update cart count (can be called from other scripts)
function updateCartCountDisplay() {
    try {
        // Get cart from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
        console.log("Cart loaded from localStorage:", cart);
        
        // Calculate total count of items
        const itemCount = cart.items.reduce((total, item) => total + (item.count || 1), 0);
        console.log("Total item count:", itemCount);
        
        // Update all cart count elements
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = itemCount;
        });
    } catch (error) {
        console.error("Error updating cart count:", error);
    }
}

// Also run when DOM is fully loaded to ensure all elements are available
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded - Initializing cart");
    
    // Update cart count again to ensure it's correct
    updateCartCountDisplay();
    
    // Add event listener to cart icon to ensure it works
    const cartBtns = document.querySelectorAll('.cart-btn');
    cartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            toggleCart();
        });
    });
    
    // Add event listener to checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            proceedToCheckout();
        });
    }
});

// Add a MutationObserver to watch for changes to the cart count elements
// This ensures the cart count is updated even if the elements are added dynamically
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if any of the added nodes are cart count elements or contain them
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && node.classList.contains('cart-count')) {
                        updateCartCountDisplay();
                    } else if (node.querySelectorAll) {
                        const cartCounts = node.querySelectorAll('.cart-count');
                        if (cartCounts.length > 0) {
                            updateCartCountDisplay();
                        }
                    }
                }
            });
        }
    });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Update cart count every second for the first 5 seconds to ensure it's correct
let updateCount = 0;
const intervalId = setInterval(function() {
    updateCartCountDisplay();
    updateCount++;
    if (updateCount >= 5) {
        clearInterval(intervalId);
    }
}, 1000);
