// ============================================
// USP1 - The Digital Penny
// Interactive Script with Falling Pennies, Custom Cursor & Sound Effects
// ============================================

// ============================================
// SOUND EFFECTS (Web Audio API)
// ============================================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let soundsEnabled = true;

// Generate sound effects procedurally
function playSound(type) {
    if (!soundsEnabled) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch(type) {
            case 'click':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;

            case 'copy':
                oscillator.frequency.value = 1200;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
                break;

            case 'success':
                oscillator.frequency.value = 600;
                oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;

            case 'whoosh':
                oscillator.frequency.value = 400;
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;

            case 'coin':
                // Cha-ching cash register sound
                oscillator.type = 'sine';

                // First "cha" - higher pitch
                oscillator.frequency.value = 1200;
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05);
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);

                // Second "ching" - bell-like sustain
                const oscillator2 = audioContext.createOscillator();
                const gainNode2 = audioContext.createGain();
                oscillator2.connect(gainNode2);
                gainNode2.connect(audioContext.destination);

                oscillator2.type = 'sine';
                oscillator2.frequency.value = 1800;
                gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 0.05);
                gainNode2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.08);
                gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator2.start(audioContext.currentTime + 0.05);
                oscillator2.stop(audioContext.currentTime + 0.5);
                break;
        }
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// Make playSound globally available
window.playSound = playSound;

// ============================================
// FALLING PENNIES ANIMATION
// ============================================
const canvas = document.getElementById('falling-pennies');
const ctx = canvas.getContext('2d');

// Load penny image
const pennyImage = new Image();
pennyImage.src = 'usp_1-removebg-preview.png';
let imageLoaded = false;

pennyImage.onload = () => {
    imageLoaded = true;
    console.log('🪙 Penny image loaded successfully!');
};

pennyImage.onerror = () => {
    console.error('Failed to load penny image');
};

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Penny particle class
class Penny {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // Start at random position initially
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -80;
        this.size = Math.random() * 40 + 30; // 30-70px
        this.speedY = Math.random() * 1.5 + 0.8; // 0.8-2.3 pixels per frame (slower)
        this.speedX = (Math.random() - 0.5) * 0.8; // Slight horizontal drift
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;
        this.opacity = Math.random() * 0.25 + 0.15; // 0.15-0.4 opacity (lighter for white bg)
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.wobble) * 0.5; // Add wobble effect
        this.rotation += this.rotationSpeed;
        this.wobble += this.wobbleSpeed;

        // Reset when penny goes off screen
        if (this.y > canvas.height + 100) {
            this.reset();
        }

        // Keep within horizontal bounds
        if (this.x < -100) this.x = canvas.width + 100;
        if (this.x > canvas.width + 100) this.x = -100;
    }

    draw() {
        if (!imageLoaded) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw the actual penny image
        ctx.drawImage(
            pennyImage,
            -this.size / 2,
            -this.size / 2,
            this.size,
            this.size
        );

        ctx.restore();
    }
}

// Create penny particles
const pennies = [];
const pennyCount = 20; // Increased number of falling pennies

for (let i = 0; i < pennyCount; i++) {
    pennies.push(new Penny());
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pennies.forEach(penny => {
        penny.update();
        penny.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// ============================================
// INTERACTIVE PENNY BURST ON CLICK
// ============================================
let burstPennies = [];

class BurstPenny {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 30 + 20; // Larger burst pennies
        this.speedX = (Math.random() - 0.5) * 12;
        this.speedY = (Math.random() - 0.5) * 12 - 6; // Bias upward
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.4;
        this.opacity = 1;
        this.gravity = 0.6;
        this.life = 0;
        this.maxLife = 60; // frames
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.life++;
        this.opacity = 1 - (this.life / this.maxLife);
    }

    draw() {
        if (!imageLoaded) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw the actual penny image
        ctx.drawImage(
            pennyImage,
            -this.size / 2,
            -this.size / 2,
            this.size,
            this.size
        );

        ctx.restore();
    }

    isDead() {
        return this.life >= this.maxLife;
    }
}

// Click to create penny burst
document.addEventListener('click', (e) => {
    // Create burst of 8 pennies
    for (let i = 0; i < 8; i++) {
        burstPennies.push(new BurstPenny(e.clientX, e.clientY));
    }
    // Sound is only played when clicking the spinning coin
});

// Update burst pennies in animation loop
const originalAnimate = animate;
function animateWithBurst() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw falling pennies
    pennies.forEach(penny => {
        penny.update();
        penny.draw();
    });

    // Draw and update burst pennies
    burstPennies = burstPennies.filter(penny => {
        if (!penny.isDead()) {
            penny.update();
            penny.draw();
            return true;
        }
        return false;
    });

    requestAnimationFrame(animateWithBurst);
}

// Replace animation loop
animateWithBurst();

// ============================================
// PARTICLE TRAIL ON CURSOR MOVE
// ============================================
let cursorParticles = [];

class CursorParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.life = 0;
        this.maxLife = 30;
        this.color = '#F5A623';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        this.speedX *= 0.95;
        this.speedY *= 0.95;
    }

    draw() {
        const opacity = 1 - (this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = opacity * 0.6;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life >= this.maxLife;
    }
}

let lastParticleTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastParticleTime > 50) { // Create particle every 50ms
        cursorParticles.push(new CursorParticle(e.clientX, e.clientY));
        lastParticleTime = now;
    }
});

// Update animation loop to include cursor particles
function animateFull() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cursor particles
    cursorParticles = cursorParticles.filter(particle => {
        if (!particle.isDead()) {
            particle.update();
            particle.draw();
            return true;
        }
        return false;
    });

    // Draw falling pennies
    pennies.forEach(penny => {
        penny.update();
        penny.draw();
    });

    // Draw burst pennies
    burstPennies = burstPennies.filter(penny => {
        if (!penny.isDead()) {
            penny.update();
            penny.draw();
            return true;
        }
        return false;
    });

    requestAnimationFrame(animateFull);
}

// Start full animation
animateFull();

// ============================================
// GLOWING BUTTON EFFECT
// ============================================
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        playSound('whoosh');
    });
});

// ============================================
// VOLUME TOGGLE (Press 'M' to mute/unmute)
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
        soundsEnabled = !soundsEnabled;
        const msg = soundsEnabled ? 'Sounds ON 🔊' : 'Sounds OFF 🔇';

        // Show notification
        const notification = document.createElement('div');
        notification.textContent = msg;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #C87533, #F5A623);
            color: #0f0f0f;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
});

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('🪙 USP1 Interactive Features Loaded!');
console.log('💡 Press M to toggle sound effects');
console.log('🖱️ Click anywhere for penny burst animation!');
