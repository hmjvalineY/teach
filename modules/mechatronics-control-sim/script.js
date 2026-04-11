// Mechatronics & Control Simulation

// Global State
const state = {
    running: false,
    map: 'empty', // 'empty', 'line-follow', 'maze'
    program: [],
    currentInstruction: 0,
    startTime: 0,
    // Sensors
    sensorL: 0,
    sensorR: 0,
};

// Robot Configuration
const robot = {
    x: 400,
    y: 300,
    angle: 0, // Radians, 0 is right
    width: 40,
    height: 40,
    speedLeft: 0,
    speedRight: 0,
    maxSpeed: 5,
    color: '#00f2ff'
};

// Canvas Setup
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// Helper Classes
class Interpreter {
    constructor() {
        this.commands = [];
        this.commandIndex = 0;
        this.timeoutId = null;
    }

    async parseAndRun(code) {
        // Simple line parser
        const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));

        // Reset state
        robot.speedLeft = 0;
        robot.speedRight = 0;

        // This is a naive implementation. For a real interpreter we'd need a stronger parser.
        // For this demo, we will use eval() carefully wrapped or a custom parser.
        // To support "wait", we wrap it in an async function.

        log("Running program...");

        const asyncHeader = "(async () => { try { \n";
        const asyncFooter = "\n } catch(e) { logError(e); } })();";

        // Transform custom commands to internal functions
        // motor(l, r) -> await _motor(l, r)
        // wait(ms) -> await _wait(ms)

        let processedCode = code
            .replace(/motor\(([^)]+)\);?/g, "await _motor($1);")
            .replace(/wait\(([^)]+)\);?/g, "await _wait($1);")
            .replace(/log\(([^)]+)\);?/g, "await _log($1);");

        const fullScript = asyncHeader + processedCode + asyncFooter;

        try {
            eval(fullScript); // Note: Safe only because it's client-side and sandboxed in browser context
        } catch (e) {
            logError(e);
        }
    }
}

// Internal API for the Robot (Available to Eval)
const _motor = async (left, right) => {
    if (!state.running) return;
    robot.speedLeft = left / 20; // Scale down input (e.g. 100 -> 5)
    robot.speedRight = right / 20;
    await new Promise(r => setTimeout(r, 10)); // Minimal delay to yield
};

const _wait = (ms) => {
    return new Promise(resolve => {
        if (!state.running) return;
        setTimeout(resolve, ms);
    });
};

const _log = async (msg) => {
    log(msg);
};

// UI Initialization
window.onload = () => {
    initCanvas();
    setupEventListeners();
    requestAnimationFrame(gameLoop);
};

