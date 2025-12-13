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
// Simulation State
const state = {
    currentMode: 'replication', // Default to replication
    isPlaying: false,
    speed: 3,
    molecules: [],
    score: 0,
    activeDNA: null,
    activeRNA: null,
    translation: {
        ribosomeAttached: false,
        currentCodonIndex: 0,
        proteinChain: []
    }
};

const CODON_MAP = {
    'AUG': 'Met', 'GCC': 'Ala', 'UCA': 'Ser', 'UAA': 'Stop',
    'UUU': 'Phe', 'AAA': 'Lys', 'CCC': 'Pro', 'GGG': 'Gly'
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
        ui.instructionText.textContent = "DNA 已解旋！現在拖曳 '游離核苷酸' 到右側模板股進行配對。";
    }
}

class RNAStrand {
    constructor(sequence) {
        this.sequence = sequence;
        this.render();
    }

    render() {
        // Create mRNA container (horizontal strand at bottom)
        let container = document.getElementById('mrna-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'mrna-container';
            container.style.cssText = `
                position: absolute;
                bottom: 15%;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                align-items: center;
            `;
            ui.workspace.appendChild(container);
        }
        container.innerHTML = '';

        // Create backbone (the wavy/ladder structure)
        const backbone = document.createElement('div');
        backbone.style.cssText = `
            display: flex;
            background: linear-gradient(90deg, #4ecca3 0%, #3db892 100%);
            padding: 5px;
            border-radius: 5px;
            margin-bottom: 5px;
        `;

        // Create nucleotide row
        const nucsRow = document.createElement('div');
        nucsRow.id = 'mrna-nucleotides';
        nucsRow.style.cssText = 'display: flex; gap: 2px;';

        this.sequence.forEach((base, index) => {
            const nuc = document.createElement('div');
            nuc.classList.add('nucleotide', base);
            nuc.textContent = base;
            nuc.style.cssText = 'width: 30px; height: 30px; font-size: 0.9rem;';
            nuc.dataset.index = index;
            nucsRow.appendChild(nuc);
        });

        backbone.appendChild(nucsRow);
        container.appendChild(backbone);

        // Add label
        const label = document.createElement('div');
        label.textContent = 'mRNA (信使 RNA)';
        label.style.cssText = 'color: #a0a0a0; font-size: 0.8rem; margin-top: 5px;';
        container.appendChild(label);
    }

    highlightCodon(index) {
        const nucs = document.querySelectorAll('#mrna-nucleotides .nucleotide');
        nucs.forEach(n => n.style.boxShadow = 'none');
        for (let i = 0; i < 3; i++) {
            if (nucs[index + i]) {
                nucs[index + i].style.boxShadow = '0 0 10px 3px yellow';
            }
        }
        // Move ribosome to follow the highlighted codon
        updateRibosomePosition(index);
    }
}

// Translation visualization helper functions
function createRibosome(codonIndex = 0) {
    let ribo = document.getElementById('ribosome');
    if (!ribo) {
        ribo = document.createElement('div');
        ribo.id = 'ribosome';
        ribo.style.cssText = `
            position: absolute;
            bottom: 28%;
            width: 180px;
            height: 80px;
            background: linear-gradient(180deg, #c9a227 0%, #a68b1a 100%);
            border-radius: 40px 40px 20px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #333;
            font-weight: bold;
            font-size: 0.9rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transition: left 0.5s ease;
        `;
        ribo.textContent = '核糖體';
        ui.workspace.appendChild(ribo);
    }
    updateRibosomePosition(codonIndex);
    return ribo;
}

function updateRibosomePosition(codonIndex) {
    const ribo = document.getElementById('ribosome');
    const mrnaContainer = document.getElementById('mrna-container');
    const nucs = document.querySelectorAll('#mrna-nucleotides .nucleotide');

    if (!ribo || !mrnaContainer || nucs.length === 0) return;

    // Calculate position based on the middle of the 3-base codon
    const middleNucIndex = Math.min(codonIndex + 1, nucs.length - 1);
    const nuc = nucs[middleNucIndex];

    if (nuc) {
        const nucRect = nuc.getBoundingClientRect();
        const workspaceRect = ui.workspace.getBoundingClientRect();
        const nucCenterX = nucRect.left + nucRect.width / 2 - workspaceRect.left;

        // Center the ribosome on this position
        ribo.style.left = `${nucCenterX}px`;
        ribo.style.transform = 'translateX(-50%)';
    }
}

