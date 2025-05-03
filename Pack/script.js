
// Firebase configuration is now handled in the HTML with type="module"
// We'll access Firebase through the window object
let auth;

document.addEventListener('DOMContentLoaded', function() {
    // Firebase auth will be initialized by the module script in HTML
    // We'll wait for it to be available
    const checkFirebase = setInterval(() => {
        if (window.firebase && window.firebase.auth && window.firebase.authFunctions) {
            auth = window.firebase.auth();
            clearInterval(checkFirebase);
            // Check if user is already logged in
            updateLoginButton();
        }
    }, 100);

    // Update solution card click handlers
    document.querySelectorAll('.solution-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            window.location.href = href;
        });
    });

    // Handle browser back button
    window.addEventListener('popstate', function(e) {
        if (document.referrer.includes('index.html')) {
            window.location.href = 'index.html';
        } else {
            window.history.back();
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('.navbar');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navbar.classList.toggle('active');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.navbar ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navbar.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animate stats counter
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.stats');

    function animateStats() {
        const statsPosition = statsSection.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;

        if (statsPosition < screenPosition) {
            statNumbers.forEach(stat => {
                const target = +stat.getAttribute('data-target');
                const count = +stat.innerText;
                const increment = target / 100;

                if (count < target) {
                    stat.innerText = Math.ceil(count + increment);
                    setTimeout(animateStats, 20);
                } else {
                    stat.innerText = target;
                }
            });
        }
    }

    window.addEventListener('scroll', animateStats);

    // // Form submission
    // const quoteForm = document.getElementById('quoteForm');

    // if (quoteForm) {
    //     quoteForm.addEventListener('submit', function(e) {
    //         e.preventDefault();

    //         // Get form values
    //         const name = document.getElementById('name').value;
    //         const email = document.getElementById('email').value;
    //         const interest = document.getElementById('interest').value;

    //         // Simple validation
    //         if (!name || !email || !interest) {
    //             alert('Please fill in all required fields.');
    //             return;
    //         }

    //         // Here you would typically send the form data to a server
    //         // For this example, we'll just show a success message
    //         alert(`Thank you, ${name}! Your quote request has been received. We'll contact you soon about ${interest} packaging.`);

    //         // Reset form
    //         quoteForm.reset();
    //     });
    // }

    // Form submission with Node.js backend integration
const quoteForm = document.getElementById('quoteForm');

if (quoteForm) {
    quoteForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Show loading state
        const submitBtn = quoteForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

        // Get form values
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            interest: document.getElementById('interest').value,
            message: document.getElementById('message').value.trim()
        };

        try {
            const response = await fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Server error');

            if (result.success) {
                // Success handling
                showNotification('success', result.message);
                quoteForm.reset();

                // You could redirect or show additional UI here
                // window.location.href = '/thank-you.html';
            } else {
                // Validation errors
                if (result.errors) {
                    Object.entries(result.errors).forEach(([field, error]) => {
                        const input = document.getElementById(field);
                        input.classList.add('has-error');
                        const errorEl = document.createElement('div');
                        errorEl.className = 'error-message';
                        errorEl.textContent = error;
                        errorEl.style.color = '#e74c3c';
                        errorEl.style.marginTop = '5px';
                        errorEl.style.fontSize = '0.9rem';
                        input.parentNode.appendChild(errorEl);
                    });
                } else {
                    showNotification('error', result.message || 'Submission failed');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('error', error.message || 'There was an error submitting your form. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Helper function to show notifications
function showNotification(type, message) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    if (type === 'success') {
        notification.style.background = '#2ecc71';
    } else {
        notification.style.background = '#e74c3c';
    }

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
    // Image lazy loading
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.getAttribute('data-src');
        });
    }
});

// Login Modal
function toggleLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        // Re-enable body scrolling when modal is closed
        document.body.style.overflow = 'auto';
    } else {
        showLoginModal();
    }
}

// Toggle between login, register, and reset password forms
function toggleAuthForms(formType) {
    const forms = {
        login: document.getElementById('loginForm'),
        register: document.getElementById('registerForm'),
        reset: document.getElementById('resetForm')
    };

    // Hide all forms
    Object.values(forms).forEach(form => form.classList.remove('active'));

    // Show selected form
    forms[formType].classList.add('active');
}

