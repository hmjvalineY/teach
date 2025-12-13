class WaveSimulator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Simulation Parameters
        this.time = 0;
        this.speed = 2.0;
        this.wavelength = 30; // pixels
        this.k = (2 * Math.PI) / this.wavelength; // wave number
        this.omega = 0.5; // angular frequency

        // Source Configuration
        this.mode = 'double'; // 'double' or 'single'
        this.slitDistance = 60; // distance between two slits
        this.sources = [];

        // Performance optimization: Render at lower resolution
        this.resolutionScale = 0.25; // 1/4th resolution

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.updateSources();
        this.animate();
    }

    resize() {
        // Set canvas physical size to match display size
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Logical size for simulation (smaller for performance)
        this.simWidth = Math.floor(this.width * this.resolutionScale);
        this.simHeight = Math.floor(this.height * this.resolutionScale);

        // Create an offscreen buffer for the pixel manipulation
        this.offCanvas = document.createElement('canvas');
        this.offCanvas.width = this.simWidth;
        this.offCanvas.height = this.simHeight;
        this.offCtx = this.offCanvas.getContext('2d');
        this.imageData = this.offCtx.createImageData(this.simWidth, this.simHeight);

        this.updateSources();
    }

    updateSources() {
        this.sources = [];
        const centerX = this.simWidth / 2;
        const centerY = this.simHeight / 2;
        const sourceY = centerY - this.simHeight * 0.4; // Place sources near top

        // Convert physical slit distance to simulation scale
        const scaledSlitDist = this.slitDistance * this.resolutionScale;

        if (this.mode === 'double') {
            // Two point sources
            this.sources.push({ x: centerX - scaledSlitDist / 2, y: sourceY });
            this.sources.push({ x: centerX + scaledSlitDist / 2, y: sourceY });
        } else if (this.mode === 'single') {
            // Huygens' Principle: Line of point sources
            const numPoints = 15;
            // Treating 'slitDistance' as 'slitWidth' in single mode effectively
            const width = scaledSlitDist;
            const startX = centerX - width / 2;
            const step = width / (numPoints - 1);

            for (let i = 0; i < numPoints; i++) {
                this.sources.push({ x: startX + i * step, y: sourceY });
            }
        }

        // Update wave parameters based on scale
        // Wavelength is in visual pixels, strictly speaking we simulate in scaled pixels
        this.simWavelength = this.wavelength * this.resolutionScale;
        this.k = (2 * Math.PI) / this.simWavelength;
    }

    setMode(mode) {
        this.mode = mode;
        this.updateSources();
    }

    setWavelength(val) {
        this.wavelength = Number(val);
        this.updateSources();
    }

    setSlitDistance(val) {
        this.slitDistance = Number(val);
        this.updateSources();
    }

    setSpeed(val) {
        this.speed = Number(val);
    }

    animate() {
        this.render();
        this.time += this.speed * 0.1;
        requestAnimationFrame(() => this.animate());
    }

    render() {
        const data = this.imageData.data;
        const width = this.simWidth;
        const height = this.simHeight;
        const numSources = this.sources.length;

        // Optimization: Pre-calculate constants
        const k = this.k;
        const timePhase = this.time; // omega * t simplified

        // Loop over every pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let amplitudeSum = 0;

                // Superposition: Sum contributions from all sources
                for (let s = 0; s < numSources; s++) {
                    const src = this.sources[s];
                    const dx = x - src.x;
                    const dy = y - src.y;
                    const r = Math.sqrt(dx * dx + dy * dy);

                    // Wave function: A * sin(kr - wt)
                    // Decay amplitude with distance (1/sqrt(r) for 2D waves, or just 1/r)
                    // Using 1/sqrt(r) for better visualization on screen
                    const decay = 10 / (Math.sqrt(r) + 1);
                    amplitudeSum += decay * Math.sin(k * r - timePhase);
                }

                // Normalise for single slit (many sources)
                if (this.mode === 'single') {
                    amplitudeSum /= (numSources * 0.4);
                }

                // Intensity is proportional to Amplitude squared
                // Map to color (Cyan/Blue theme: 0, 243, 255)
                const intensity = amplitudeSum * amplitudeSum;

                // Visualization multiplier
                const val = Math.min(255, intensity * 500);

                const index = (y * width + x) * 4;

                // Black background, Cyan waves
                // R
                data[index] = 0;
                // G
                data[index + 1] = val * 0.95;
                // B
                data[index + 2] = val;
                // A
                data[index + 3] = 255;
            }
        }

        // Put data onto offscreen canvas
        this.offCtx.putImageData(this.imageData, 0, 0);

        // Draw offscreen canvas to main canvas (scaling up)
        this.ctx.drawImage(this.offCanvas, 0, 0, this.width, this.height);

        // Draw Sources
        this.ctx.fillStyle = '#fff';
        for (let s of this.sources) {
            this.ctx.beginPath();
            // Scale coordinates back up
            this.ctx.arc(s.x / this.resolutionScale, s.y / this.resolutionScale, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    const simulator = new WaveSimulator('waveCanvas');

    // UI References
    const modeSelect = document.getElementById('modeSelect');
    const waveSlider = document.getElementById('wavelengthSlider');
    const waveVal = document.getElementById('wavelengthValue');
    const distSlider = document.getElementById('slitDistanceSlider');
    const distVal = document.getElementById('slitDistanceValue');
    const speedSlider = document.getElementById('speedSlider');
    const speedVal = document.getElementById('speedValue');
    const slitDistGroup = document.getElementById('slitDistGroup');
    const slitLabel = slitDistGroup.querySelector('.label-text');

    // Event Listeners
    modeSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        simulator.setMode(mode);

        // Update UI text based on mode
        if (mode === 'single') {
            slitLabel.textContent = '狹縫寬度 Slit Width ($a$)';
        } else {
            slitLabel.textContent = '狹縫間距 Slit Distance ($d$)';
        }
    });

    waveSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        waveVal.textContent = val + ' px';
        simulator.setWavelength(val);
    });

    distSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        distVal.textContent = val + ' px';
        simulator.setSlitDistance(val);
    });

    speedSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        speedVal.textContent = val + 'x';
        simulator.setSpeed(val);
    });
});
