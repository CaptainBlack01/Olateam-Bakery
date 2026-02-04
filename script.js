document.addEventListener('DOMContentLoaded', () => {
    console.log('Olateam Bakery Initialized');

    // Modal Logic
    const modal = document.getElementById('orderModal');
    const openBtn = document.getElementById('openModal');
    const closeBtn = document.querySelector('.close-btn');

    openBtn.onclick = () => modal.classList.add('active');
    closeBtn.onclick = () => modal.classList.remove('active');
    window.onclick = (e) => {
        if (e.target == modal) modal.classList.remove('active');
    };

    // Real-time Validation
    const form = document.getElementById('orderForm');
    const inputs = form.querySelectorAll('input, select');

    const validators = {
        fullName: (val) => val.length >= 3,
        email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        product: (val) => val !== ''
    };

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
        });

        // Also validate on blur
        input.addEventListener('blur', () => {
            validateInput(input);
        });
    });

    function validateInput(input) {
        const id = input.id;
        const group = input.parentElement;
        const isValid = validators[id](input.value);

        if (isValid) {
            group.classList.remove('invalid');
            group.classList.add('valid');
        } else {
            group.classList.remove('valid');
            group.classList.add('invalid');
        }
        return isValid;
    }

    form.onsubmit = (e) => {
        e.preventDefault();
        let isFormValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) isFormValid = false;
        });
        if (isFormValid) {
            alert('Order placed successfully! 🥖');
            form.reset();
            inputs.forEach(input => input.parentElement.classList.remove('valid'));
            modal.classList.remove('active');
        }
    };

    // Carousel Logic
    const carousel = document.querySelector('.carousel');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');

    if (carousel && prevBtn && nextBtn) {
        let scrollAmount = 0;
        const step = 300;

        nextBtn.onclick = () => {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            scrollAmount = Math.min(scrollAmount + step, maxScroll);
            carousel.scrollTo({
                top: 0,
                left: scrollAmount,
                behavior: 'smooth'
            });
        };

        prevBtn.onclick = () => {
            scrollAmount = Math.max(scrollAmount - step, 0);
            carousel.scrollTo({
                top: 0,
                left: scrollAmount,
                behavior: 'smooth'
            });
        };
    }

    // Mobile Menu Toggle
    const header = document.querySelector('.header');
    const nav = document.querySelector('.nav');
    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-toggle icon-btn';
    menuBtn.innerHTML = '<i data-lucide="menu"></i>';
    menuBtn.style.display = 'none'; // Initially hidden

    if (header && nav) {
        header.insertBefore(menuBtn, nav);
        lucide.createIcons();
    }

    menuBtn.onclick = () => {
        nav.classList.toggle('active');
        menuBtn.innerHTML = nav.classList.contains('active')
            ? '<i data-lucide="x"></i>'
            : '<i data-lucide="menu"></i>';
        lucide.createIcons();
    };

    // Shopping Cart System
    const cartBtn = document.querySelector('[aria-label="Cart"]');
    const addBtns = document.querySelectorAll('.add-to-cart-btn');

    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('olateamCart')) || [];

    // Create cart sidebar HTML
    const cartHTML = `
        <div class="cart-overlay"></div>
        <div class="cart-sidebar">
            <div class="cart-header">
                <h2>Your Basket</h2>
                <button class="cart-close"><i data-lucide="x"></i></button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span class="cart-total-label">Total</span>
                    <span class="cart-total-amount">$0.00</span>
                </div>
                <button class="cta-btn primary full-width">Checkout</button>
            </div>
        </div>
    `;

    // Add cart to DOM
    document.body.insertAdjacentHTML('beforeend', cartHTML);

    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartClose = document.querySelector('.cart-close');
    const cartItemsContainer = document.querySelector('.cart-items');

    // Toggle cart
    if (cartBtn) {
        cartBtn.onclick = () => {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        };
    }

    cartClose.onclick = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    cartOverlay.onclick = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    // Add to cart functionality
    addBtns.forEach(btn => {
        btn.onclick = () => {
            const item = btn.closest('.collection-item');
            const productData = {
                id: Date.now().toString(),
                name: item.querySelector('.item-name').textContent,
                price: parseFloat(item.querySelector('.item-price').textContent.replace('$', '')),
                category: item.querySelector('.category').textContent,
                image: item.querySelector('img').src,
                quantity: 1
            };

            // Check if item already in cart
            const existingItem = cart.find(i => i.name === productData.name);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push(productData);
            }

            saveCart();
            renderCart();
            updateCartBadge();

            // Visual feedback
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check"></i> Added';
            btn.style.background = 'var(--accent-sage)';
            btn.style.color = '#fff';
            lucide.createIcons();

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = 'transparent';
                btn.style.color = 'var(--text-main)';
                lucide.createIcons();
            }, 1500);
        };
    });

    function saveCart() {
        localStorage.setItem('olateamCart', JSON.stringify(cart));
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <i data-lucide="shopping-bag"></i>
                    <p>Your basket is empty</p>
                </div>
            `;
            lucide.createIcons();
            updateTotal();
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <span class="cart-item-category">${item.category}</span>
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn minus-btn" data-id="${item.id}">−</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="cart-item-remove">
                    <button class="remove-btn" data-id="${item.id}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
        attachCartEvents();
        updateTotal();
    }

    function attachCartEvents() {
        // Plus buttons
        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const item = cart.find(i => i.id === id);
                if (item) {
                    item.quantity++;
                    saveCart();
                    renderCart();
                    updateCartBadge();
                }
            };
        });

        // Minus buttons
        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const item = cart.find(i => i.id === id);
                if (item && item.quantity > 1) {
                    item.quantity--;
                    saveCart();
                    renderCart();
                    updateCartBadge();
                }
            };
        });

        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                cart = cart.filter(i => i.id !== id);
                saveCart();
                renderCart();
                updateCartBadge();
            };
        });
    }

    function updateTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalEl = document.querySelector('.cart-total-amount');
        if (totalEl) {
            totalEl.textContent = `$${total.toFixed(2)}`;
        }
    }

    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        let badge = cartBtn.querySelector('.cart-badge');

        if (totalItems > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                cartBtn.style.position = 'relative';
                cartBtn.appendChild(badge);
            }
            badge.textContent = totalItems;
            badge.style.transform = 'scale(1.4)';
            setTimeout(() => badge.style.transform = 'scale(1)', 200);
        } else if (badge) {
            badge.remove();
        }
    }

    // Initialize cart on load
    renderCart();
    updateCartBadge();

    // Scroll Reveal Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.collection-item, .phil-text, .phil-visual').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // Password Toggle Logic
    const toggleBtns = document.querySelectorAll('.toggle-password');
    toggleBtns.forEach(btn => {
        btn.onclick = () => {
            const input = btn.parentElement.querySelector('input');
            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        };
    });

    // Password Strength Logic
    const passwordInput = document.getElementById('password');
    if (passwordInput && document.querySelector('.strength-bar')) {
        passwordInput.addEventListener('input', (e) => {
            const val = e.target.value;
            const bar = document.querySelector('.strength-bar');
            const text = document.querySelector('.strength-text');

            let strength = 0;
            if (val.length >= 8) strength++;
            if (/[0-9]/.test(val)) strength++;
            if (/[A-Z]/.test(val)) strength++;
            if (/[!@#$%^&*]/.test(val)) strength++;

            bar.className = 'strength-bar';
            if (strength <= 1 && val.length > 0) {
                bar.classList.add('weak');
                text.textContent = 'Weak';
            } else if (strength === 2 || strength === 3) {
                bar.classList.add('medium');
                text.textContent = 'Medium';
            } else if (strength >= 4) {
                bar.classList.add('strong');
                text.textContent = 'Strong';
            } else {
                text.textContent = 'Password Strength';
            }
        });
    }

    // Auth Form Logic (Validation & Security)
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    [loginForm, signupForm].forEach(form => {
        if (!form) return;
        const formInputs = form.querySelectorAll('input');

        formInputs.forEach(input => {
            input.addEventListener('blur', () => validateAuthInput(input));
            input.addEventListener('input', () => {
                if (input.parentElement.classList.contains('invalid')) {
                    validateAuthInput(input);
                }
            });
        });

        form.onsubmit = (e) => {
            e.preventDefault();
            let isValid = true;
            formInputs.forEach(input => {
                if (!validateAuthInput(input)) isValid = false;
            });

            if (isValid) {
                const type = form.id === 'loginForm' ? 'Login' : 'Signup';
                alert(`${type} successful! redirecting...`);
                window.location.href = 'index.html';
            }
        };
    });

    function validateAuthInput(input) {
        const group = input.parentElement;
        let valid = true;

        if (input.required && !input.value) valid = false;
        if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) valid = false;
        if (input.id === 'password' && input.value.length < 8) valid = false;
        if (input.type === 'checkbox' && !input.checked) valid = false;

        if (valid) {
            group.classList.remove('invalid');
            group.classList.add('valid');
        } else {
            group.classList.remove('valid');
            group.classList.add('invalid');
        }
        return valid;
    }
});
