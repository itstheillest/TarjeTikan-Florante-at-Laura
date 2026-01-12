// ========================================
// GENSHIN-STYLE LOADING CONTROLLER
// ========================================

// Get DOM elements
const flowGlow = document.getElementById('flowGlow');
const loadingPercentage = document.getElementById('loadingPercentage');
const iconCircles = document.querySelectorAll('.icon-circle');
const iconsContainer = document.querySelector('.icons-container');
const loadingScreen = document.querySelector('.loading-screen');

// Loading configuration
const TOTAL_DURATION = 4000; // Total loading time in milliseconds
const ICON_COUNT = iconCircles.length;
const TIME_PER_ICON = TOTAL_DURATION / ICON_COUNT;

// Page transition configuration
const NEXT_PAGE = 'home_page.html'; // Change this to your next page filename
const TRANSITION_DELAY = 500; // Delay before transition starts (ms)
const FADE_DURATION = 800; // Fade out duration (ms)

// Current progress
let currentProgress = 0;
let currentIconIndex = 0;

async function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error("Failed: " + src));
        img.src = src;
    });
}

async function preloadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => resolve(src);
        s.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(s);
    });
}

// Minimal: ensure cards exist before leaving loading screen
async function preloadCritical() {
    // Load the cards database BEFORE leaving loading screen
    await preloadScript("cards.js");

    // Optional but recommended: preload all card images once cards exist
    const cards = Array.isArray(window.CARDS) ? window.CARDS : [];
    const images = cards.map(c => c.image).filter(Boolean);

    // Also preload common UI images you always use
    images.push("Cards/CARDBACKART.png");

    await Promise.allSettled(images.map(preloadImage));
}


// ========================================
// CALCULATE ICON POSITIONS
// ========================================

function getIconPosition(index) {
    const icon = iconCircles[index];
    const containerRect = iconsContainer.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    
    // Calculate position relative to container
    const relativeLeft = iconRect.left - containerRect.left + (iconRect.width / 2);
    
    return relativeLeft;
}

// ========================================
// ANIMATE GLOW TO ICON
// ========================================

function animateToIcon(index, duration) {
    return new Promise((resolve) => {
        // Show glow if first icon
        if (index === 0) {
            flowGlow.classList.add('active');
        }
        
        // Get target position
        const targetPosition = getIconPosition(index);
        
        // Activate current icon
        iconCircles[index].classList.add('active');
        
        // Animate glow to position
        flowGlow.style.transition = `left ${duration}ms ease-in-out`;
        flowGlow.style.left = targetPosition + 'px';
        
        // Update percentage
        const progress = ((index + 1) / ICON_COUNT) * 100;
        currentProgress = progress;
        
        // Animate percentage counting
        animatePercentage(progress, duration);
        
        // Wait for animation to complete
        setTimeout(() => {
            // Deactivate current icon, mark as completed
            iconCircles[index].classList.remove('active');
            iconCircles[index].classList.add('completed');
            resolve();
        }, duration);
    });
}

// ========================================
// ANIMATE PERCENTAGE COUNTER
// ========================================

function animatePercentage(targetPercent, duration) {
    const startPercent = currentProgress;
    const startTime = performance.now();
    
    function updatePercent(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth counting
        const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentPercent = startPercent + (targetPercent - startPercent) * easeProgress;
        loadingPercentage.textContent = Math.floor(currentPercent) + '%';
        
        if (progress < 1) {
            requestAnimationFrame(updatePercent);
        } else {
            loadingPercentage.textContent = Math.floor(targetPercent) + '%';
        }
    }
    
    requestAnimationFrame(updatePercent);
}

// ========================================
// MAIN LOADING SEQUENCE
// ========================================

