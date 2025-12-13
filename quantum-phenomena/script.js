// Game State
const gameState = {
    xp: 0,
    level: 1,
    unlocked: {
        hydrogen: true,
        helium: false,
    }
};

const ELEMENTS = {
    hydrogen: {
        name: "氫 (Hydrogen)",
        lines: [
            { w: 656.3, color: "rgb(255, 0, 0)", intensity: 1.0 },   // H-alpha
            { w: 486.1, color: "rgb(0, 255, 255)", intensity: 0.8 }, // H-beta
            { w: 434.0, color: "rgb(0, 0, 255)", intensity: 0.4 },   // H-gamma
            { w: 410.2, color: "rgb(138, 43, 226)", intensity: 0.3 } // H-delta
        ]
    },
    helium: {
        name: "氦 (Helium)",
        lines: [
            { w: 706.5, color: "rgb(255, 0, 0)", intensity: 0.5 },
            { w: 667.8, color: "rgb(255, 50, 0)", intensity: 0.8 },
            { w: 587.6, color: "rgb(255, 255, 0)", intensity: 1.0 },
            { w: 501.6, color: "rgb(0, 255, 150)", intensity: 0.6 },
            { w: 492.2, color: "rgb(0, 200, 200)", intensity: 0.4 },
            { w: 471.3, color: "rgb(50, 50, 255)", intensity: 0.3 },
            { w: 447.1, color: "rgb(0, 0, 255)", intensity: 0.5 }
        ]
    },
    neon: {
        name: "氖 (Neon)",
        lines: [
            { w: 640.2, color: "rgb(255, 50, 50)", intensity: 1.0 },
            { w: 633.4, color: "rgb(255, 70, 0)", intensity: 0.9 },
            { w: 614.3, color: "rgb(255, 100, 0)", intensity: 0.8 },
            { w: 585.2, color: "rgb(255, 200, 0)", intensity: 0.7 },
            { w: 540.0, color: "rgb(0, 255, 0)", intensity: 0.2 }
        ]
    },
    mercury: {
        name: "汞 (Mercury)",
        lines: [
            { w: 579.0, color: "rgb(255, 255, 0)", intensity: 0.8 },
            { w: 546.1, color: "rgb(0, 255, 0)", intensity: 1.0 },
            { w: 435.8, color: "rgb(0, 0, 255)", intensity: 0.9 },
            { w: 404.7, color: "rgb(138, 43, 226)", intensity: 0.6 }
        ]
    }
};

// Navigation
function navigateTo(pageId) {
    document.querySelectorAll('.sub-page').forEach(el => el.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.target === pageId) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if (pageId === 'spectrum') drawBlankSpectrum();
    if (pageId === 'transitions') initAtom();
    if (pageId === 'photoelectric') updatePE();
    if (pageId === 'duality') initDuality();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        navigateTo(e.target.dataset.target);
    });
});

// Gamification
function gainXP(amount) {
    const oldLevel = gameState.level;
    gameState.xp += amount;
    const maxXP = gameState.level * 100;

    if (gameState.xp >= maxXP) {
        gameState.level++;
        gameState.xp -= maxXP;
        alert(`🎉 恭喜升級！現在是 Level ${gameState.level}`);
        document.getElementById('level-display').innerText = `Level ${gameState.level}: 研究員`;
    }

    const percentage = (gameState.xp / (gameState.level * 100)) * 100;
    document.getElementById('xp-bar').style.width = `${percentage}%`;
}


// --- Spectrum Analyzer ---
const specCanvas = document.getElementById('spectrum-canvas');
const specCtx = specCanvas.getContext('2d');

function drawBlankSpectrum() {
    specCtx.fillStyle = '#000';
    specCtx.fillRect(0, 0, specCanvas.width, specCanvas.height);

    specCtx.strokeStyle = '#555';
    specCtx.lineWidth = 1;
    specCtx.beginPath();
    specCtx.moveTo(0, specCanvas.height - 30);
    specCtx.lineTo(specCanvas.width, specCanvas.height - 30);
    specCtx.stroke();

    for (let i = 400; i <= 750; i += 50) {
        const x = mapWavelengthToX(i);
        specCtx.fillStyle = '#888';
        specCtx.fillText(`${i} nm`, x - 15, specCanvas.height - 10);
        specCtx.fillRect(x, specCanvas.height - 35, 1, 5);
    }
}

function mapWavelengthToX(nm) {
    const minNm = 380;
    const maxNm = 750;
    return ((nm - minNm) / (maxNm - minNm)) * specCanvas.width;
}

