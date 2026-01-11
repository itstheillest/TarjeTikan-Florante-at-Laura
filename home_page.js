/* ============================================
   GACHA GAME - MAIN PAGE NAVIGATION SCRIPT
   ============================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Get all enter buttons
    const enterButtons = document.querySelectorAll('.enter-button');
    
    // Add click event listeners to all buttons
    enterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target link from data attribute
            const targetLink = this.getAttribute('data-link');
            
            // Get the banner theme from parent banner-card
            const bannerCard = this.closest('.banner-card');
            const theme = bannerCard.getAttribute('data-theme');
            
            // Add animation class
            this.classList.add('button-clicked');
            
            // Navigate after short delay for animation, with banner parameter
            setTimeout(() => {
                window.location.href = `${targetLink}?banner=${theme}`;
            }, 300);
        });
    });
    
    // Add parallax effect to banner cards on mouse move
    const bannerCards = document.querySelectorAll('.banner-card');
    
    bannerCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            const background = card.querySelector('.banner-background');
            background.style.transform = `scale(1.1) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', function() {
            const background = card.querySelector('.banner-background');
            background.style.transform = 'scale(1)';
        });
    });
    
// Set initial state - cards start above and invisible
bannerCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(-30px)';
});

// Animate in
setTimeout(() => {
    bannerCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transition = 'opacity 600ms ease, transform 600ms ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100); // Stagger each card by 100ms
    });
}, 200);
    
    // Add ripple effect on button click
    enterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Console message for developers
    console.log('%c🎮 Gacha Game Main Page Loaded', 'color: #3498db; font-size: 16px; font-weight: bold;');
    console.log('%cBanner cards:', 'color: #2ecc71; font-weight: bold;');
    console.log('- Madilim na Kagubatan (Forest) - Chapters 1-7');
    console.log('- Pag-aaral sa Atenas (Athens) - Chapters 8-15');
    console.log('- Digmaan at Trahedya (War) - Chapters 17-25');
    console.log('- Pagwawakas at Katapusan (Conclusion) - Chapters 25-30');
    
});

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .enter-button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .button-clicked {
        animation: button-press 0.3s ease;
    }
    
    @keyframes button-press {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(0.95);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Function to detect mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Function to preload images (optional - can be used to improve loading)
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Example usage (uncomment when you have actual images):
/*
preloadImages([
    'forest-background.png',
    'athens-background.png',
    'war-background.png',
    'conclusion-background.png'
]);
*/

// Detect device type and log
if (isMobileDevice()) {
    console.log('%c📱 Mobile device detected', 'color: #e74c3c;');
} else {
    console.log('%c💻 Desktop device detected', 'color: #9b59b6;');
}