async function startLoadingSequence() {
    await preloadCritical();

    // Position glow at first icon initially
    const firstIconPosition = getIconPosition(0);
    flowGlow.style.left = firstIconPosition + 'px';
    flowGlow.style.transition = 'none';
    
    // Small delay before starting
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Animate through each icon
    for (let i = 0; i < ICON_COUNT; i++) {
        await animateToIcon(i, TIME_PER_ICON);
        
        // Small pause between icons (except for the last one)
        if (i < ICON_COUNT - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Fade out glow
    flowGlow.style.opacity = '0';
    
    // Loading complete
    setTimeout(() => {
        onLoadingComplete();
    }, 500);
}

// ========================================
// LOADING COMPLETE HANDLER
// ========================================

function onLoadingComplete() {
    console.log('Loading complete! Transitioning to next page...');
    
    // Wait for the specified delay
    setTimeout(() => {
        // Start fade out transition
        fadeOutAndRedirect();
    }, TRANSITION_DELAY);
}

// ========================================
// FADE OUT AND REDIRECT
// ========================================

function fadeOutAndRedirect() {
    // Add fade out effect
    loadingScreen.style.transition = `opacity ${FADE_DURATION}ms ease-out`;
    loadingScreen.style.opacity = '0';
    
    // Wait for fade to complete, then redirect
    setTimeout(() => {
        // Redirect to next page
        window.location.href = NEXT_PAGE;
    }, FADE_DURATION);
}

// ========================================
// ALTERNATIVE TRANSITION METHODS
// ========================================

// OPTION 1: Slide out transition (uncomment to use instead of fade)
/*
function slideOutAndRedirect() {
    loadingScreen.style.transition = `transform ${FADE_DURATION}ms ease-out`;
    loadingScreen.style.transform = 'translateY(-100%)';
    
    setTimeout(() => {
        window.location.href = NEXT_PAGE;
    }, FADE_DURATION);
}
*/

// OPTION 2: Zoom out transition (uncomment to use instead of fade)
/*
function zoomOutAndRedirect() {
    loadingScreen.style.transition = `all ${FADE_DURATION}ms ease-out`;
    loadingScreen.style.transform = 'scale(1.5)';
    loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = NEXT_PAGE;
    }, FADE_DURATION);
}
*/

// OPTION 3: Show hidden main content instead of redirect
/*
function showMainContent() {
    loadingScreen.style.transition = `opacity ${FADE_DURATION}ms ease-out`;
    loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        
        // Show your main content
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.opacity = '0';
            
            // Fade in main content
            setTimeout(() => {
                mainContent.style.transition = 'opacity 500ms ease-in';
                mainContent.style.opacity = '1';
            }, 50);
        }
    }, FADE_DURATION);
}
*/

// ========================================
// HANDLE WINDOW RESIZE
// ========================================

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate positions on resize if loading is in progress
        if (currentIconIndex < ICON_COUNT && currentIconIndex > 0) {
            const currentPosition = getIconPosition(currentIconIndex);
            flowGlow.style.transition = 'none';
            flowGlow.style.left = currentPosition + 'px';
        }
    }, 100);
});

// ========================================
// PRELOAD NEXT PAGE (OPTIONAL)
// ========================================

// This helps the next page load faster
function preloadNextPage() {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = NEXT_PAGE;
    document.head.appendChild(link);
}

// ========================================
// INITIALIZE LOADING ON PAGE LOAD
// ========================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('Starting Genshin-style loading sequence...');
    
    // Preload the next page in the background
    preloadNextPage();
    
    // Start the loading animation
    setTimeout(() => {
        startLoadingSequence();
    }, 500);
});

// ========================================
// PREVENT ACCIDENTAL PAGE LEAVE DURING LOADING
// ========================================

let loadingComplete = false;

window.addEventListener('beforeunload', (e) => {
    if (!loadingComplete) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Update loading complete status
function onLoadingComplete() {
    loadingComplete = true;
    console.log('Loading complete! Transitioning to next page...');
    
    setTimeout(() => {
        fadeOutAndRedirect();
    }, TRANSITION_DELAY);

}