document.getElementById('analyze-btn').addEventListener('click', () => {
    const elementKey = document.getElementById('element-selector').value;
    const element = ELEMENTS[elementKey];
    drawSpectrum(element);
    document.getElementById('spectrum-readout').innerText = `正在分析 ${element.name}... 發現 ${element.lines.length} 條主要光譜線`;
    gainXP(10);
});

function drawSpectrum(element) {
    drawBlankSpectrum();
    element.lines.forEach(line => {
        const x = mapWavelengthToX(line.w);
        specCtx.shadowBlur = 15;
        specCtx.shadowColor = line.color;
        specCtx.fillStyle = line.color;
        const width = 2 + (line.intensity * 3);
        specCtx.fillRect(x - width / 2, 20, width, specCanvas.height - 50);
        specCtx.shadowBlur = 0;
    });
}

// --- Atom Transitions ---
const atomCanvas = document.getElementById('atom-canvas');
const atomCtx = atomCanvas.getContext('2d');
let electrons = [];
let photons = [];
let atomState = 1;

function initAtom() {
    electrons = [{ n: 1, angle: 0, speed: 0.05 }];
    photons = [];
    atomState = 1;
    drawAtom();
    animateAtom();
}

function getRadius(n) {
    return 40 + (n * 30);
}

function drawAtom() {
    atomCtx.fillStyle = 'rgba(0,0,0,0.2)';
    atomCtx.clearRect(0, 0, atomCanvas.width, atomCanvas.height);

    const cx = atomCanvas.width / 2;
    const cy = atomCanvas.height / 2;

    atomCtx.beginPath();
    atomCtx.arc(cx, cy, 10, 0, Math.PI * 2);
    atomCtx.fillStyle = '#ff5555';
    atomCtx.fill();
    atomCtx.shadowBlur = 10;
    atomCtx.shadowColor = '#ff5555';
    atomCtx.shadowBlur = 0;

    for (let n = 1; n <= 4; n++) {
        atomCtx.beginPath();
        atomCtx.arc(cx, cy, getRadius(n), 0, Math.PI * 2);
        atomCtx.strokeStyle = 'rgba(255,255,255,0.2)';
        atomCtx.stroke();
    }

    electrons.forEach(elec => {
        const r = getRadius(elec.n);
        const x = cx + Math.cos(elec.angle) * r;
        const y = cy + Math.sin(elec.angle) * r;

        atomCtx.beginPath();
        atomCtx.arc(x, y, 6, 0, Math.PI * 2);
        atomCtx.fillStyle = '#58a6ff';
        atomCtx.fill();
        atomCtx.shadowBlur = 10;
        atomCtx.shadowColor = '#58a6ff';
        atomCtx.shadowBlur = 0;
    });

    photons.forEach(p => {
        atomCtx.save();
        atomCtx.translate(p.x, p.y);
        atomCtx.beginPath();
        atomCtx.moveTo(-10, 0);
        atomCtx.strokeStyle = p.color;
        atomCtx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            atomCtx.lineTo(-10 + i * 5 + 2.5, 5);
            atomCtx.lineTo(-10 + i * 5 + 5, -5);
        }
        atomCtx.stroke();
        atomCtx.restore();
    });
}

function animateAtom() {
    if (!document.getElementById('transitions').classList.contains('active')) return;

    const cx = atomCanvas.width / 2;
    const cy = atomCanvas.height / 2;

    electrons.forEach(elec => {
        elec.angle += elec.speed / elec.n;
    });

    for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i];
        if (p.direction === 'in') {
            const dx = cx - p.x;
            const dy = cy - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            p.x += (dx / dist) * 3;
            p.y += (dy / dist) * 3;

            if (dist < getRadius(p.targetN)) {
                absorbPhoton(p);
                photons.splice(i, 1);
            }
        } else {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > atomCanvas.width || p.y < 0 || p.y > atomCanvas.height) {
                photons.splice(i, 1);
            }
        }
    }

    drawAtom();
    requestAnimationFrame(animateAtom);
}

function absorbPhoton(p) {
    const currentN = electrons[0].n;

    if (p.energy > 0) {
        if (electrons[0].n < p.targetN) {
            electrons[0].n = p.targetN;
            document.getElementById('transition-log').innerText = `吸收光子！電子躍遷至 n=${electrons[0].n}`;
            gainXP(20);
            setTimeout(() => {
                relaxElectron();
            }, 2000 + Math.random() * 2000);
        }
    }
}

