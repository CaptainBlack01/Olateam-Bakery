(function () {
    'use strict';

    const PRODUCTS = window.OLATEAM_PRODUCTS || [];
    const COLLECTIONS = window.OLATEAM_COLLECTIONS || {};
    const COLLECTION_LABELS = { breads: 'Breads', cakes: 'Cakes', pastries: 'Pastries' };
    const CART_KEY = 'olateamCartV2';
    const MAX_QTY = 20;

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const money = (value) => `$${Number(value).toFixed(2)}`;

    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    function loadCart() {
        try {
            const stored = JSON.parse(localStorage.getItem(CART_KEY));
            return Array.isArray(stored) ? stored.filter((item) => item && item.id && item.price >= 0) : [];
        } catch (error) {
            return [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (error) {
            toast('Your basket could not be saved in this browser.', 'alert-circle');
        }
    }

    let cart = loadCart();
    let lastFocused = null;
    let revealObserver = null;

    function toast(message, icon = 'check') {
        let stack = $('[data-toasts]');
        if (!stack) {
            stack = document.createElement('div');
            stack.className = 'toast-stack';
            stack.setAttribute('data-toasts', '');
            stack.setAttribute('role', 'status');
            stack.setAttribute('aria-live', 'polite');
            document.body.appendChild(stack);
        }
        const element = document.createElement('div');
        element.className = 'toast';
        element.innerHTML = `<i data-lucide="${icon}"></i><span>${escapeHtml(message)}</span>`;
        stack.appendChild(element);
        refreshIcons();
        requestAnimationFrame(() => element.classList.add('show'));
        window.setTimeout(() => {
            element.classList.remove('show');
            window.setTimeout(() => element.remove(), 350);
        }, 2800);
    }

    function updateScrollLock() {
        const hasOpenLayer = $('.modal.open, .cart-drawer.open, .nav.open, .search-overlay.open, .scrim.open');
        document.body.classList.toggle('no-scroll', Boolean(hasOpenLayer));
    }

    function openLayer(element) {
        if (!element) return;
        lastFocused = document.activeElement;
        element.classList.add('open');
        element.setAttribute('aria-hidden', 'false');
        updateScrollLock();
        refreshIcons();
        const focusable = $('input:not([type="hidden"]), button, a[href], select, textarea', element);
        window.setTimeout(() => {
            const preferred = $('[data-autofocus]', element) || focusable;
            if (preferred) preferred.focus({ preventScroll: true });
        }, 60);
    }

    function closeLayer(element) {
        if (!element) return;
        element.classList.remove('open');
        element.setAttribute('aria-hidden', 'true');
        updateScrollLock();
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus({ preventScroll: true });
        }
    }

    function getTopLayer() {
        return $('.search-overlay.open') || $('.modal.open') || $('.cart-drawer.open') || $('.nav.open');
    }

    function trapFocus(event, container) {
        if (event.key !== 'Tab' || !container) return;
        const focusable = $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', container)
            .filter((element) => element.offsetParent !== null || element === document.activeElement);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function renderProductCard(product) {
        const label = COLLECTION_LABELS[product.collection] || 'Bakery';
        return `
            <article class="product-card reveal" id="product-${escapeHtml(product.id)}"
                data-id="${escapeHtml(product.id)}" data-name="${escapeHtml(product.name)}"
                data-tag="${escapeHtml(product.tag)}" data-price="${product.price}"
                data-image="${escapeHtml(product.image)}" data-collection="${escapeHtml(product.collection)}">
                <div class="product-media">
                    <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" width="800" height="600">
                    <span class="product-badge">${escapeHtml(product.tag)}</span>
                </div>
                <div class="product-body">
                    <span class="product-cat">${label}</span>
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    <p class="product-desc">${escapeHtml(product.description)}</p>
                    <div class="product-foot">
                        <span class="product-price">${money(product.price)}</span>
                        <button class="btn btn-primary" type="button" data-add-to-cart>
                            <i data-lucide="plus"></i> Add to basket
                        </button>
                    </div>
                </div>
            </article>`;
    }

    function observeReveals(root = document) {
        if (!('IntersectionObserver' in window)) {
            $$('.reveal', root).forEach((element) => element.classList.add('in'));
            return;
        }
        if (!revealObserver) {
            revealObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        }
        $$('.reveal:not(.in)', root).forEach((element) => revealObserver.observe(element));
    }

    function initProductGrids() {
        $$('[data-product-grid]').forEach((grid) => {
            const collection = grid.getAttribute('data-collection');
            const featuredOnly = grid.getAttribute('data-featured') === 'true';
            const limit = parseInt(grid.getAttribute('data-limit') || '0', 10);
            const section = grid.closest('section') || document;
            const chipsWrap = $('[data-filter-chips]', section);
            const sortSelect = $('[data-product-sort]', section);

            let base = PRODUCTS.filter((product) => {
                if (collection && product.collection !== collection) return false;
                if (featuredOnly && !product.featured) return false;
                return true;
            });
            if (limit > 0) base = base.slice(0, limit);

            let activeTag = 'all';

            if (chipsWrap && !featuredOnly && base.length) {
                const tags = ['all', ...new Set(base.map((product) => product.tag))];
                chipsWrap.innerHTML = tags.map((tag, index) => `
                    <button type="button" class="chip${index === 0 ? ' active' : ''}" data-filter-tag="${escapeHtml(tag)}">
                        ${tag === 'all' ? 'All' : escapeHtml(tag)}
                    </button>`).join('');
                chipsWrap.addEventListener('click', (event) => {
                    const chip = event.target.closest('[data-filter-tag]');
                    if (!chip) return;
                    activeTag = chip.getAttribute('data-filter-tag');
                    $$('[data-filter-tag]', chipsWrap).forEach((item) => item.classList.toggle('active', item === chip));
                    render();
                });
            }

            function render() {
                let list = base.filter((product) => activeTag === 'all' || product.tag === activeTag);
                const sortValue = sortSelect ? sortSelect.value : '';
                if (sortValue === 'price-asc') list = list.slice().sort((a, b) => a.price - b.price);
                if (sortValue === 'price-desc') list = list.slice().sort((a, b) => b.price - a.price);
                if (sortValue === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));

                grid.innerHTML = list.length
                    ? list.map(renderProductCard).join('')
                    : `<div class="empty-state" style="grid-column: 1 / -1;"><strong>Nothing here yet</strong><p>Try another filter, or explore the full collection.</p></div>`;

                refreshIcons();
                observeReveals(grid);
            }

            if (sortSelect) sortSelect.addEventListener('change', render);
            render();
        });
    }

    function injectCartDrawer() {
        if ($('.cart-drawer')) return;
        const markup = `
            <div class="scrim" data-scrim></div>
            <aside class="cart-drawer" aria-hidden="true" aria-label="Shopping basket">
                <div class="cart-head">
                    <div>
                        <span class="eyebrow">Your order</span>
                        <h2>Basket</h2>
                    </div>
                    <button class="icon-btn" type="button" data-cart-close aria-label="Close basket">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="cart-body" data-cart-items></div>
                <div class="cart-foot">
                    <div class="cart-total-row">
                        <span>Subtotal</span>
                        <strong data-cart-total>$0.00</strong>
                    </div>
                    <p class="cart-note">Pickup only. Everything is baked fresh the morning of collection.</p>
                    <button class="btn btn-primary btn-block" type="button" data-checkout>Continue to checkout</button>
                </div>
            </aside>`;
        document.body.insertAdjacentHTML('beforeend', markup);
        refreshIcons();
    }

    function injectCheckoutModal() {
        if ($('#checkoutModal')) return;
        const markup = `
            <div class="modal" id="checkoutModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle">
                <div class="modal-card">
                    <button class="icon-btn modal-close" type="button" data-modal-close aria-label="Close checkout">
                        <i data-lucide="x"></i>
                    </button>
                    <div data-checkout-form-view>
                        <div class="modal-head">
                            <span class="eyebrow">Almost there</span>
                            <h2 id="checkoutTitle">Collect your order</h2>
                            <p>This is a demo checkout. No payment is taken and nothing will be charged.</p>
                        </div>
                        <div class="checkout-summary" data-checkout-summary></div>
                        <form id="checkoutForm" novalidate>
                            <div class="form-grid">
                                <div class="field">
                                    <label for="checkoutName">Full name</label>
                                    <input type="text" id="checkoutName" name="name" autocomplete="name" required data-autofocus>
                                    <span class="field-error">Please enter your name.</span>
                                </div>
                                <div class="field">
                                    <label for="checkoutEmail">Email</label>
                                    <input type="email" id="checkoutEmail" name="email" autocomplete="email" required>
                                    <span class="field-error">Please enter a valid email.</span>
                                </div>
                            </div>
                            <div class="field">
                                <label for="checkoutTime">Pickup time</label>
                                <select id="checkoutTime" name="time" required>
                                    <option value="">Choose a slot</option>
                                    <option value="08:00">Tomorrow, 8:00 – 10:00</option>
                                    <option value="10:00">Tomorrow, 10:00 – 12:00</option>
                                    <option value="12:00">Tomorrow, 12:00 – 14:00</option>
                                    <option value="14:00">Tomorrow, 14:00 – 16:00</option>
                                </select>
                                <span class="field-error">Please choose a pickup time.</span>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Place demo order</button>
                        </form>
                    </div>
                    <div class="success-state" data-checkout-success hidden>
                        <div class="success-icon"><i data-lucide="check"></i></div>
                        <h2>Order requested</h2>
                        <p>Thank you. We have your order and will confirm pickup by email shortly. This was a demo — no payment was taken.</p>
                        <button type="button" class="btn btn-primary" data-modal-close>Back to browsing</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', markup);
        refreshIcons();

        const modal = $('#checkoutModal');
        const form = $('#checkoutForm', modal);
        const success = $('[data-checkout-success]', modal);
        const formView = $('[data-checkout-form-view]', modal);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const valid = validateForm(form);
            if (!valid) return;
            formView.hidden = true;
            success.hidden = false;
            refreshIcons();
            cart = [];
            saveCart();
            renderCart();
            updateCartCount();
            toast('Order requested. Check your inbox for confirmation.');
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal || event.target.closest('[data-modal-close]')) {
                closeModal(modal);
            }
        });

        modal.resetCheckout = () => {
            formView.hidden = false;
            success.hidden = true;
            form.reset();
            $$('.field', form).forEach((field) => field.classList.remove('invalid', 'field-valid'));
        };
    }

    function injectSearch() {
        if ($('#searchOverlay')) return;
        const markup = `
            <div class="search-overlay" id="searchOverlay" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Search the bakery">
                <div class="search-panel">
                    <div class="search-head">
                        <i data-lucide="search"></i>
                        <input type="search" id="searchInput" placeholder="Search sourdough, croissants, cakes…" aria-label="Search products" autocomplete="off" data-autofocus>
                        <button class="icon-btn" type="button" data-search-close aria-label="Close search">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="search-results" data-search-results></div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', markup);
        refreshIcons();

        const overlay = $('#searchOverlay');
        const input = $('#searchInput', overlay);
        const results = $('[data-search-results]', overlay);

        function renderResults(query) {
            const term = query.trim().toLowerCase();
            if (!term) {
                results.innerHTML = '<p class="search-hint">Search our breads, cakes, and pastries. Try “sourdough”, “chocolate”, or “croissant”.</p>';
                return;
            }
            const matches = PRODUCTS.filter((product) => (
                product.name.toLowerCase().includes(term) ||
                product.tag.toLowerCase().includes(term) ||
                product.collection.toLowerCase().includes(term) ||
                product.description.toLowerCase().includes(term)
            )).slice(0, 8);

            if (!matches.length) {
                results.innerHTML = `<p class="search-hint">No matches for “${escapeHtml(query.trim())}”. Try a different word.</p>`;
                return;
            }

            results.innerHTML = matches.map((product) => `
                <a class="search-result" href="${COLLECTIONS[product.collection] || 'index.html'}#product-${escapeHtml(product.id)}">
                    <img src="${escapeHtml(product.image)}" alt="" loading="lazy" width="52" height="52">
                    <span class="search-result-info">
                        <strong>${escapeHtml(product.name)}</strong>
                        <span>${escapeHtml(COLLECTION_LABELS[product.collection] || 'Bakery')} · ${escapeHtml(product.tag)}</span>
                    </span>
                    <span class="search-result-price">${money(product.price)}</span>
                </a>`).join('');
        }

        input.addEventListener('input', () => renderResults(input.value));
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay || event.target.closest('[data-search-close]')) {
                closeSearch();
            }
        });

        renderResults('');
    }

    function openSearch() {
        const overlay = $('#searchOverlay');
        if (!overlay) return;
        openLayer(overlay);
        const input = $('#searchInput', overlay);
        if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input'));
        }
        $('.scrim')?.classList.remove('open');
        updateScrollLock();
    }

    function closeSearch() {
        closeLayer($('#searchOverlay'));
    }

    function openCart() {
        const drawer = $('.cart-drawer');
        if (!drawer) return;
        $('.scrim')?.classList.add('open');
        openLayer(drawer);
    }

    function closeCart() {
        $('.scrim')?.classList.remove('open');
        closeLayer($('.cart-drawer'));
        updateScrollLock();
    }

    function openModal(modal) {
        if (!modal) return;
        openLayer(modal);
    }

    function closeModal(modal) {
        if (!modal) return;
        closeLayer(modal);
    }

    function renderCart() {
        const container = $('[data-cart-items]');
        if (!container) return;
        const totalElement = $('[data-cart-total]');
        const checkoutButton = $('[data-checkout]');

        if (!cart.length) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i data-lucide="shopping-bag"></i>
                    <p>Your basket is empty. Warm bread is only a click away.</p>
                    <button class="btn btn-secondary btn-sm" type="button" data-browse>Browse the collection</button>
                </div>`;
            refreshIcons();
            if (totalElement) totalElement.textContent = money(0);
            if (checkoutButton) checkoutButton.disabled = true;
            return;
        }

        container.innerHTML = cart.map((item) => `
            <div class="cart-item" data-cart-id="${escapeHtml(item.id)}">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" width="72" height="72">
                <div>
                    <span class="cart-item-cat">${escapeHtml(item.tag)}</span>
                    <h3>${escapeHtml(item.name)}</h3>
                    <div class="cart-item-price">${money(item.price)}</div>
                    <div class="qty">
                        <button class="qty-btn" type="button" data-cart-action="decrease" aria-label="Decrease quantity">−</button>
                        <span class="qty-count">${item.quantity}</span>
                        <button class="qty-btn" type="button" data-cart-action="increase" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <button class="cart-remove" type="button" data-cart-action="remove" aria-label="Remove ${escapeHtml(item.name)}">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>`).join('');

        refreshIcons();

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (totalElement) totalElement.textContent = money(total);
        if (checkoutButton) checkoutButton.disabled = false;
    }

    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        $$('[data-cart-count]').forEach((badge) => {
            badge.textContent = count;
            badge.hidden = count === 0;
        });
    }

    function addToCart(card) {
        if (!card) return;
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const tag = card.getAttribute('data-tag') || 'Bakery';
        const image = card.getAttribute('data-image') || '';
        const price = parseFloat(card.getAttribute('data-price'));

        if (!id || !name || Number.isNaN(price)) return;

        const existing = cart.find((item) => item.id === id);
        if (existing) {
            if (existing.quantity >= MAX_QTY) {
                toast('You have reached the maximum quantity for this item.', 'alert-circle');
                return;
            }
            existing.quantity += 1;
        } else {
            cart.push({ id, name, tag, image, price, quantity: 1 });
        }

        saveCart();
        renderCart();
        updateCartCount();
        toast(`${name} added to your basket.`);
    }

    function initCart() {
        injectCartDrawer();
        injectCheckoutModal();
        renderCart();
        updateCartCount();

        document.addEventListener('click', (event) => {
            const addButton = event.target.closest('[data-add-to-cart]');
            if (addButton) {
                const card = addButton.closest('.product-card');
                addToCart(card);
                return;
            }

            const cartTrigger = event.target.closest('[data-cart-open], #cartBtn, [aria-label="Open basket"], [aria-label="Cart"]');
            if (cartTrigger) {
                event.preventDefault();
                openCart();
                return;
            }

            if (event.target.closest('[data-cart-close]')) {
                closeCart();
                return;
            }

            if (event.target.closest('[data-browse]')) {
                closeCart();
                window.location.href = 'breads.html';
                return;
            }

            if (event.target.closest('[data-checkout]')) {
                const summary = $('[data-checkout-summary]');
                if (!cart.length) return;
                if (summary) {
                    summary.innerHTML = cart.map((item) => `
                        <div class="checkout-line">
                            <span>${item.quantity} × ${escapeHtml(item.name)}</span>
                            <span>${money(item.price * item.quantity)}</span>
                        </div>`).join('') + `
                        <div class="checkout-line total">
                            <span>Total</span>
                            <span>${money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
                        </div>`;
                }
                closeCart();
                const checkoutModal = $('#checkoutModal');
                checkoutModal?.resetCheckout?.();
                openModal(checkoutModal);
                return;
            }

            const cartAction = event.target.closest('[data-cart-action]');
            if (cartAction) {
                const itemElement = cartAction.closest('[data-cart-id]');
                if (!itemElement) return;
                const item = cart.find((entry) => entry.id === itemElement.getAttribute('data-cart-id'));
                if (!item) return;
                const action = cartAction.getAttribute('data-cart-action');
                if (action === 'increase' && item.quantity < MAX_QTY) item.quantity += 1;
                if (action === 'decrease') item.quantity = Math.max(1, item.quantity - 1);
                if (action === 'remove') cart = cart.filter((entry) => entry.id !== item.id);
                saveCart();
                renderCart();
                updateCartCount();
            }
        });

        $('.scrim')?.addEventListener('click', closeCart);
    }

    function initNav() {
        const toggle = $('#navToggle');
        const nav = $('#primaryNav');
        const scrim = $('.scrim');
        if (!toggle || !nav) return;

        function setNav(open) {
            nav.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            if (scrim) scrim.classList.toggle('open', open);
            updateScrollLock();
        }

        toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
        nav.addEventListener('click', (event) => {
            if (event.target.closest('a')) setNav(false);
        });
        scrim?.addEventListener('click', () => setNav(false));
        window.addEventListener('resize', () => {
            if (window.innerWidth > 980) setNav(false);
        });
    }

    function initSearch() {
        const button = $('#searchBtn');
        injectSearch();
        if (button) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                openSearch();
            });
        }
    }

    function validateField(input) {
        if (!input || input.disabled) return true;
        const field = input.closest('.field');
        const value = (input.value || '').trim();
        let valid = true;

        if (input.type === 'checkbox') {
            if (input.required && !input.checked) valid = false;
        } else if (input.required && !value) {
            valid = false;
        } else if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            valid = false;
        } else if (input.type === 'password' && value && value.length < 8) {
            valid = false;
        } else if (input.dataset.minlength && value.length < Number(input.dataset.minlength)) {
            valid = false;
        }

        if (field) {
            field.classList.toggle('invalid', !valid);
            field.classList.toggle('field-valid', valid && input.type !== 'checkbox' && value.length > 0);
        }
        input.setAttribute('aria-invalid', String(!valid));
        return valid;
    }

    function validateForm(form) {
        const inputs = $$('input, select, textarea', form).filter((input) => !input.disabled && input.type !== 'hidden');
        let valid = true;
        inputs.forEach((input) => {
            if (!validateField(input)) valid = false;
        });
        const firstInvalid = $('.field.invalid input, .field.invalid select, .field.invalid textarea', form);
        if (firstInvalid) firstInvalid.focus();
        return valid;
    }

    function initFormValidation() {
        $$('form').forEach((form) => {
            const inputs = $$('input, select, textarea', form).filter((input) => input.type !== 'hidden');
            inputs.forEach((input) => {
                input.addEventListener('blur', () => validateField(input));
                input.addEventListener('input', () => {
                    const field = input.closest('.field');
                    if (field && field.classList.contains('invalid')) validateField(input);
                });
                input.addEventListener('change', () => validateField(input));
            });
        });
    }

    function initContactForm() {
        const form = $('#contactForm');
        if (!form) return;
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!validateForm(form)) return;
            form.reset();
            $$('.field', form).forEach((field) => field.classList.remove('invalid', 'field-valid'));
            toast('Message sent. We will reply within one business day.', 'mail');
        });
    }

    function initNewsletter() {
        $$('[data-newsletter]').forEach((form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const input = $('input[type="email"]', form);
                if (!input || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
                    toast('Please enter a valid email address.', 'alert-circle');
                    input?.focus();
                    return;
                }
                form.reset();
                toast('You are on the list. Fresh news, no spam.');
            });
        });
    }

    function initReservation() {
        const modal = $('#orderModal');
        if (!modal) return;
        const openers = $$('[data-open-reservation], #openModal');
        const form = $('#orderForm', modal);
        const productSelect = $('#reserveProduct', modal);

        if (productSelect && PRODUCTS.length) {
            const breads = PRODUCTS.filter((product) => product.collection === 'breads');
            productSelect.innerHTML = '<option value="">Choose a loaf…</option>' +
                breads.map((product) => `<option value="${escapeHtml(product.name)}">${escapeHtml(product.name)} — ${money(product.price)}</option>`).join('');
        }

        openers.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                openModal(modal);
            });
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal || event.target.closest('[data-modal-close]')) {
                closeModal(modal);
            }
        });

        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                if (!validateForm(form)) return;
                const name = $('#reserveName', form)?.value.trim() || 'there';
                form.reset();
                $$('.field', form).forEach((field) => field.classList.remove('invalid', 'field-valid'));
                closeModal(modal);
                toast(`Reservation sent, ${name}. We will confirm by email.`, 'mail');
            });
        }
    }

    function initPasswordTools() {
        $$('[data-password-toggle]').forEach((button) => {
            button.addEventListener('click', () => {
                const input = $('input', button.closest('.password-wrap'));
                if (!input) return;
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                button.innerHTML = `<i data-lucide="${show ? 'eye-off' : 'eye'}"></i>`;
                button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
                refreshIcons();
            });
        });

        const password = $('#signupPassword') || $('#password');
        const track = $('[data-strength-bar]');
        const label = $('[data-strength-label]');
        if (!password || !track || !label) return;

        password.addEventListener('input', () => {
            const value = password.value;
            let score = 0;
            if (value.length >= 8) score += 1;
            if (/[0-9]/.test(value)) score += 1;
            if (/[A-Z]/.test(value)) score += 1;
            if (/[^A-Za-z0-9]/.test(value)) score += 1;

            const states = [
                { width: '0%', color: 'var(--danger)', text: 'Password strength' },
                { width: '33%', color: 'var(--danger)', text: 'Weak' },
                { width: '66%', color: 'var(--gold)', text: 'Medium' },
                { width: '100%', color: 'var(--sage)', text: 'Strong' }
            ];
            const state = value ? states[Math.min(score, 3)] : states[0];
            track.style.width = state.width;
            track.style.background = state.color;
            label.textContent = state.text;
        });
    }

    function initAuthForms() {
        const loginForm = $('#loginForm');
        const signupForm = $('#signupForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (!validateForm(loginForm)) return;
                toast('Welcome back. Taking you home…');
                window.setTimeout(() => { window.location.href = 'index.html'; }, 1100);
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (!validateForm(signupForm)) return;
                toast('Account created. Taking you home…');
                window.setTimeout(() => { window.location.href = 'index.html'; }, 1100);
            });
        }
    }

    function initLayerKeyboard() {
        document.addEventListener('keydown', (event) => {
            const topLayer = getTopLayer();

            if (event.key === 'Escape' && topLayer) {
                if (topLayer.classList.contains('search-overlay')) closeSearch();
                else if (topLayer.classList.contains('modal')) closeModal(topLayer);
                else if (topLayer.classList.contains('cart-drawer')) closeCart();
                else if (topLayer.classList.contains('nav')) {
                    topLayer.classList.remove('open');
                    $('#navToggle')?.setAttribute('aria-expanded', 'false');
                    $('.scrim')?.classList.remove('open');
                    updateScrollLock();
                }
                return;
            }

            if (event.key === 'Tab' && topLayer) {
                if (topLayer.classList.contains('search-overlay')) trapFocus(event, $('.search-panel', topLayer));
                else if (topLayer.classList.contains('modal')) trapFocus(event, $('.modal-card', topLayer));
                else trapFocus(event, topLayer);
            }
        });
    }

    function init() {
        initNav();
        initCart();
        initSearch();
        initProductGrids();
        initReservation();
        initFormValidation();
        initContactForm();
        initNewsletter();
        initPasswordTools();
        initAuthForms();
        initLayerKeyboard();
        observeReveals();
        refreshIcons();

        const hash = window.location.hash;
        if (hash && hash.startsWith('#product-')) {
            const target = document.querySelector(hash);
            if (target) {
                window.setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('in');
                }, 250);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
