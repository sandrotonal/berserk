// Initialize variables first
        const splash = document.getElementById('splash');
        const main = document.getElementById('main');
        const nav = document.getElementById('nav');
        const navLinks = document.getElementById('navLinks');
        const menuBtn = document.getElementById('menuBtn');
        const progress = document.getElementById('progress');
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        const contactForm = document.getElementById('contactForm');

        let particles = [];
        const particleCount = 30;
        let width = 0;
        let height = 0;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Resize
        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        // Particle
        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedY = Math.random() * 0.3 + 0.1;
                this.speedX = (Math.random() - 0.5) * 0.2;
                this.opacity = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                if (this.y > height) {
                    this.y = 0;
                    this.x = Math.random() * width;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 48, 48, ${this.opacity})`;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            if (prefersReducedMotion) return;
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }

        // Hide splash
        function hideSplash() {
            setTimeout(() => {
                splash.classList.add('hidden');
                main.classList.add('visible');
            }, 3500);
        }

        // Scroll progress
        function updateProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const p = docHeight > 0 ? scrollTop / docHeight : 0;
            progress.style.transform = `scaleX(${p})`;
        }

        // Nav scroll
        function handleScroll() {
            if (window.scrollY > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }

        // Reveal
        function setupReveal() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, i * 100);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.chronicle-item').forEach(el => observer.observe(el));
        }

        // Mobile menu
        function toggleMenu() {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('open');
        }

        // Form
        async function handleSubmit(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const resultParagraph = document.getElementById('form-result');
            const modal = document.getElementById('success-modal');
            const modalContent = document.getElementById('success-modal-content');
            
            const originalText = btn.textContent;
            btn.textContent = 'SENDING...';
            btn.disabled = true;
            resultParagraph.textContent = '';

            const formData = new FormData(e.target);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });
                
                const result = await response.json();
                
                if (response.status == 200) {
                    btn.textContent = 'SENT';
                    e.target.reset();

                    // Animasyonlu Modal'i Göster
                    modal.classList.remove('opacity-0', 'pointer-events-none');
                    modal.classList.add('opacity-100');
                    modalContent.classList.remove('scale-75');
                    modalContent.classList.add('scale-100');

                    // Close Modal after 3 seconds
                    setTimeout(() => {
                        modal.classList.remove('opacity-100');
                        modal.classList.add('opacity-0', 'pointer-events-none');
                        modalContent.classList.remove('scale-100');
                        modalContent.classList.add('scale-75');
                    }, 3000);

                } else {
                    console.log(response);
                    resultParagraph.textContent = result.message || "An error occurred.";
                    btn.textContent = originalText;
                }
            } catch (error) {
                console.log(error);
                resultParagraph.textContent = "Connection lost. Please try again.";
                btn.textContent = originalText;
            } finally {
                btn.disabled = false;
                setTimeout(() => {
                    btn.textContent = 'SEND MESSAGE';
                    resultParagraph.textContent = '';
                }, 4000);
            }
        }

        // Init
        function init() {
            resize();
            initParticles();
            
            if (!prefersReducedMotion) {
                animateParticles();
            }

            hideSplash();
            setupReveal();

            window.addEventListener('resize', resize);
            window.addEventListener('scroll', () => {
                updateProgress();
                handleScroll();
            });

            menuBtn.addEventListener('click', toggleMenu);
            contactForm.addEventListener('submit', handleSubmit);

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    menuBtn.classList.remove('active');
                    navLinks.classList.remove('open');
                });
            });
        }

        init();