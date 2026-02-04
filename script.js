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

    // Cart Counter Logic
    const cartBtn = document.querySelector('[aria-label="Cart"]');
    const addBtns = document.querySelectorAll('.add-btn');
    let cartCount = 0;

    addBtns.forEach(btn => {
        btn.onclick = () => {
            cartCount++;
            updateCartCounter();
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => btn.style.transform = 'scale(1)', 200);
        };
    });

    function updateCartCounter() {
        if (!cartBtn) return;
        let badge = cartBtn.querySelector('.cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            cartBtn.appendChild(badge);
        }
        badge.textContent = cartCount;
    }

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