function relaxElectron() {
    const e = electrons[0];
    if (e.n > 1) {
        const startN = e.n;
        e.n = 1;
        emitPhoton(startN, 1);
        document.getElementById('transition-log').innerText = `電子不穩定，躍遷回 n=1，釋放光子！`;
    }
}

function emitPhoton(n1, n2) {
    const cx = atomCanvas.width / 2;
    const cy = atomCanvas.height / 2;
    const angle = Math.random() * Math.PI * 2;

    photons.push({
        x: cx + Math.cos(angle) * getRadius(n1),
        y: cy + Math.sin(angle) * getRadius(n2),
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        direction: 'out',
        color: getColorForTransition(n1, n2)
    });
}

function getColorForTransition(nFrom, nTo) {
    if (nTo === 1) return '#bc8cff';
    if (nTo === 2) return '#ff5555';
    return '#ffffff';
}

document.querySelectorAll('.photon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const energy = parseFloat(e.target.dataset.energy);
        let targetN = 1;
        const text = e.target.innerText;
        if (text.includes('1 to 2')) targetN = 2;
        if (text.includes('1 to 3')) targetN = 3;
        if (text.includes('2 to 3')) targetN = 3;

        const currentN = electrons[0].n;
        if (text.includes(`${currentN} to`)) {
            spawnIncomingPhoton(targetN, energy);
        } else {
            document.getElementById('transition-log').innerText = `無效操作：電子目前在 n=${currentN}，無法接受此能量光子。`;
        }
    });
});

function spawnIncomingPhoton(targetN, energy) {
    const cx = atomCanvas.width / 2;
    const cy = atomCanvas.height / 2;
    photons.push({
        x: 0,
        y: cy,
        direction: 'in',
        targetN: targetN,
        energy: energy,
        color: '#ffffaa'
    });
}

// --- Photoelectric Effect ---
const peCanvas = document.getElementById('pe-canvas');
const peCtx = peCanvas.getContext('2d');
let peElectrons = [];

// Physics Constants
const h_eV_nm = 1240; // Plank's constant in eV*nm

function updatePE() {
    const wavelength = document.getElementById('pe-wavelength').value;
    const intensity = document.getElementById('pe-intensity').value;
    const workFunction = parseFloat(document.getElementById('metal-selector').value);

    // Calculate values
    const photonEnergy = h_eV_nm / wavelength;
    const kineticEnergy = Math.max(0, photonEnergy - workFunction);
    const hasCurrent = kineticEnergy > 0 && intensity > 0;

    // Update display
    document.getElementById('wavelength-display').innerText = `${wavelength} nm`;
    document.getElementById('intensity-display').innerText = `${intensity}%`;
    document.getElementById('photon-energy').innerText = photonEnergy.toFixed(2);
    document.getElementById('kinetic-energy').innerText = kineticEnergy.toFixed(2);

    const statusEl = document.getElementById('current-status');
    if (hasCurrent) {
        statusEl.innerText = "有電流 (光電子逸出)";
        statusEl.style.color = "#58a6ff";
    } else {
        statusEl.innerText = "無電流 (能量不足)";
        statusEl.style.color = "#ff7b72";
    }

    // Determine light color
    const color = wavelengthToColor(wavelength);

    drawPESetup(color, intensity, hasCurrent);

    // Spawn electrons logic
    if (hasCurrent && Math.random() < (intensity / 100) * 0.2) { // Random chance proportional to intensity
        spawnPEElectron(kineticEnergy);
    }

    updatePEElectrons();
}

function wavelengthToColor(wavelength) {
    if (wavelength < 440) return '#8b00ff';
    if (wavelength < 490) return '#0000ff';
    if (wavelength < 510) return '#00ff00';
    if (wavelength < 580) return '#ffff00';
    if (wavelength < 645) return '#ff7f00';
    return '#ff0000';
}

function spawnPEElectron(ke) {
    // Speed roughly sqrt(KE). Just for viz
    const speed = 1 + Math.sqrt(ke) * 2;
    peElectrons.push({
        x: 100, // Plate position
        y: 100 + Math.random() * 100,
        vx: speed,
        vy: (Math.random() - 0.5) * speed * 0.5
    });
}

function updatePEElectrons() {
    peElectrons.forEach(e => {
        e.x += e.vx;
        e.y += e.vy;
    });
    // Remove out of bounds
    peElectrons = peElectrons.filter(e => e.x < peCanvas.width);
}