// Check if phone number is registered
async function checkRegistration(phone) {
    if (!validatePhone(phone)) {
        return;
    }

    try {
        const response = await fetch('/api/auth/check-registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone })
        });

        const data = await response.json();
        const notRegisteredMessage = document.getElementById('notRegisteredMessage');
        const loginFormElement = document.getElementById('loginFormElement');

        if (!data.registered) {
            notRegisteredMessage.style.display = 'block';
            loginFormElement.style.display = 'none';
        } else {
            notRegisteredMessage.style.display = 'none';
            loginFormElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Error checking registration:', error);
    }
}

// Handle wrong password and auto-fill reset form
function handleForgotPassword() {
    const phoneNumber = document.getElementById('loginPhone').value;
    toggleAuthForms('reset');
    if (phoneNumber && validatePhone(phoneNumber)) {
        document.getElementById('resetPhone').value = phoneNumber;
    }
}

// Handle login submission
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Clear previous errors
    clearError('loginEmail');
    clearError('loginPassword');

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    try {
        // Sign in with Firebase using the exposed authFunctions
        const auth = firebase.auth();
        const signInWithEmailAndPassword = firebase.authFunctions.signInWithEmailAndPassword;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("Login successful:", user);

        // Store user info in localStorage for persistence
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName || user.email.split('@')[0]);

        // Update UI
        updateLoginButton();
        toggleLoginModal();

        // Show success notification
        showNotification('success', 'Login successful!');

        // Check for intended destination
        const intendedDestination = localStorage.getItem('intendedDestination');
        if (intendedDestination) {
            localStorage.removeItem('intendedDestination');
            window.location.href = intendedDestination;
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'auth/user-not-found') {
            showError('loginEmail', 'Email not registered. Please create an account.');
            document.getElementById('notRegisteredMessage').style.display = 'block';
            document.getElementById('loginFormElement').style.display = 'none';
        } else if (error.code === 'auth/wrong-password') {
            showError('loginPassword', 'Invalid password. <a href="#" onclick="handleForgotPassword()">Reset password?</a>');
        } else {
            showError('loginPassword', error.message);
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous errors
    clearError('registerName');
    clearError('registerEmail');
    clearError('registerPassword');
    clearError('confirmPassword');

    // Validate password match
    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        return;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

    try {
        // Create user with Firebase using the exposed authFunctions
        const auth = firebase.auth();
        const createUserWithEmailAndPassword = firebase.authFunctions.createUserWithEmailAndPassword;
        const updateProfile = firebase.authFunctions.updateProfile;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with name
        await updateProfile(user, {
            displayName: name
        });

        // Store user info in localStorage
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', name);

        // Show success notification
        showNotification('success', 'Registration successful! You are now logged in.');

        // Update UI
        updateLoginButton();
        toggleLoginModal();

        // Check for intended destination
        const intendedDestination = localStorage.getItem('intendedDestination');
        if (intendedDestination) {
            localStorage.removeItem('intendedDestination');
            window.location.href = intendedDestination;
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'auth/email-already-in-use') {
            showError('registerEmail', 'Email already in use. Please login instead.');
        } else {
            showError('registerEmail', error.message);
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

// Handle password reset request
async function handlePasswordReset(event) {
    event.preventDefault();

    const email = document.getElementById('resetEmail').value;

    // Clear previous errors
    clearError('resetEmail');

    try {
        const auth = firebase.auth();
        const sendPasswordResetEmail = firebase.authFunctions.sendPasswordResetEmail;
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent. Please check your inbox.');
        toggleAuthForms('login');
    } catch (error) {
        console.error('Password reset error:', error);
        showError('resetEmail', error.message);
    }
}

// Utility functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId + 'Error');
    const inputElement = document.getElementById(elementId);
    if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        inputElement.classList.add('error');
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId + 'Error');
    const inputElement = document.getElementById(elementId);
    if (errorElement && inputElement) {
        errorElement.classList.remove('show');
        inputElement.classList.remove('error');
    }
}

function clearErrors() {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
        const errorDiv = group.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    });
}

// Cart functionality
function toggleCart() {
    const cart = document.getElementById('cartSidebar');
    const isOpening = !cart.classList.contains('active');

    cart.classList.toggle('active');

    // If we're opening the cart, render the items
    if (isOpening) {
        renderCartItems();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        toggleLoginModal();
    }
}