function createTRNA(anticodon, aminoAcid, position) {
    const ribo = document.getElementById('ribosome');
    const trna = document.createElement('div');
    trna.className = 'trna-molecule';

    // Position tRNA above the ribosome
    let leftPos = '50%';
    let bottomPos = '55%';

    if (ribo) {
        const riboRect = ribo.getBoundingClientRect();
        const workspaceRect = ui.workspace.getBoundingClientRect();
        const riboCenterX = riboRect.left + riboRect.width / 2 - workspaceRect.left;
        leftPos = `${riboCenterX}px`;
        // Calculate bottom position (above the ribosome)
        const riboTop = workspaceRect.bottom - riboRect.top;
        bottomPos = `${riboTop + 10}px`;
    }

    trna.style.cssText = `
        position: absolute;
        bottom: ${bottomPos};
        left: ${leftPos};
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 50;
        animation: trnaDrop 0.5s ease-out;
    `;

    // Amino acid (pink circle at top)
    const aa = document.createElement('div');
    aa.style.cssText = `
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: #f8b4b4;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.7rem;
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
    `;
    aa.textContent = aminoAcid;
    trna.appendChild(aa);

    // tRNA body (yellow rectangle)
    const body = document.createElement('div');
    body.style.cssText = `
        width: 45px;
        height: 50px;
        background: #f0e68c;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 0.7rem;
        color: #333;
    `;
    body.innerHTML = `<div>tRNA</div>`;
    trna.appendChild(body);

    // Anticodon
    const anticodonDiv = document.createElement('div');
    anticodonDiv.style.cssText = `
        display: flex;
        gap: 1px;
        margin-top: 3px;
    `;
    anticodon.split('').forEach(base => {
        const b = document.createElement('div');
        b.style.cssText = `
            width: 14px;
            height: 14px;
            background: #fff;
            border: 1px solid #333;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.6rem;
            font-weight: bold;
        `;
        b.textContent = base;
        anticodonDiv.appendChild(b);
    });
    trna.appendChild(anticodonDiv);

    ui.workspace.appendChild(trna);
    return trna;
}

function createPeptideChain(aminoAcids) {
    let chain = document.getElementById('peptide-chain');
    if (!chain) {
        chain = document.createElement('div');
        chain.id = 'peptide-chain';
        chain.style.cssText = `
            position: absolute;
            top: 15%;
            left: 30%;
            display: flex;
            gap: 5px;
        `;
        ui.workspace.appendChild(chain);
    }
    chain.innerHTML = '';

    // Label
    const label = document.createElement('div');
    label.style.cssText = 'color: #a0a0a0; font-size: 0.7rem; position: absolute; top: -20px; left: 0;';
    label.textContent = '成長中的肽鏈 (Growing Peptide Chain)';
    chain.appendChild(label);

    aminoAcids.forEach((aa, i) => {
        const aaDiv = document.createElement('div');
        aaDiv.style.cssText = `
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: #f8b4b4;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.7rem;
            font-weight: bold;
            color: #333;
        `;
        aaDiv.textContent = aa;
        chain.appendChild(aaDiv);

        // Add connecting line except for last
        if (i < aminoAcids.length - 1) {
            const line = document.createElement('div');
            line.style.cssText = 'width: 10px; height: 2px; background: #666; align-self: center;';
            chain.appendChild(line);
        }
    });
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

const TOOL_MAPPING = {
    '解旋酶': 'tool-helicase',
    'DNA 聚合酶': 'tool-dna-polymerase',
    '游離核苷酸': 'tool-nucleotides',
    'RNA 聚合酶': 'tool-rna-polymerase',
    '游離 RNA 核苷酸': 'tool-rna-nucleotides',
    '核糖體': 'tool-ribosome',
    '轉運 RNA (tRNA)': 'tool-trna',
    '胺基酸': 'tool-amino-acids'
};

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

    // Drag and Drop for Workspace
    ui.workspace.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
    });

    ui.workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        const toolName = e.dataTransfer.getData('text/plain');
        const rect = ui.workspace.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleToolDrop(toolName, x, y);
    });
}