function drawPESetup(lightColor, intensity, hasCurrent) {
    peCtx.clearRect(0, 0, peCanvas.width, peCanvas.height);

    // Metal Plate (Cathode)
    peCtx.fillStyle = '#aaa';
    peCtx.fillRect(50, 100, 50, 100);
    peCtx.fillStyle = '#fff';
    peCtx.fillText("金屬板", 55, 90);

    // Anode
    peCtx.fillStyle = '#666';
    peCtx.fillRect(500, 100, 20, 100);

    // Light Source
    peCtx.save();
    peCtx.beginPath();
    peCtx.moveTo(0, 0);

    // Rays
    peCtx.strokeStyle = lightColor;
    peCtx.lineWidth = 2 + (intensity / 20); // Width represents intensity roughly
    peCtx.globalAlpha = 0.5 + (intensity / 200);

    for (let i = 0; i < 5; i++) {
        peCtx.moveTo(20, 20);
        peCtx.lineTo(75, 110 + i * 20);
    }
    peCtx.stroke();
    peCtx.restore();

    // Electrons
    peCtx.fillStyle = '#58a6ff'; // Electron blue
    peElectrons.forEach(e => {
        peCtx.beginPath();
        peCtx.arc(e.x, e.y, 3, 0, Math.PI * 2);
        peCtx.fill();
    });

    // Ammeter (Wire loop)
    peCtx.strokeStyle = hasCurrent ? '#58a6ff' : '#555';
    peCtx.lineWidth = 2;
    peCtx.beginPath();
    peCtx.moveTo(75, 200); // from plate
    peCtx.lineTo(75, 250);
    peCtx.lineTo(510, 250);
    peCtx.lineTo(510, 200); // to anode
    peCtx.stroke();

    // Meter circle
    peCtx.fillStyle = '#000';
    peCtx.fillRect(280, 230, 40, 40);
    peCtx.strokeRect(280, 230, 40, 40);
    peCtx.fillStyle = hasCurrent ? '#58a6ff' : '#555';
    peCtx.font = "20px monospace";
    peCtx.fillText(hasCurrent ? "A" : "0", 292, 257);
}

// Add event listeners for PE sliders
document.getElementById('pe-wavelength').addEventListener('input', updatePE);
document.getElementById('pe-intensity').addEventListener('input', updatePE);
document.getElementById('metal-selector').addEventListener('change', updatePE);


// --- Wave-Particle Duality ---
const dualCanvas = document.getElementById('dual-canvas');
const dualCtx = dualCanvas.getContext('2d');
let dualityMode = 'particle';
let dualParticles = [];
let dualAnimationId;

function initDuality() {
    dualParticles = [];
    if (dualAnimationId) cancelAnimationFrame(dualAnimationId);
    animateDuality();
}

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        dualityMode = e.target.dataset.mode;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Reset explanation
        const expl = document.getElementById('duality-explanation');
        if (dualityMode === 'particle') {
            expl.innerText = "粒子模式：子彈穿過狹縫，在牆上形成兩條明顯的堆積帶。";
        } else {
            expl.innerText = "波動模式：波通過雙狹縫產生干涉，形成明暗相間的條紋。";
            gainXP(30); // Bonus for finding this
        }

        initDuality();
    });
});

function animateDuality() {
    if (!document.getElementById('duality').classList.contains('active')) return;

    dualCtx.fillStyle = 'rgba(0,0,0,0.1)'; // Trail/Fade
    if (dualityMode === 'wave') dualCtx.fillStyle = 'rgba(0,0,0,1)'; // No trails for wave viz repainting

    dualCtx.fillRect(0, 0, dualCanvas.width, dualCanvas.height);

    drawSlits();

    if (dualityMode === 'particle') {
        spawnDualParticle();
        updateDualParticles();
    } else {
        drawWaves();
    }

    dualAnimationId = requestAnimationFrame(animateDuality);
}

function drawSlits() {
    dualCtx.fillStyle = '#444';
    // Wall
    const wallX = 200;
    dualCtx.fillRect(wallX, 0, 10, dualCanvas.height);

    // Openings
    dualCtx.clearRect(wallX, dualCanvas.height / 2 - 40, 10, 20); // Top slit
    dualCtx.clearRect(wallX, dualCanvas.height / 2 + 20, 10, 20); // Bottom slit
}

function spawnDualParticle() {
    // Spawn from left
    dualParticles.push({
        x: 0,
        y: dualCanvas.height / 2 + (Math.random() - 0.5) * 100, // spread source
        vx: 3,
        vy: (Math.random() - 0.5) * 0.5,
        passedSlit: false
    });
}

