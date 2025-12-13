import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Setup Main Scene
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.02); // Distance fog for depth

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(10, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x050505, 1);
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Constants for Wave
const WAVE_LENGTH = 10;
const NUM_SEGMENTS = 100; // Number of arrows
const AMP = 2;
const FREQ = 1; // Spatial frequency
const WAVE_SPEED = 2; // Default speed

// Groups
const eFieldGroup = new THREE.Group();
const bFieldGroup = new THREE.Group();
const axisGroup = new THREE.Group();

scene.add(eFieldGroup);
scene.add(bFieldGroup);
scene.add(axisGroup);

// Create Axis (Z-Axis is propagation)
const axisLength = 20;
const axisMaterial = new THREE.LineBasicMaterial({ color: 0x44ff88, opacity: 0.5, transparent: true });
const axisPoints = [new THREE.Vector3(0, 0, -axisLength / 2), new THREE.Vector3(0, 0, axisLength / 2)];
const axisGeometry = new THREE.BufferGeometry().setFromPoints(axisPoints);
const axisLine = new THREE.Line(axisGeometry, axisMaterial);
axisGroup.add(axisLine);

// Helper function to create arrows
function createArrows(color, isVertical) {
    const arrows = [];
    const group = isVertical ? eFieldGroup : bFieldGroup;

    // Geometry for straight line segments (we will update these every frame)
    // Actually, let's use ArrowHelper, but for performance with many arrows it might be heavy.
    // Lighter approach: Line segments.
    // But ArrowHelper looks better. Let's try ArrowHelper for 100 items, should be fine on desktop.

    // Optimization: Reuse geometry? ArrowHelper constructs a lot.
    // Let's use simple Lines for shafts + Points or ConeGeometry for heads if needed.
    // For simplicity and aesthetic, Thick lines or just standard Lines. 
    // Let's use standard Lines for the field vectors to keep it clean.

    for (let i = 0; i < NUM_SEGMENTS; i++) {
        const geometry = new THREE.BufferGeometry();
        // Initial dummy points
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));
        const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
        const line = new THREE.Line(geometry, material);

        // Store metadata
        line.userData = {
            index: i,
            isVertical: isVertical
        };

        group.add(line);
        arrows.push(line);

        // Add a small sphere at tip for visibility? Or maybe just the line is enough.
        // Let's add a small dot at the tip.
        const dotGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: color });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        group.add(dot);
        line.userData.dot = dot;
    }
    return arrows;
}

const eArrows = createArrows(0xff5555, true); // E field (Vertical, Y)
const bArrows = createArrows(0x55aaff, false); // B field (Horizontal, X)

// Animation State
let time = 0;
let speed = 1.0;

// Grid Helper
const gridHelper = new THREE.GridHelper(40, 40, 0x222222, 0x111111);
scene.add(gridHelper);

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// UI Inputs
const speedSlider = document.getElementById('speed-slider');
if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
        speed = parseFloat(e.target.value);
    });
}

const toggleE = document.getElementById('toggle-e');
if (toggleE) {
    toggleE.addEventListener('change', (e) => {
        eFieldGroup.visible = e.target.checked;
    });
}

const toggleB = document.getElementById('toggle-b');
if (toggleB) {
    toggleB.addEventListener('change', (e) => {
        bFieldGroup.visible = e.target.checked;
    });
}


// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    time += 0.05 * speed;
    controls.update();

    // Update Arrow Positions
    // Z range: -10 to +10
    const startZ = -10;
    const endZ = 10;
    const arraySpan = endZ - startZ;
    const step = arraySpan / NUM_SEGMENTS;

    // We want the wave to propagate towards +Z.
    // Phase = kz - wt
    // k = 2PI / lambda
    const k = (2 * Math.PI) / WAVE_LENGTH;

    for (let i = 0; i < NUM_SEGMENTS; i++) {
        const z = startZ + i * step;
        const phase = k * z - time;

        // E field in Y axis
        const val = AMP * Math.sin(phase);

        // Update E arrow (Red)
        // Position: (0, 0, z) -> (0, val, z)
        const eLine = eArrows[i];
        const ePositions = eLine.geometry.attributes.position.array;

        // Start point (on axis)
        ePositions[0] = 0; ePositions[1] = 0; ePositions[2] = z;
        // End point (tip)
        ePositions[3] = 0; ePositions[4] = val; ePositions[5] = z;
        eLine.geometry.attributes.position.needsUpdate = true;

        if (eLine.userData.dot) {
            eLine.userData.dot.position.set(0, val, z);
        }

        // Update B arrow (Blue)
        // B is perpendicular to E. If E is Y, B is X.
        // They are in phase.
        const bLine = bArrows[i];
        const bPositions = bLine.geometry.attributes.position.array;

        // Start point
        bPositions[0] = 0; bPositions[1] = 0; bPositions[2] = z;
        // End point
        bPositions[3] = val; bPositions[4] = 0; bPositions[5] = z;
        bLine.geometry.attributes.position.needsUpdate = true;

        if (bLine.userData.dot) {
            bLine.userData.dot.position.set(val, 0, z);
        }
    }

    renderer.render(scene, camera);
}

animate();