// Add to cart functionality - Fixed version
function addToCart(product) {
    console.log("Adding to cart:", product);

    // Ensure product has all required properties
    if (!product.id || !product.name || !product.price) {
        console.error("Invalid product object:", product);
        showNotification('error', 'Invalid product data');
        return;
    }

    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Update existing item
        cart.items[existingItemIndex].count = (cart.items[existingItemIndex].count || 1) + 1;
    } else {
        // Add new item with count property
        product.count = 1;
        cart.items.push(product);
    }

    // Recalculate total
    cart.total = cart.items.reduce((total, item) => {
        return total + (item.price * (item.count || 1));
    }, 0);

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log("Cart saved to localStorage:", cart);

    // Update cart count in header
    updateCartCount(cart);

    // Also call the global updateCartCountDisplay function if it exists
    try {
        if (typeof updateCartCountDisplay === 'function') {
            console.log("Calling updateCartCountDisplay from addToCart");
            updateCartCountDisplay();
        }
    } catch (error) {
        console.error("Error calling updateCartCountDisplay:", error);
    }

    // Update cart items if cart is open
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar && cartSidebar.classList.contains('active')) {
        renderCartItems();
    }

    // Show success notification
    showNotification('success', `${product.name} added to cart`);

    // Animate cart icon
    animateCartIcon();
}

// Quick Add to Cart - Specifically for front page
function quickAddToCart(product, e) {
    console.log("Quick adding to cart:", product);

    // Ensure we have an event object and stop propagation
    if (e) {
        e.stopPropagation();
    } else if (typeof event !== 'undefined') {
        // Fallback for older browsers
        event.stopPropagation();
    }

    // Ensure product has all required properties
    if (!product.id || !product.name || !product.price) {
        console.error("Invalid product object:", product);
        showNotification('error', 'Invalid product data');
        return false;
    }

    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Update existing item
        cart.items[existingItemIndex].count = (cart.items[existingItemIndex].count || 1) + 1;
    } else {
        // Add new item with count property
        product.count = 1;
        cart.items.push(product);
    }

    // Recalculate total
    cart.total = cart.items.reduce((total, item) => {
        return total + (item.price * (item.count || 1));
    }, 0);

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log("Cart saved to localStorage:", cart);

    // Update cart count in header
    updateCartCount(cart);

    // Also call the global updateCartCountDisplay function if it exists
    try {
        if (typeof updateCartCountDisplay === 'function') {
            console.log("Calling updateCartCountDisplay from quickAddToCart");
            updateCartCountDisplay();
        }
    } catch (error) {
        console.error("Error calling updateCartCountDisplay:", error);
    }

    // Update cart items if cart is open
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar && cartSidebar.classList.contains('active')) {
        renderCartItems();
    }

    // Show success notification
    showNotification('success', `${product.name} added to cart`);

    // Animate cart icon
    animateCartIcon();

    // Prevent default behavior and stop propagation
    return false;
}

// Animate cart icon
function animateCartIcon() {
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(count => {
        count.classList.add('pulse');
        setTimeout(() => {
            count.classList.remove('pulse');
        }, 500);
    });
}

// Show notification - Enhanced version
function showNotification(type, message) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    if (type === 'success') {
        notification.style.background = '#2ecc71';
    } else {
        notification.style.background = '#e74c3c';
    }

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateCartTotal() {
    const cartItems = document.querySelectorAll('.cart-item');
    let total = 0;

    cartItems.forEach(item => {
        const priceText = item.querySelector('.item-details p').textContent;
        const price = parseFloat(priceText.replace('₹', '').replace(/,/g, ''));
        total += price;
    });

    // Update total with Indian Rupee format
    document.getElementById('cartTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
}

// Legacy removeFromCart function for backward compatibility
function removeFromCartLegacy(button) {
    // Find the product ID from the button's parent element
    const cartItem = button.closest('.cart-item');
    if (!cartItem) return;

    // Extract product ID from the remove button's onclick attribute
    const removeBtn = cartItem.querySelector('.remove-btn');
    if (removeBtn) {
        const onclickAttr = removeBtn.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/removeFromCart\('([^']+)'\)/);
            if (match && match[1]) {
                removeFromCart(match[1]);
                return;
            }
        }
    }

    // Fallback to old behavior if we can't find the product ID
    cartItem.remove();

    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = parseInt(cartCount.textContent) - 1;
    }

    updateCartTotal();
}

// Smooth scroll to categories
document.querySelectorAll('.category-nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        targetSection.scrollIntoView({
            behavior: 'smooth'
        });

        // Update active state
        document.querySelectorAll('.category-nav a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');
    });
});

// Optional: Add visual feedback for double-click
foodBeverageCard.addEventListener('mousedown', function() {
    this.style.transform = 'scale(0.98)';
});