function switchMode(mode) {
    state.currentMode = mode;
    state.isPlaying = false;
    state.activeDNA = null;
    state.activeRNA = null;
    state.translation = { ribosomeAttached: false, currentCodonIndex: 0, proteinChain: [] };
    state.transcription = null; // Reset transcription state

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
            tools = ['解旋酶', 'DNA 聚合酶', '游離核苷酸'];
            break;
        case 'transcription':
            instruction = "轉錄階段：以 DNA 為模板，使用 RNA 聚合酶 (RNA Polymerase) 合成 mRNA。注意 T 被 U 取代。";
            tools = ['RNA 聚合酶', '游離 RNA 核苷酸'];
            break;
        case 'translation':
            instruction = "轉譯階段：請先拖曳 '核糖體' 至 mRNA 起始端 (AUG)。";
            tools = ['核糖體', '轉運 RNA (tRNA)']; // Simplified tools
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

        // Add specific class for styling
        if (TOOL_MAPPING[toolName]) {
            div.classList.add(TOOL_MAPPING[toolName]);
        }

        div.textContent = toolName;
        div.draggable = true;
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', toolName);
        });
        ui.toolbox.appendChild(div);
    });
}

function initModeEnvironment(mode) {
    ui.workspace.innerHTML = ''; // Clear workspace

    const tip = document.createElement('div');
    tip.className = 'placeholder-text';
    ui.workspace.appendChild(tip);

    if (mode === 'replication' || mode === 'transcription') {
        const sequence = ['A', 'T', 'G', 'C', 'T', 'A', 'G', 'C', 'A', 'T', 'G', 'C'];
        const dna = new DNAStrand(sequence);
        state.activeDNA = dna;

        if (mode === 'replication') {
            tip.textContent = "DNA 結構已建立。請拖曳即將使用的酶至工作區。";
        } else {
            tip.textContent = "DNA 模板已準備。請拖曳 RNA 聚合酶開始轉錄。";
        }

    } else if (mode === 'translation') {
        // mRNA Sequence: AUG (Met) - GCC (Ala) - UCA (Ser) - UAA (Stop)
        const rnaSequence = ['A', 'U', 'G', 'G', 'C', 'C', 'U', 'C', 'A', 'U', 'A', 'A'];
        const rna = new RNAStrand(rnaSequence);
        state.activeRNA = rna;
        tip.textContent = "mRNA 已進入細胞質。請拖曳 '核糖體' 開始轉譯。";
    }
}

function handleToolDrop(tool, x, y) {
    console.log(`Dropped ${tool} at ${x}, ${y}`);
    const tip = document.querySelector('.placeholder-text');

    if (state.currentMode === 'replication') {
        if (tool === '解旋酶') {
            if (state.activeDNA) {
                state.activeDNA.unzip();
                tip.textContent = "DNA 已解旋。請拖曳 '遊離核甘酸' 進行配對。";
            }
        } else if (tool === '游離核苷酸') {
            ui.instructionText.textContent = "點擊右側模板股的鹼基，選擇正確的配對鹼基填入！";
            startMatchingGame();
        }
    } else if (state.currentMode === 'translation') {
        if (tool === '核糖體') {
            if (!state.translation.ribosomeAttached) {
                state.translation.ribosomeAttached = true;
                // Visual feedback: Highlight first codon
                state.activeRNA.highlightCodon(0);
                ui.instructionText.textContent = "核糖體結合！起始密碼子是 AUG。請尋找對應的 '轉運 RNA (tRNA)' (攜帶 Met)。";
                tip.textContent = "請拖曳帶著對應胺基酸的 '轉運 RNA (tRNA)' 至核糖體。";

                // Show floating Ribosome graphic if we had one, for now just highlight
                const ribo = document.createElement('div');
                ribo.classList.add('molecule', 'tool-ribosome');
                ribo.style.position = 'absolute';
                ribo.style.left = '10%';
                ribo.style.top = '40%';
                ribo.textContent = "Ribosome";
                ribo.style.width = '100px';
                ribo.style.height = '60px';
                ui.workspace.appendChild(ribo);

            } else {
                alert("核糖體已經結合了！");
            }
        } else if (tool === '轉運 RNA (tRNA)') {
            if (!state.translation.ribosomeAttached) {
                alert("請先拖曳核糖體！");
                return;
            }
            // Check Match Logic
            checkTranslationMatch();
        }
    }
}

