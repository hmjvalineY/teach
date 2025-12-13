/**
 * Central Dogma Simulation script
 * Handles the logic for DNA replication, Transcription, and Translation.
 */

// Simulation Constants
const DNA_BASES = ['A', 'T', 'C', 'G'];
const RNA_BASES = ['A', 'U', 'C', 'G'];
const BASE_PAIRING = {
    'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C',
    'U': 'A' // For RNA-DNA pairing checks (RNA U binds to DNA A)
};

// Simulation State
const state = {
    currentMode: 'replication', // Default to replication
    isPlaying: false,
    speed: 3,
    molecules: [],
    score: 0
};

// DOM Elements
const ui = {
    workspace: document.getElementById('workspace'),
    infoPanel: document.getElementById('info-panel'),
    instructionText: document.getElementById('instruction-text'),
    navButtons: document.querySelectorAll('.nav-btn'),
    toolbox: document.querySelector('.tool-grid'),
    statusBar: document.getElementById('status-bar')
};

// Classes

class Molecule {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.element = this.createDOM();
    }

    createDOM() {
        const el = document.createElement('div');
        el.classList.add('molecule', this.type);
        el.style.left = `${this.x}px`;
        el.style.top = `${this.y}px`;
        return el;
    }

    update() {
        // Basic movement logic if needed
    }
}

class DNAStrand {
    constructor(sequence) {
        this.sequence = sequence; // Array of bases
        this.basePairs = [];
        this.init();
    }

    init() {
        console.log("Initializing DNA Strand with sequence:", this.sequence);
        this.render();
    }

    render() {
        // Create container if not exists
        let container = document.querySelector('.dna-container');
        if (!container) {
            container = document.createElement('div');
            container.classList.add('dna-container');
            ui.workspace.appendChild(container);
        }
        container.innerHTML = ''; // Clear previous

        this.sequence.forEach((base, index) => {
            const pairRow = document.createElement('div');
            pairRow.classList.add('base-pair');
            pairRow.dataset.index = index;

            // Left Node (Coding Strand)
            const leftBackbone = document.createElement('div');
            leftBackbone.classList.add('backbone');

            const leftBase = document.createElement('div');
            leftBase.classList.add('nucleotide', base);
            leftBase.textContent = base;

            // Hydrogen Bond
            const bond = document.createElement('div');
            bond.classList.add('bond');

            // Right Node (Template/Complementary)
            const rightBase = document.createElement('div');
            const compBase = BASE_PAIRING[base];
            rightBase.classList.add('nucleotide', compBase);
            rightBase.textContent = compBase;

            const rightBackbone = document.createElement('div');
            rightBackbone.classList.add('backbone');

            // Append all
            pairRow.appendChild(leftBackbone);
            pairRow.appendChild(leftBase);
            pairRow.appendChild(bond);
            pairRow.appendChild(rightBase);
            pairRow.appendChild(rightBackbone);

            container.appendChild(pairRow);
            this.basePairs.push(pairRow);
        });
    }

    unzip() {
        // Animation to separate strands
        this.basePairs.forEach((row, i) => {
            setTimeout(() => {
                row.classList.add('unzipped');
            }, i * 100);
        });
        ui.instructionText.textContent = "DNA 已解旋！現在拖曳 'Free Nucleotides' 到右側模板股進行配對。";
    }
}

class Enzyme {
    constructor(name, functionLogic) {
        this.name = name;
        this.functionLogic = functionLogic;
    }

    activate() {
        console.log(`${this.name} activated.`);
        this.functionLogic();
    }
}

// Controller Functions

function init() {
    console.log("Bio-Lab Initialized");
    setupEventListeners();
    // Start with replication mode active
    switchMode('replication');
}

