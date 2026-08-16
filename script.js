// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Custom Background Canvas 3D Waving Grid
    initInteractiveBackground();

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Run custom setup
    initApp();
});

// Custom 3D Waving Mesh Grid Background
function initInteractiveBackground() {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouse = { x: null, y: null, radius: 180 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // 3D Perspective Projection settings
    const fov = 450;
    const tilt = 1.05; // tilt angle (radians)
    const spacing = 45; // grid cell spacing
    let cols = Math.floor(width * 1.5 / spacing);
    let rows = Math.floor(height * 1.5 / spacing);

    function getProjectedPoint(col, row, time) {
        const bx = (col - cols / 2) * spacing;
        const by = (row - rows / 2) * spacing - 50;

        const dist = Math.sqrt(bx * bx + by * by);
        const z = Math.sin(dist * 0.005 - time * 0.002) * 32;

        const ry = by * Math.cos(tilt) - z * Math.sin(tilt);
        const rz = by * Math.sin(tilt) + z * Math.cos(tilt);

        const scale = fov / (fov + rz);
        let sx = width / 2 + bx * scale;
        let sy = height / 2 + ry * scale;

        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - sx;
            const dy = mouse.y - sy;
            const mouseDist = Math.sqrt(dx * dx + dy * dy);
            if (mouseDist < mouse.radius) {
                const force = (mouse.radius - mouseDist) / mouse.radius;
                sx -= (dx / mouseDist) * force * 35;
                sy -= (dy / mouseDist) * force * 35;
            }
        }

        return { x: sx, y: sy, zHeight: z };
    }

    function animate(time) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        ctx.fillStyle = isDarkMode ? '#090d16' : '#f8fafc'; // background clear
        ctx.fillRect(0, 0, width, height);

        cols = Math.floor(width * 1.5 / spacing);
        rows = Math.floor(height * 1.5 / spacing);

        const points = [];
        for (let r = 0; r < rows; r++) {
            points[r] = [];
            for (let c = 0; c < cols; c++) {
                points[r][c] = getProjectedPoint(c, r, time);
            }
        }

        for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cols - 1; c++) {
                const p1 = points[r][c];
                const p2 = points[r][c + 1];
                const p3 = points[r + 1][c];

                const heightGlow = Math.max(0, (p1.zHeight + 32) / 64);
                const opacity = isDarkMode ? (0.05 + heightGlow * 0.12) : (0.10 + heightGlow * 0.14);

                ctx.lineWidth = 0.8;
                ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;

                if (p1.x > -50 && p1.x < width + 50 && p1.y > -50 && p1.y < height + 50 &&
                    p2.x > -50 && p2.x < width + 50 && p2.y > -50 && p2.y < height + 50) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }

                if (p1.x > -50 && p1.x < width + 50 && p1.y > -50 && p1.y < height + 50 &&
                    p3.x > -50 && p3.x < width + 50 && p3.y > -50 && p3.y < height + 50) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// App Core Functionality
