document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');

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
    function setSidebar(open) {
        if (!sidebar || !sidebarBackdrop) return;
        sidebar.classList.toggle('open', open);
        // Show backdrop only on small screens
        const useBackdrop = window.matchMedia('(max-width: 767px)').matches;
        sidebarBackdrop.classList.toggle('show', open && useBackdrop);
        document.body.classList.toggle('sidebar-open', open);
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-expanded', String(open));
        }
        if (open) {
            // Focus first focusable element for accessibility
            const firstLink = sidebar.querySelector('a');
            if (firstLink) firstLink.focus({ preventScroll: true });
        }
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            const open = !sidebar.classList.contains('open');
            setSidebar(open);
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
            if (window.matchMedia('(max-width: 767px)').matches) setSidebar(false);
        });
    });

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

    // Ensure sidebar is open by default
    setSidebar(true);
    if (sidebarToggleBtn) sidebarToggleBtn.setAttribute('aria-expanded', 'true');

    console.log('%cWelcome to The Network-Aware Pentester', 'color: #00ffcc; font-weight: bold; font-size: 14px;');
    console.log('%cSharpen your packets and stay stealthy.', 'color: #80ffe6;');
});