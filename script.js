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
});