function initApp() {
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // Mobile Navigation
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Cursor Glow Tracking
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);

    window.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // Active Navigation Highlight & Navbar Background on Scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const navbarHeight = navbar ? navbar.offsetHeight : 80;

            if (window.scrollY >= (sectionTop - navbarHeight - 120)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                window.scrollTo({
                    top: targetElement.offsetTop - navbarHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contact Form handling with custom backend
    const contactForm = document.getElementById('contactForm');
    const API_BASE_URL = 'https://sajan-portfolio-tan.vercel.app/';

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            // Client-side validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!name || !email || !subject || !message || !emailRegex.test(email)) {
                showNotification("Please enter valid contact details.", "error");
                return;
            }

            // Input length constraints
            if (name.length > 100 || email.length > 254 || subject.length > 200 || message.length > 5000) {
                showNotification("Please enter valid contact details.", "error");
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText ? btnText.textContent : 'Send Message';

            if (btnText) btnText.textContent = 'Sending...';
            submitBtn.disabled = true;

            fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, subject, message })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showNotification("Message sent successfully! I'll get back to you soon.", "success");
                        contactForm.reset();
                    } else {
                        showNotification(data.message || "Failed to send message. Please try again.", "error");
                    }
                })
                .catch(error => {
                    console.error('Contact Form Error:', error);
                    showNotification("Failed to send message. Please try again.", "error");
                })
                .finally(() => {
                    if (btnText) btnText.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Stat Counter Animations
    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            if (isElementInViewport(counter) && !counter.classList.contains('animated')) {
                const target = parseInt(counter.getAttribute('data-count')) || 0;
                const duration = 2000;
                const stepTime = 16; // 60 FPS
                const totalSteps = duration / stepTime;
                const increment = target / totalSteps;
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(timer);
                        counter.classList.add('animated');
                    } else {
                        counter.textContent = Math.ceil(current);
                    }
                }, stepTime);
            }
        });
    };

    const isElementInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) * 1.1 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    // Magnetic Buttons & Cards 3D Tilt Effect
    const magneticButtons = document.querySelectorAll('.magnetic');
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });

    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();

            // 3D Tilt calculations
            const tx = e.clientX - rect.left - rect.width / 2;
            const ty = e.clientY - rect.top - rect.height / 2;
            const tiltX = -(ty / rect.height) * 14;
            const tiltY = (tx / rect.width) * 14;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;

            // Spotlight glow position coordinates
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${mx}px`);
            card.style.setProperty('--mouse-y', `${my}px`);
            card.style.setProperty('--spotlight-opacity', '0.08');
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
            card.style.setProperty('--spotlight-opacity', '0');
        });
    });

    // Intersection Observer for generic page anims and section decrypt effects
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Stagger animations for list child elements
                if (entry.target.classList.contains('projects-grid') ||
                    entry.target.classList.contains('timeline') ||
                    entry.target.classList.contains('experience-container') ||
                    entry.target.classList.contains('certifications-container') ||
                    entry.target.classList.contains('achievements-grid') ||
                    entry.target.classList.contains('extracurricular-container')) {
                    const children = entry.target.children;
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, index * 100);
                    });
                }

                // Trigger single-pass gradient shimmer on Section Title
                if (entry.target.tagName.toLowerCase() === 'section') {
                    const title = entry.target.querySelector('.section-title');
                    if (title && !title.classList.contains('shimmer-active')) {
                        title.classList.add('shimmer-active');
                    }
                }

                if (entry.target.classList.contains('about')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, .timeline, .projects-grid, .experience-container, .certifications-container, .achievements-grid, .extracurricular-container, .text-block').forEach(el => {
        observer.observe(el);
    });

    window.addEventListener('scroll', () => {
        animateCounters();
    });

    // Typing effect for hero role
    initHeroRoles();

    // Achievements Slideshow
    initSlideshow();

    // Scroll Progress bar
    initScrollProgress();

    // Scroll Indicator fade
    initScrollIndicator();

    // Terminal typing code editor mockup
    initTerminalSimulator();
}

// Text Scrambler / Decrypt Animation
function scrambleText(element) {
    const originalText = element.getAttribute('data-original-text') || element.textContent;
    if (!element.getAttribute('data-original-text')) {
        element.setAttribute('data-original-text', originalText);
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%-+';
    let iterations = 0;
    const interval = setInterval(() => {
        element.textContent = originalText
            .split('')
            .map((char, index) => {
                if (char === ' ') return ' ';
                if (index < iterations) return originalText[index];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

        if (iterations >= originalText.length) {
            clearInterval(interval);
            element.textContent = originalText;
        }
        iterations += 1 / 3;
    }, 30);
}

// Rotating Profession Animation
function initHeroRoles() {
    const roleText = document.querySelector('.role-text');
    if (!roleText) return;

    const roles = [
        "Full Stack Developer",
        "Frontend Developer",
        "Java Developer",
        "MERN Stack Developer",
        "Open Source Learner",
        "Build Club Core Member",
        "Secretary • PSNA Agentblazers Club",
        "Problem Solver",
        "Hackathon Enthusiast"
    ];

    let roleIndex = 0;

    // Set first title initially
    roleText.textContent = roles[0];
    roleText.classList.add('slide-up-in');

    setInterval(() => {
        // Slide out current role
        roleText.classList.remove('slide-up-in');
        roleText.classList.add('slide-up-out');

        setTimeout(() => {
            // Update text index
            roleIndex = (roleIndex + 1) % roles.length;
            roleText.textContent = roles[roleIndex];

            // Position at bottom transparently
            roleText.classList.remove('slide-up-out');
            roleText.classList.add('slide-up-prep');

            // Force browser repaint/reflow
            roleText.offsetWidth;

            // Slide in
            roleText.classList.remove('slide-up-prep');
            roleText.classList.add('slide-up-in');
        }, 400);
    }, 2500);
}

// Slideshow for Achievements
function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    if (slides.length === 0) return;

    let currentSlide = 0;

    const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        slides[index].classList.add('active');
        if (indicators[index]) indicators[index].classList.add('active');
        currentSlide = index;
    };

    const nextSlide = () => {
        showSlide((currentSlide + 1) % slides.length);
    };

    const prevSlide = () => {
        showSlide((currentSlide - 1 + slides.length) % slides.length);
    };

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });

    let slideInterval = setInterval(nextSlide, 5000);

    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slideshowContainer.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
}

// Micro Code-Editor Terminal Simulation
function initTerminalSimulator() {
    const terminalBody = document.getElementById('terminal-code');
    if (!terminalBody) return;

    // Syntax Highlighted HTML code parts to render line-by-line
    const codeLines = [
        '<span class="code-keyword">const</span> <span class="code-normal">developer</span> = {',
        '    <span class="code-key">name</span>: <span class="code-string">"Ram Jeeva Sajan"</span>,',
        '    <span class="code-key">role</span>: <span class="code-string">"Full Stack Developer"</span>,',
        '    <span class="code-key">college</span>: <span class="code-string">"PSNA College of Engineering"</span>,',
        '    <span class="code-key">skills</span>: [',
        '        <span class="code-string">"Java"</span>,',
        '        <span class="code-string">"React"</span>,',
        '        <span class="code-string">"Node.js"</span>,',
        '        <span class="code-string">"MongoDB"</span>,',
        '        <span class="code-string">"Firebase"</span>',
        '    ]',
        '};',
        '',
        '<span class="code-normal">console</span>.<span class="code-method">log</span>(<span class="code-string">"Building impactful software..."</span>);'
    ];

    let currentLineIdx = 0;
    let currentCharIdx = 0;
    let activeLineEl = null;

    // Setup an initial state so the editor is never empty
    terminalBody.innerHTML = '<div class="terminal-line placeholder-line">&nbsp;</div>';

    function startTypingAnimation() {
        terminalBody.innerHTML = '';
        currentLineIdx = 0;
        currentCharIdx = 0;
        typeNextChar();
    }

    function typeNextChar() {
        if (currentLineIdx >= codeLines.length) {
            // End of script typing loop
            if (activeLineEl) activeLineEl.classList.remove('active-line');
            // Restart after 6 seconds of completion display
            setTimeout(startTypingAnimation, 6000);
            return;
        }

        const htmlLine = codeLines[currentLineIdx];

        if (currentCharIdx === 0) {
            if (activeLineEl) activeLineEl.classList.remove('active-line');
            activeLineEl = document.createElement('div');
            activeLineEl.className = 'terminal-line active-line';
            terminalBody.appendChild(activeLineEl);

            // Auto scroll container
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }

        if (htmlLine === '') {
            activeLineEl.innerHTML = '&nbsp;';
            currentLineIdx++;
            currentCharIdx = 0;
            setTimeout(typeNextChar, 250);
            return;
        }

        // Parse HTML tags immediately to only type actual text chars
        if (htmlLine.charAt(currentCharIdx) === '<') {
            const tagEnd = htmlLine.indexOf('>', currentCharIdx);
            activeLineEl.innerHTML += htmlLine.substring(currentCharIdx, tagEnd + 1);
            currentCharIdx = tagEnd + 1;
            typeNextChar(); // Recurse immediately for the text
        } else {
            activeLineEl.innerHTML += htmlLine.charAt(currentCharIdx);
            currentCharIdx++;

            if (currentCharIdx >= htmlLine.length) {
                currentLineIdx++;
                currentCharIdx = 0;
                setTimeout(typeNextChar, 350); // Pause on line end
            } else {
                // Random typing speed simulation
                const delay = Math.random() * 30 + 15;
                setTimeout(typeNextChar, delay);
            }
        }
    }

    // Trigger typing loop
    setTimeout(startTypingAnimation, 1000);
}

// Scroll Progress Tracker
function initScrollProgress() {
    const progressEl = document.createElement('div');
    progressEl.className = 'scroll-progress';
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.appendChild(progressEl);
    } else {
        document.body.appendChild(progressEl);
    }

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressEl.style.width = scrolled + '%';
    });
}

// Scroll Indicator Fade Out
function initScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            indicator.classList.add('fade-out');
        } else {
            indicator.classList.remove('fade-out');
        }
    });
}

// Popup Notification Handler
function showNotification(message, type) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 16px 28px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
        max-width: 320px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        backdrop-filter: blur(10px);
    `;

    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))';
        notification.style.border = '1px solid rgba(16, 185, 129, 0.3)';
    } else {
        notification.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))';
        notification.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 400);
    }, 4000);
}