function initCanvas() {
    // Fill background defaults
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setupEventListeners() {
    document.getElementById('run-btn').addEventListener('click', runProgram);
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
    document.getElementById('map-select').addEventListener('change', (e) => {
        state.map = e.target.value;
        resetSimulation();
    });
}

function insertCode(snippet) {
    const textarea = document.getElementById('code-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Insert text
    textarea.value = text.substring(0, start) + snippet + "\n" + text.substring(end);

    // Move cursor after
    textarea.selectionStart = textarea.selectionEnd = start + snippet.length + 1;
    textarea.focus();
}

function runProgram() {
    if (state.running) return;

    state.running = true;
    const code = document.getElementById('code-input').value;
    const interpreter = new Interpreter();
    interpreter.parseAndRun(code);
}

function resetSimulation() {
    state.running = false;
    robot.x = 400;
    robot.y = 500; // Start at bottom
    robot.angle = -Math.PI / 2; // Face UP
    robot.speedLeft = 0;
    robot.speedRight = 0;

    // Force stop promises by not resolving? (Browser handles GC)
    // In a real robust system we'd need a cancellation token.

    log("Simulation Reset.");
}

// Game Loop
function gameLoop() {
    updatePhysics();
    render();
    requestAnimationFrame(gameLoop);
}

function updatePhysics() {
    // Differential Drive Kinematics
    // v = (v_r + v_l) / 2
    // w = (v_r - v_l) / L (L = width between wheels)

    const vLeft = robot.speedLeft;
    const vRight = robot.speedRight;

    const v = (vRight + vLeft) / 2;
    const w = (vRight - vLeft) / robot.width;

    robot.x += v * Math.cos(robot.angle);
    robot.y += v * Math.sin(robot.angle);
    robot.angle += w;

    // Boundary checks
    if (robot.x < 0) robot.x = 0;
    if (robot.x > canvas.width) robot.x = canvas.width;
    if (robot.y < 0) robot.y = 0;
    if (robot.y > canvas.height) robot.y = canvas.height;

    // Simulate Sensors (Simple Version)
    // Sensor position relative to center
    const sensorDist = 25;
    const sensorL_x = robot.x + sensorDist * Math.cos(robot.angle - 0.5);
    const sensorL_y = robot.y + sensorDist * Math.sin(robot.angle - 0.5);

    const sensorR_x = robot.x + sensorDist * Math.cos(robot.angle + 0.5);
    const sensorR_y = robot.y + sensorDist * Math.sin(robot.angle + 0.5);

    // Read Map for Sensor Values
    // Check pixel data at sensor pos? Slow. better to use math for shapes.
    // For now, random noise + simulated line
    state.sensorL = getMapValueAt(sensorL_x, sensorL_y);
    state.sensorR = getMapValueAt(sensorR_x, sensorR_y);

    // Update UI
    document.getElementById('sensor-l-disp').textContent = `L-Sensor: ${Math.floor(state.sensorL)}`;
    document.getElementById('sensor-r-disp').textContent = `R-Sensor: ${Math.floor(state.sensorR)}`;
}

function getMapValueAt(x, y) {
    if (state.map === 'empty') return 255; // White floor

    if (state.map === 'line-follow') {
        // Draw a virtual oval track
        // Check distance from track center curve
        // Ellipse: (x-400)^2 / 300^2 + (y-300)^2 / 200^2 = 1
        // Line width ~ 20px

        // Simple circle for test
        const dx = x - 400;
        const dy = y - 300;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dist - 200) < 15) {
            return 0; // Black line
        }
    }

    return 255;
}

function render() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Map
    if (state.map === 'line-follow') {
        ctx.beginPath();
        ctx.arc(400, 300, 200, 0, Math.PI * 2);
        ctx.lineWidth = 30;
        ctx.strokeStyle = '#333'; // Dark Grey Line
        ctx.stroke();
    }

    // Draw Robot
    ctx.save();
    ctx.translate(robot.x, robot.y);
    ctx.rotate(robot.angle);

    // Body
    ctx.fillStyle = robot.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = robot.color;
    ctx.fillRect(-robot.width / 2, -robot.height / 2, robot.width, robot.height);

    // Wheels
    ctx.fillStyle = '#333';
    ctx.fillRect(-5, -25, 10, 5); // Left
    ctx.fillRect(-5, 20, 10, 5);  // Right

    // Direction indicator
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.fill();

    ctx.restore();

    // Debug Sensors
    if (document.getElementById('show-sensors').checked) {
        const sensorDist = 25;
        const lx = robot.x + sensorDist * Math.cos(robot.angle - 0.5);
        const ly = robot.y + sensorDist * Math.sin(robot.angle - 0.5);
        const rx = robot.x + sensorDist * Math.cos(robot.angle + 0.5);
        const ry = robot.y + sensorDist * Math.sin(robot.angle + 0.5);

        ctx.fillStyle = 'red';
        ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'green';
        ctx.beginPath(); ctx.arc(rx, ry, 3, 0, Math.PI * 2); ctx.fill();
    }
}

function log(msg) {
    const consoleDiv = document.getElementById('console');
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = `> ${msg}`;
    consoleDiv.appendChild(line);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function logError(msg) {
    const consoleDiv = document.getElementById('console');
    const line = document.createElement('div');
    line.className = 'log-line error';
    line.innerText = `> ERROR: ${msg}`;
    consoleDiv.appendChild(line);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}