foodBeverageCard.addEventListener('mouseup', function() {
    this.style.transform = '';
});

// Example usage:
// addToCart({ name: "Eco-friendly Box", price: 1499.99 });

// Check if user is logged in
function isUserLoggedIn() {
    // First try Firebase auth
    try {
        const auth = firebase.auth();
        if (auth.currentUser !== null) {
            return true;
        }
    } catch (error) {
        console.error("Error checking Firebase auth:", error);
    }

    // Fallback to localStorage
    const storedUserEmail = localStorage.getItem('userEmail');
    return storedUserEmail !== null;
}

// Handle navigation to product pages
function handleProductNavigation(url) {
    if (isUserLoggedIn()) {
        window.location.href = url;
    } else {
        showLoginModal(url);
    }
}

// Show login modal with destination
function showLoginModal(destination = null) {
    const modal = document.getElementById('loginModal');
    if (!modal) {
        console.error("Login modal not found");
        return;
    }

    const userInfoSection = document.getElementById('userInfoSection');
    const loginForm = document.getElementById('loginForm');

    // Reset any previous form state
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const notRegisteredMessage = document.getElementById('notRegisteredMessage');
    const loginFormElement = document.getElementById('loginFormElement');

    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
    if (notRegisteredMessage) notRegisteredMessage.style.display = 'none';
    if (loginFormElement) loginFormElement.style.display = 'block';

    // Clear any previous errors
    clearErrors();

    // Check if user is logged in (either via Firebase or localStorage)
    let isLoggedIn = false;
    let displayName = null;
    let userEmail = null;

    // Try Firebase first
    try {
        const auth = firebase.auth();
        if (auth.currentUser) {
            isLoggedIn = true;
            const user = auth.currentUser;
            displayName = user.displayName || user.email.split('@')[0];
            userEmail = user.email;
        }
    } catch (error) {
        console.error("Error checking Firebase auth:", error);
    }

    // If not logged in via Firebase, check localStorage
    if (!isLoggedIn) {
        const storedUserName = localStorage.getItem('userName');
        const storedUserEmail = localStorage.getItem('userEmail');

        if (storedUserEmail) {
            isLoggedIn = true;
            displayName = storedUserName || storedUserEmail.split('@')[0];
            userEmail = storedUserEmail;
        }
    }

    if (isLoggedIn) {
        if (userInfoSection) userInfoSection.style.display = 'block';
        if (loginForm) loginForm.style.display = 'none';

        const userEmailDisplay = document.getElementById('userEmailDisplay');
        if (userEmailDisplay) {
            userEmailDisplay.textContent = displayName || userEmail;
        }
    } else {
        if (userInfoSection) userInfoSection.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
    }

    modal.style.display = 'block';
    if (destination) {
        localStorage.setItem('intendedDestination', destination);
    }

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Add logout functionality
function handleLogout() {
    // Clear localStorage user data
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');

    // Also sign out from Firebase
    try {
        const auth = firebase.auth();
        const signOut = firebase.authFunctions.signOut;

        signOut(auth).then(() => {
            console.log("Firebase signout successful");
        }).catch((error) => {
            console.error('Firebase logout error:', error);
        });
    } catch (error) {
        console.error('Error during Firebase logout:', error);
    }

    // Update UI regardless of Firebase signout success
    updateLoginButton();
    toggleLoginModal();

    // Redirect to home page if not already there
    if (!window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }

    // Show notification
    showNotification('success', 'You have been logged out successfully');
}

// Update the login button display based on login status
function updateLoginButton() {
    console.log("Updating login button");
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) {
        console.error("Login button not found");
        return;
    }

    // Try to get current user from Firebase
    let isLoggedIn = false;
    let displayName = null;

    try {
        const auth = firebase.auth();
        const currentUser = auth.currentUser;

        if (currentUser) {
            isLoggedIn = true;
            displayName = currentUser.displayName || currentUser.email.split('@')[0];
            console.log("User logged in via Firebase:", displayName);
        }
    } catch (error) {
        console.error("Error checking Firebase auth:", error);
    }

    // If not logged in via Firebase, check localStorage as fallback
    if (!isLoggedIn) {
        const storedUserName = localStorage.getItem('userName');
        const storedUserEmail = localStorage.getItem('userEmail');

        if (storedUserName || storedUserEmail) {
            isLoggedIn = true;
            displayName = storedUserName || (storedUserEmail ? storedUserEmail.split('@')[0] : null);
            console.log("User logged in via localStorage:", displayName);
        }
    }

    if (isLoggedIn && displayName) {
        loginBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>${displayName}</span>
        `;
        loginBtn.classList.add('logged-in');
    } else {
        loginBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Login</span>
        `;
        loginBtn.classList.remove('logged-in');
    }
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded - Initializing cart");

    // Initialize cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
    console.log("Cart loaded from localStorage:", cart);

    // Update cart count
    updateCartCount(cart);

    // Render cart items if cart sidebar exists
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        renderCartItems();
    }

    // Update login button
    updateLoginButton();

    // Handle input formatting for phone numbers
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove any non-digit characters
            this.value = this.value.replace(/\D/g, '');

            // Limit to 10 digits
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        });
    });
});

