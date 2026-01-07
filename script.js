document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const termTarget = document.getElementById('term-typing');
    const termCursor = document.getElementById('term-cursor');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 32, 39, 0.95)';
            header.style.transition = 'background 0.3s ease-in-out';
        } else {
            header.style.background = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Sidebar open/close
    function setSidebar(open, options = {}) {
        const { focus = false } = options;
        if (!sidebar || !sidebarBackdrop) return;
        sidebar.classList.toggle('open', open);
        // Show backdrop only on small screens
        const useBackdrop = window.matchMedia('(max-width: 767px)').matches;
        sidebarBackdrop.classList.toggle('show', open && useBackdrop);
        document.body.classList.toggle('sidebar-open', open);
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-expanded', String(open));
        }
        if (open && focus) {
            // Focus first focusable element for accessibility
            const firstLink = sidebar.querySelector('a');
            if (firstLink) firstLink.focus({ preventScroll: true });
        }
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            const open = !sidebar.classList.contains('open');
            setSidebar(open, { focus: open });
            sidebarToggleBtn.setAttribute('aria-expanded', String(open));
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => setSidebar(false));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            setSidebar(false);
        }
    });

    // Close button in sidebar
    const sidebarCloseBtn = document.getElementById('sidebarClose');
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', () => setSidebar(false));
        sidebarCloseBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSidebar(false);
            }
        });
    }

    // Optional UX: close sidebar on link click on small screens
    document.querySelectorAll('.sidebar a').forEach(a => {
        a.addEventListener('click', () => {
            // On mobile, close immediately for better reading focus
            if (window.matchMedia('(max-width: 767px)').matches) {
                setSidebar(false);
            }
        });
    });

    // Typing effect for terminal-style header
    if (termTarget && termCursor) {
        const text = 'Zerotrace Logs';
        // Always animate typing and keep the cursor blinking
        termTarget.textContent = '';
        termCursor.classList.remove('stopped');

        let i = 0;
    const speed = 65; // ms per char (slower)
        const interval = setInterval(() => {
            i++;
            termTarget.textContent = text.slice(0, i);
            if (i >= text.length) {
                clearInterval(interval);
            }
        }, speed);
    }

    // Mark current page link active in sidebar
    const currentPath = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && href.endsWith(currentPath)) {
            a.setAttribute('aria-current', 'page');
        } else {
            a.removeAttribute('aria-current');
        }
    });

    // Default state: open on desktop/tablet, closed on mobile
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    setSidebar(!isMobile, { focus: false });
    if (sidebarToggleBtn) sidebarToggleBtn.setAttribute('aria-expanded', String(!isMobile));

    // Submenu toggle (Writeups)
    document.querySelectorAll('.submenu-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            const submenu = btn.nextElementSibling;
            if (submenu) {
                submenu.hidden = expanded; // hide if currently expanded
            }
        });
        // Ensure initial hidden state matches aria-expanded
        const submenu = btn.nextElementSibling;
        if (submenu && btn.getAttribute('aria-expanded') === 'false') {
            submenu.hidden = true;
        }
    });

    // Load recent updates
    fetch('updates.json')
        .then(response => response.json())
        .then(updates => {
            const list = document.getElementById('updates-list');
            if (!list || !Array.isArray(updates)) return;
            updates.slice(0, 5).forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = item.link;
                a.textContent = `${item.date} – ${item.title}`;
                a.target = '_self';
                li.appendChild(a);
                list.appendChild(li);
            });
        })
        .catch(err => console.error('Error loading updates:', err));

    console.log('%cWelcome to The Network-Aware Pentester', 'color: #00ffcc; font-weight: bold; font-size: 14px;');
    console.log('%cSharpen your packets and stay stealthy.', 'color: #80ffe6;');

    // ============================================
    // Back to Top Button
    // ============================================
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.innerHTML = '<span aria-hidden="true">&#9650;</span>';
    document.body.appendChild(backToTopBtn);

    // Show/hide back to top button based on scroll position
    const scrollThreshold = 300;
    let ticking = false;

    function updateBackToTopVisibility() {
        if (window.scrollY > scrollThreshold) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateBackToTopVisibility);
            ticking = true;
        }
    });

    // Smooth scroll to top when clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ============================================
    // Copy to Clipboard for Code Blocks
    // ============================================
    function initCopyButtons() {
        // Find all pre elements that contain code
        const codeBlocks = document.querySelectorAll('pre:not(.code-preview):not(.code-full)');

        // Clipboard SVG icon
        const clipboardIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

        codeBlocks.forEach((pre) => {
            // Skip if already has a copy button
            if (pre.querySelector('.copy-btn')) return;

            // Create copy button with icon
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
            copyBtn.innerHTML = clipboardIcon;

            // Add button inside pre
            pre.appendChild(copyBtn);

            // Copy functionality
            copyBtn.addEventListener('click', async () => {
                const code = pre.querySelector('code');
                const textToCopy = code ? code.textContent : pre.textContent;

                try {
                    await navigator.clipboard.writeText(textToCopy);
                    copyBtn.innerHTML = checkIcon;
                    copyBtn.classList.add('copied');

                    // Reset button after 2 seconds
                    setTimeout(() => {
                        copyBtn.innerHTML = clipboardIcon;
                        copyBtn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        copyBtn.innerHTML = checkIcon;
                        copyBtn.classList.add('copied');
                        setTimeout(() => {
                            copyBtn.innerHTML = clipboardIcon;
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    } catch (fallbackErr) {
                        // Keep clipboard icon on error
                    }
                    document.body.removeChild(textArea);
                }
            });
        });
    }

    // Initialize copy buttons
    initCopyButtons();
});