function checkTranslationMatch() {
    const rnaSeq = state.activeRNA.sequence;
    const idx = state.translation.currentCodonIndex;

    if (idx >= rnaSeq.length) {
        alert("轉譯完成！");
        return;
    }

    const codon = rnaSeq.slice(idx, idx + 3).join('');
    const aminoAcid = CODON_MAP[codon];

    if (!aminoAcid) {
        alert("未知密碼子？");
        return;
    }

    if (aminoAcid === 'Stop') {
        alert("遇到終止密碼子 (UAA)！蛋白質合成結束。");
        ui.instructionText.textContent = `蛋白質合成完成！鏈結: ${state.translation.proteinChain.join(' - ')}`;
        return;
    }

    // Simulate correct match for now since we don't have specific tRNA selection UI yet
    // In a full game, user would select tRNA type. Here we assume generic tRNA tool represents the "correct" one for simplicity or trigger a choice.
    // Let's just auto-succeed for the demo flow.

    state.translation.proteinChain.push(aminoAcid);
    ui.instructionText.textContent = `成功配對！加入胺基酸: ${aminoAcid}。尋找下一個對應的 tRNA...`;

    // Visualize Protein
    const proteinDiv = document.createElement('div');
    proteinDiv.textContent = state.translation.proteinChain.join('-');
    proteinDiv.style.position = 'absolute';
    proteinDiv.style.bottom = '20%';
    proteinDiv.style.left = '50%';
    proteinDiv.style.transform = 'translateX(-50%)';
    proteinDiv.style.fontSize = '1.5rem';
    proteinDiv.style.color = '#e94560';

    const existing = document.getElementById('protein-chain');
    if (existing) existing.remove();
    proteinDiv.id = 'protein-chain';
    ui.workspace.appendChild(proteinDiv);

    state.translation.currentCodonIndex += 3;
    if (state.translation.currentCodonIndex < rnaSeq.length) {
        state.activeRNA.highlightCodon(state.translation.currentCodonIndex);
    } else {
        alert("序列結束。");
    }
}

function startMatchingGame() {
    // Simplified logic
    alert("配對遊戲邏輯：請點擊未配對的鹼基來填入對應核苷酸。");
}

function toggleSimulation() {
    state.isPlaying = !state.isPlaying;
    const btn = document.getElementById('btn-start');
    btn.textContent = state.isPlaying ? "暫停" : "開始模擬";
    ui.statusBar.textContent = state.isPlaying ? "模擬執行中..." : "模擬已暫停";

    if (state.isPlaying) {
        runSimulationLoop();
    }
}