function setupEventListeners() {
    // Nav Buttons
    document.getElementById('btn-replication').addEventListener('click', () => switchMode('replication'));
    document.getElementById('btn-transcription').addEventListener('click', () => switchMode('transcription'));
    document.getElementById('btn-translation').addEventListener('click', () => switchMode('translation'));

    // Control Buttons
    document.getElementById('btn-start').addEventListener('click', toggleSimulation);
    document.getElementById('btn-reset').addEventListener('click', resetSimulation);
    document.getElementById('speed-range').addEventListener('input', (e) => {
        state.speed = parseInt(e.target.value);
        ui.statusBar.textContent = `Simulation Speed: ${state.speed}`;
    });
}

function switchMode(mode) {
    state.currentMode = mode;
    state.isPlaying = false;

    // Update UI
    ui.navButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');

    // Clear Workspace
    ui.workspace.innerHTML = '';

    ui.statusBar.textContent = `Mode switched to: ${mode.toUpperCase()}`;

    loadModeAssets(mode);
}

function loadModeAssets(mode) {
    let instruction = "";
    let tools = [];

    switch (mode) {
        case 'replication':
            instruction = "DNA 複製階段：請使用解旋酶 (Helicase) 解開 DNA 雙螺旋，並使用 DNA 聚合酶 (DNA Polymerase) 合成新的股。";
            tools = ['Helicase', 'DNA Polymerase', 'Free Nucleotides'];
            break;
        case 'transcription':
            instruction = "轉錄階段：以 DNA 為模板，使用 RNA 聚合酶 (RNA Polymerase) 合成 mRNA。注意 T 被 U 取代。";
            tools = ['RNA Polymerase', 'Free RNA Nucleotides'];
            break;
        case 'translation':
            instruction = "轉譯階段：mRNA 在核糖體 (Ribosome) 上被讀取，tRNA 搬運胺基酸來合成蛋白質鏈。";
            tools = ['Ribosome', 'tRNA', 'Amino Acids'];
            break;
    }

    ui.instructionText.textContent = instruction;
    renderToolbox(tools);
    initModeEnvironment(mode);
}

function renderToolbox(tools) {
    ui.toolbox.innerHTML = '';
    tools.forEach(toolName => {
        const div = document.createElement('div');
        div.classList.add('tool-item');
        div.textContent = toolName;
        div.draggable = true;
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', toolName);
        });
        ui.toolbox.appendChild(div);
    });
}

function initModeEnvironment(mode) {
    const titleObj = document.createElement('div');
    titleObj.style.color = '#4ecca3';
    titleObj.style.fontSize = '2rem';
    titleObj.style.textAlign = 'center';
    titleObj.style.marginTop = '20%';
    titleObj.textContent = `${mode.toUpperCase()} 环境初始化中...`;
    ui.workspace.appendChild(titleObj);

    // In a real implementation, we would render the initial DNA strands here
}

function handleToolDrop(tool, x, y) {
    console.log(`Dropped ${tool} at ${x}, ${y}`);

    if (state.currentMode === 'replication') {
        if (tool === 'Helicase') {
            if (state.activeDNA) {
                state.activeDNA.unzip();
            }
        } else if (tool === 'Free Nucleotides') {
            // Trigger nucleotide matching game/mode
            ui.instructionText.textContent = "點擊右側模板股的鹼基，選擇正確的配對鹼基填入！";
            startMatchingGame();
        }
    }
}

function startMatchingGame() {
    // Simplified logic: Click a base on right side, popup choice for A/T/C/G
    // For now, let's just alert
    alert("Matching Game Logic Placeholder: Click on the unzipped strands to place nucleotides.");
}

function toggleSimulation() {
    state.isPlaying = !state.isPlaying;
    const btn = document.getElementById('btn-start');
    btn.textContent = state.isPlaying ? "暫停" : "開始模擬";
    ui.statusBar.textContent = state.isPlaying ? "Simulation Running..." : "Simulation Paused";
}

function resetSimulation() {
    if (state.currentMode) {
        switchMode(state.currentMode);
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);