function updateDualParticles() {
    const wallX = 200;

    dualCtx.fillStyle = '#fff';

    for (let i = dualParticles.length - 1; i >= 0; i--) {
        const p = dualParticles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Check wall collision
        if (!p.passedSlit && Math.abs(p.x - wallX) < 5) {
            // Check if in slit Y range
            const inSlit1 = (p.y > dualCanvas.height / 2 - 40 && p.y < dualCanvas.height / 2 - 20);
            const inSlit2 = (p.y > dualCanvas.height / 2 + 20 && p.y < dualCanvas.height / 2 + 40);

            if (inSlit1 || inSlit2) {
                p.passedSlit = true;
                // Scatter slightly
                p.vy += (Math.random() - 0.5) * 2;
            } else {
                // Hit wall
                dualParticles.splice(i, 1);
                continue;
            }
        }

        // Draw particle
        dualCtx.beginPath();
        dualCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        dualCtx.fill();

        // Hit screen
        if (p.x > dualCanvas.width - 20) {
            drawImpact(p.y);
            dualParticles.splice(i, 1);
        }
    }
}

// Persist accumulation on screen for particle mode?
// Hard to do with canvas clear. Let's draw accumulation bars overlay.
// Or just let them hit and vanish.
// Let's add a fake "accumulation graph" on the right.

let impactHistory = [];
function drawImpact(y) {
    impactHistory.push(y);
    if (impactHistory.length > 200) impactHistory.shift();
}
// Actually, let's draw the distribution curve on the right edge
function drawDistributionCurve() {
    // TODO: if we want to make it look nice.
    // For now, let's just keep simple particles.
}


let wavePhase = 0;
function drawWaves() {
    wavePhase += 0.2;
    const wallX = 200;

    // Draw incoming plane waves
    dualCtx.strokeStyle = 'rgba(88, 166, 255, 0.5)';
    dualCtx.lineWidth = 2;
    for (let x = 0; x < wallX; x += 20) {
        let drawX = (x + wavePhase * 10) % wallX;
        dualCtx.beginPath();
        dualCtx.moveTo(drawX, 0);
        dualCtx.lineTo(drawX, dualCanvas.height);
        dualCtx.stroke();
    }

    // Draw interference waves from slits
    // Slit 1
    drawRadialWave(wallX, dualCanvas.height / 2 - 30, wavePhase);
    // Slit 2
    drawRadialWave(wallX, dualCanvas.height / 2 + 30, wavePhase);

    // Draw Intensity Pattern on Screen
    const screenX = dualCanvas.width - 10;
    dualCtx.strokeStyle = '#bc8cff';
    dualCtx.lineWidth = 3;
    dualCtx.beginPath();

    for (let y = 0; y < dualCanvas.height; y += 2) {
        // Calculate theoretical intensity
        // Path difference to two slits
        const slit1Y = dualCanvas.height / 2 - 30;
        const slit2Y = dualCanvas.height / 2 + 30;

        const d1 = Math.sqrt(Math.pow(screenX - wallX, 2) + Math.pow(y - slit1Y, 2));
        const d2 = Math.sqrt(Math.pow(screenX - wallX, 2) + Math.pow(y - slit2Y, 2));

        // Phase difference (k * delta_d)
        // wavelength approx 20px
        const lambda = 20;
        const phaseDiff = (2 * Math.PI / lambda) * (d2 - d1);

        // Intensity ~ cos^2(phaseDiff/2)
        const intensity = Math.cos(phaseDiff / 2) * Math.cos(phaseDiff / 2);

        const barLength = intensity * 50;
        if (y === 0) dualCtx.moveTo(screenX - barLength, y);
        else dualCtx.lineTo(screenX - barLength, y);
    }
    dualCtx.stroke();
}

function drawRadialWave(cx, cy, phase) {
    dualCtx.strokeStyle = 'rgba(88, 166, 255, 0.3)';
    for (let r = 0; r < 400; r += 20) {
        let drawR = (r + phase * 10) % 400;
        dualCtx.beginPath();
        dualCtx.arc(cx, cy, drawR, -Math.PI / 2, Math.PI / 2); // Right semicircle
        dualCtx.stroke();
    }
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    drawBlankSpectrum();
    initAtom();

    // Animation Loops
    animateAtom();

    // Create loop for Photoelectric (it's updated by events mostly but animation runs)
    const peLoop = () => {
        if (document.getElementById('photoelectric').classList.contains('active')) {
            updatePE(); // Re-draws and updates electrons
        }
        requestAnimationFrame(peLoop);
    };
    peLoop();
});
