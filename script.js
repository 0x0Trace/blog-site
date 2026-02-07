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

    // ============================================
    // Site-wide Search Functionality
    // ============================================
    initSearch();
});

// ============================================
// Search Implementation
// ============================================
function initSearch() {
    const searchInput = document.getElementById('siteSearch');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    let searchIndex = [];
    let currentFocusIndex = -1;

    // Determine correct path to search-index.json based on current page location
    const currentPath = window.location.pathname;
    let searchIndexPath = 'search-index.json';

    if (currentPath.includes('/HackSmarter/') || currentPath.includes('/writeups/') || currentPath.includes('/projects/')) {
        searchIndexPath = '../search-index.json';
    }

    // Load search index
    fetch(searchIndexPath)
        .then(response => response.json())
        .then(data => {
            searchIndex = data;
        })
        .catch(err => console.error('Error loading search index:', err));

    // Debounce function to limit search frequency
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Resolve URL based on current page location
    function resolveUrl(url) {
        if (currentPath.includes('/HackSmarter/') || currentPath.includes('/writeups/') || currentPath.includes('/projects/')) {
            return '../' + url;
        }
        return url;
    }

    // Score keywords against a query
    function scoreKeywords(keywords, normalizedQuery, queryTerms) {
        let score = 0;
        const matched = [];
        keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            if (keywordLower === normalizedQuery) {
                score += 80;
                matched.push(keyword);
            } else if (keywordLower.includes(normalizedQuery)) {
                score += 60;
                matched.push(keyword);
            } else {
                const allTermsMatch = queryTerms.every(term => keywordLower.includes(term));
                if (allTermsMatch) {
                    score += 40;
                    matched.push(keyword);
                }
            }
        });
        return { score, matched };
    }

    // Perform search
    function performSearch(query) {
        if (!query || query.trim().length < 2) {
            searchResults.hidden = true;
            searchResults.innerHTML = '';
            currentFocusIndex = -1;
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();
        const queryTerms = normalizedQuery.split(/\s+/);
        const allResults = [];

        searchIndex.forEach(item => {
            // --- Page-level scoring ---
            let pageScore = 0;
            const pageMatchedKeywords = [];

            if (item.title.toLowerCase().includes(normalizedQuery)) {
                pageScore += 100;
            }
            if (item.category.toLowerCase().includes(normalizedQuery)) {
                pageScore += 50;
            }

            const kwResult = scoreKeywords(item.keywords, normalizedQuery, queryTerms);
            pageScore += kwResult.score;
            pageMatchedKeywords.push(...kwResult.matched);

            if (item.description.toLowerCase().includes(normalizedQuery)) {
                pageScore += 30;
            }

            queryTerms.forEach(term => {
                if (item.title.toLowerCase().includes(term)) pageScore += 10;
                if (item.description.toLowerCase().includes(term)) pageScore += 5;
            });

            if (pageScore > 0) {
                allResults.push({
                    type: 'page',
                    title: item.title,
                    url: resolveUrl(item.url),
                    category: item.category,
                    description: item.description,
                    score: pageScore,
                    matchedKeywords: pageMatchedKeywords
                });
            }

            // --- Section-level scoring ---
            if (item.sections && item.sections.length > 0) {
                item.sections.forEach(section => {
                    let sectionScore = 0;
                    const sectionMatchedKeywords = [];

                    // Section heading match
                    if (section.heading.toLowerCase().includes(normalizedQuery)) {
                        sectionScore += 90;
                    }

                    // Section keyword matches
                    const sKwResult = scoreKeywords(section.keywords, normalizedQuery, queryTerms);
                    sectionScore += sKwResult.score;
                    sectionMatchedKeywords.push(...sKwResult.matched);

                    // Multi-term heading match
                    queryTerms.forEach(term => {
                        if (section.heading.toLowerCase().includes(term)) sectionScore += 15;
                    });

                    if (sectionScore > 0) {
                        allResults.push({
                            type: 'section',
                            title: item.title,
                            sectionHeading: section.heading,
                            url: resolveUrl(section.anchor),
                            category: item.category,
                            description: item.description,
                            score: sectionScore,
                            matchedKeywords: sectionMatchedKeywords
                        });
                    }
                });
            }
        });

        // Sort by score descending
        allResults.sort((a, b) => b.score - a.score);

        // Deduplicate: if a section result points to the same page as a page result,
        // keep the higher-scoring one. Also limit section results from same page.
        const seen = new Map();
        const dedupedResults = [];

        for (const result of allResults) {
            // Use base URL (without anchor) as the dedup key for page results
            const baseUrl = result.url.split('#')[0];
            const key = result.type === 'section'
                ? result.url  // Unique per section
                : baseUrl;    // Unique per page

            // Limit to 3 section results per page
            if (result.type === 'section') {
                const pageCount = dedupedResults.filter(
                    r => r.type === 'section' && r.url.split('#')[0] === baseUrl
                ).length;
                if (pageCount >= 3) continue;
            }

            if (!seen.has(key)) {
                seen.set(key, true);
                dedupedResults.push(result);
            }

            if (dedupedResults.length >= 10) break;
        }

        displayResults(dedupedResults, normalizedQuery);
    }

    // Display search results
    function displayResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No walkthroughs found for "' + escapeHtml(query) + '"</div>';
            searchResults.hidden = false;
            return;
        }

        const html = results.map((item, index) => {
            const keywordsHtml = item.matchedKeywords.length > 0
                ? '<div class="search-result-keywords">' +
                  item.matchedKeywords.slice(0, 5).map(kw =>
                      `<span class="search-keyword-tag highlighted">${escapeHtml(kw)}</span>`
                  ).join('') +
                  '</div>'
                : '';

            // Show "Page > Section" for section-level results
            const titleHtml = item.type === 'section'
                ? `<span class="search-result-page">${highlightText(item.title, query)}</span> <span class="search-result-separator">&rsaquo;</span> <span class="search-result-section">${highlightText(item.sectionHeading, query)}</span>`
                : highlightText(item.title, query);

            return `
                <div class="search-result-item${item.type === 'section' ? ' search-result-section-item' : ''}" data-index="${index}" data-url="${item.url}" tabindex="0">
                    <div class="search-result-category">${escapeHtml(item.category)}</div>
                    <div class="search-result-title">${titleHtml}</div>
                    ${item.type === 'page' ? '<div class="search-result-description">' + highlightText(item.description, query) + '</div>' : ''}
                    ${keywordsHtml}
                </div>
            `;
        }).join('');

        searchResults.innerHTML = html;
        searchResults.hidden = false;
        currentFocusIndex = -1;

        // Add click handlers
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = item.dataset.url;
            });
        });
    }

    // Highlight matching text
    function highlightText(text, query) {
        const escapedText = escapeHtml(text);
        const regex = new RegExp(`(${escapeHtml(query)})`, 'gi');
        return escapedText.replace(regex, '<mark style="background: rgba(255, 107, 107, 0.3); color: #ff8787; padding: 0 2px; border-radius: 2px;">$1</mark>');
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Keyboard navigation
    function navigateResults(direction) {
        const items = searchResults.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        // Remove previous focus
        if (currentFocusIndex >= 0) {
            items[currentFocusIndex].classList.remove('focused');
        }

        // Update index
        if (direction === 'down') {
            currentFocusIndex = (currentFocusIndex + 1) % items.length;
        } else if (direction === 'up') {
            currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
        }

        // Add new focus
        items[currentFocusIndex].classList.add('focused');
        items[currentFocusIndex].scrollIntoView({ block: 'nearest' });
    }

    // Event listeners
    searchInput.addEventListener('input', debounce((e) => {
        performSearch(e.target.value);
    }, 300));

    searchInput.addEventListener('keydown', (e) => {
        if (!searchResults.hidden) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateResults('down');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateResults('up');
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const items = searchResults.querySelectorAll('.search-result-item');
                if (currentFocusIndex >= 0 && items[currentFocusIndex]) {
                    window.location.href = items[currentFocusIndex].dataset.url;
                } else if (items.length > 0) {
                    window.location.href = items[0].dataset.url;
                }
            } else if (e.key === 'Escape') {
                searchResults.hidden = true;
                searchInput.blur();
            }
        }
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.hidden = true;
            currentFocusIndex = -1;
        }
    });

    // Reopen results when focusing back on input (if there's text)
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) {
            performSearch(searchInput.value);
        }
    });
}