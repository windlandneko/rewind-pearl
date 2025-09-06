document.addEventListener('DOMContentLoaded', function() {
    initSmoothScroll();
    initScrollAnimations();
    initSimpleParticles();
    initHeroAnimations();
    addNavbarScroll();
});

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.resume-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function initSimpleParticles() {
    const heroSection = document.querySelector('.hero-section');
    
    for (let i = 0; i < 20; i++) {
        createSimpleParticle(heroSection);
    }
    
    setInterval(() => {
        createSimpleParticle(heroSection);
    }, 5000);
}

function createSimpleParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'simple-particle';
    
    particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(255, 107, 157, 0.6);
        border-radius: 50%;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: 100%;
        box-shadow: 0 0 5px rgba(255, 107, 157, 0.5);
    `;
    
    container.appendChild(particle);
    
    const animationDuration = Math.random() * 8000 + 6000;
    
    particle.animate([
        {
            transform: `translateY(0px)`,
            opacity: 0
        },
        {
            transform: `translateY(-${window.innerHeight + 50}px)`,
            opacity: 1
        }
    ], {
        duration: animationDuration,
        easing: 'linear'
    }).addEventListener('finish', () => {
        particle.remove();
    });
}

function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    
    setTimeout(() => {
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'translateY(0)';
    }, 500);
    
    setTimeout(() => {
        heroDescription.style.opacity = '1';
        heroDescription.style.transform = 'translateY(0)';
    }, 800);
    
    [heroTitle, heroDescription].forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });
}

function addNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.9)';
            navbar.style.boxShadow = 'none';
        }
    });
}