function runSimulationLoop() {
    if (!state.isPlaying) return;

    const delay = 1000 / state.speed;

    if (state.currentMode === 'replication') {
        // Auto-unzip DNA step by step
        if (state.activeDNA && state.activeDNA.basePairs) {
            const unzippedCount = document.querySelectorAll('.base-pair.unzipped').length;
            if (unzippedCount < state.activeDNA.basePairs.length) {
                state.activeDNA.basePairs[unzippedCount].classList.add('unzipped');
                ui.instructionText.textContent = `DNA 解旋中... (${unzippedCount + 1}/${state.activeDNA.basePairs.length})`;
            } else {
                ui.instructionText.textContent = "DNA 完全解旋！模擬完成。";
                state.isPlaying = false;
                document.getElementById('btn-start').textContent = "開始模擬";
                ui.statusBar.textContent = "模擬完成";
                return;
            }
        }
    } else if (state.currentMode === 'translation') {
        // Auto-attach ribosome if not attached
        if (state.activeRNA && !state.translation.ribosomeAttached) {
            state.translation.ribosomeAttached = true;
            state.activeRNA.highlightCodon(0);
            ui.instructionText.textContent = "核糖體結合至 mRNA 起始密碼子 AUG...";

            // Use the new ribosome visualization
            createRibosome();

        } else if (state.activeRNA && state.translation.ribosomeAttached) {
            const rnaSeq = state.activeRNA.sequence;
            const idx = state.translation.currentCodonIndex;

            if (idx >= rnaSeq.length) {
                ui.instructionText.textContent = `轉譯完成！蛋白質鏈: ${state.translation.proteinChain.join(' - ')}`;
                state.isPlaying = false;
                document.getElementById('btn-start').textContent = "開始模擬";
                ui.statusBar.textContent = "模擬完成";
                return;
            }

            const codon = rnaSeq.slice(idx, idx + 3).join('');
            const aminoAcid = CODON_MAP[codon];

            // Calculate anticodon (complementary to codon)
            const anticodonMap = { 'A': 'U', 'U': 'A', 'G': 'C', 'C': 'G' };
            const anticodon = codon.split('').map(b => anticodonMap[b]).join('');

            if (aminoAcid === 'Stop') {
                ui.instructionText.textContent = `遇到終止密碼子 (${codon})！蛋白質合成結束。`;
                // Remove old tRNAs
                document.querySelectorAll('.trna-molecule').forEach(t => t.remove());
                state.isPlaying = false;
                document.getElementById('btn-start').textContent = "開始模擬";
                ui.statusBar.textContent = "模擬完成";
                return;
            }

            if (aminoAcid) {
                state.translation.proteinChain.push(aminoAcid);
                ui.instructionText.textContent = `密碼子 ${codon} (反密碼子 ${anticodon}) → 胺基酸 ${aminoAcid}`;

                // Remove old tRNAs and create new one
                document.querySelectorAll('.trna-molecule').forEach(t => t.remove());
                createTRNA(anticodon, aminoAcid, 1);

                // Update peptide chain visualization
                createPeptideChain(state.translation.proteinChain);

                state.translation.currentCodonIndex += 3;
                state.activeRNA.highlightCodon(state.translation.currentCodonIndex);
            }
        }
    } else if (state.currentMode === 'transcription') {
        // Transcription: synthesize mRNA from DNA template
        if (state.activeDNA && state.activeDNA.sequence) {
            if (!state.transcription) {
                state.transcription = { currentIndex: 0, mRNASequence: [] };
            }

            const idx = state.transcription.currentIndex;
            const dnaSeq = state.activeDNA.sequence;

            if (idx < dnaSeq.length) {
                // Get complementary RNA base (A->U, T->A, C->G, G->C)
                const dnaBase = dnaSeq[idx];
                let rnaBase;
                if (dnaBase === 'A') rnaBase = 'U';
                else if (dnaBase === 'T') rnaBase = 'A';
                else if (dnaBase === 'C') rnaBase = 'G';
                else if (dnaBase === 'G') rnaBase = 'C';

                state.transcription.mRNASequence.push(rnaBase);

                // Visualize mRNA being synthesized (vertical, next to DNA)
                let mrnaDiv = document.getElementById('mrna-strand');
                if (!mrnaDiv) {
                    mrnaDiv = document.createElement('div');
                    mrnaDiv.id = 'mrna-strand';
                    mrnaDiv.style.cssText = 'position:absolute;top:50%;right:15%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:2px;';
                    ui.workspace.appendChild(mrnaDiv);
                }

                const nucDiv = document.createElement('div');
                nucDiv.classList.add('nucleotide', rnaBase);
                nucDiv.textContent = rnaBase;
                nucDiv.style.margin = '2px';
                mrnaDiv.appendChild(nucDiv);

                ui.instructionText.textContent = `轉錄中: DNA ${dnaBase} → mRNA ${rnaBase} (${idx + 1}/${dnaSeq.length})`;
                state.transcription.currentIndex++;
            } else {
                ui.instructionText.textContent = `轉錄完成！mRNA 序列: ${state.transcription.mRNASequence.join('')}`;
                state.isPlaying = false;
                document.getElementById('btn-start').textContent = "開始模擬";
                ui.statusBar.textContent = "模擬完成";
                return;
            }
        }
    }

    setTimeout(runSimulationLoop, delay);
}

function resetSimulation() {
    if (state.currentMode) {
        switchMode(state.currentMode);
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);