// Update cart count in the header
function updateCartCount(cart) {
    console.log("Updating cart count with:", cart);
    const cartCountElements = document.querySelectorAll('.cart-count');
    if (!cart || !cart.items) {
        console.error("Invalid cart object:", cart);
        return;
    }

    // Calculate total count of items
    const itemCount = cart.items.reduce((total, item) => total + (item.count || 1), 0);
    console.log("Total item count:", itemCount);

    // Update all cart count elements
    cartCountElements.forEach(element => {
        element.textContent = itemCount;
    });
}

// Render cart items in the sidebar
function renderCartItems() {
    console.log("Rendering cart items");

    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.getElementById('cartTotal');

    if (!cartItemsContainer || !cartTotalElement) {
        console.error("Cart elements not found");
        return;
    }

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
    console.log("Cart from localStorage:", cart);

    // Clear current items
    cartItemsContainer.innerHTML = '';

    if (!cart.items || cart.items.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotalElement.textContent = '₹0.00';
        return;
    }

    // Add each item to the cart
    cart.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';

        const itemCount = item.count || 1;

        itemElement.innerHTML = `
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price.toLocaleString('en-IN')} × ${itemCount}</p>
            </div>
            <div class="item-actions">
                <div class="quantity-controls">
                    <button onclick="updateCartItemQuantity('${item.id}', ${itemCount - 1})">-</button>
                    <span>${itemCount}</span>
                    <button onclick="updateCartItemQuantity('${item.id}', ${itemCount + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        cartItemsContainer.appendChild(itemElement);
    });

    // Update total
    cartTotalElement.textContent = `₹${cart.total.toLocaleString('en-IN')}`;
}

// Update cart item quantity
function updateCartItemQuantity(productId, newQuantity) {
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };

    // Find the item
    const itemIndex = cart.items.findIndex(item => item.id === productId);

    if (itemIndex === -1) {
        console.error("Item not found in cart:", productId);
        return;
    }

    if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        removeFromCart(productId);
    } else {
        // Update quantity
        cart.items[itemIndex].count = newQuantity;

        // Recalculate total
        cart.total = cart.items.reduce((total, item) => {
            return total + (item.price * (item.count || 1));
        }, 0);

        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update UI
        updateCartCount(cart);
        renderCartItems();
    }
}

// Remove from cart
function removeFromCart(productId) {
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };

    // Remove the item
    cart.items = cart.items.filter(item => item.id !== productId);

    // Recalculate total
    cart.total = cart.items.reduce((total, item) => {
        return total + (item.price * (item.count || 1));
    }, 0);

    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update UI
    updateCartCount(cart);
    renderCartItems();

    // Show notification
    showNotification('success', 'Item removed from cart');
}

// Initialize Firebase and checkout button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing auth and checkout button");

    // Add event listener to checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            proceedToCheckout();
        });
    }

    // Check if Firebase auth is available
    const checkFirebase = setInterval(() => {
        if (window.firebase && window.firebase.auth && window.firebase.authFunctions) {
            clearInterval(checkFirebase);
            console.log("Firebase auth available, updating login button");

            // Check for auth state change
            const auth = firebase.auth();
            auth.onAuthStateChanged(function(user) {
                console.log("Auth state changed:", user ? "User logged in" : "User logged out");
                updateLoginButton();
            });

            // Also update immediately
            updateLoginButton();
        }
    }, 100);

    // Even if Firebase isn't available yet, try to update login button with localStorage data
    updateLoginButton();
});

// Function to proceed to checkout
function proceedToCheckout() {
    // Check if user is logged in
    if (isUserLoggedIn()) {
        window.location.href = 'checkout.html';
    } else {
        // Store intended destination
        localStorage.setItem('intendedDestination', 'checkout.html');
        // Show login modal
        showLoginModal();
    }
}
